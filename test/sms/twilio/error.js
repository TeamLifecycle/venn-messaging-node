var assert = require("assert")
var nock = require("nock")
var client = require("../../../lib/index").SMS;
var MessagingUserStatus = require('../../../lib/models/messaging_user_status');
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status');
var StatusCodes = (new MessagingServiceStatus()).StatusCodes;
var UserCodes = (new MessagingUserStatus()).StatusCodes;

describe('Twilio errors', function () {

	it('when no from number in code nor database', function (done) {
		nock.cleanAll()
		nock('https://api.getvenn.io/v1')
			.get('/keys/sms')
			.reply(200, {
				"twilio": {
					"account_sid": "sldkfjdslkjf",
					"auth_token": "sldkfjdslkjf"
				},
				"nexmo": {
					"api_key": "sldkfjdslkjf",
					"api_secret": "sldkfjdslkjf"
				}
			});
		nock('https://api.twilio.com:443')
			.post('/2010-04-01/Accounts/sldkfjdslkjf/Messages.json')
			.reply(201, [{"status": "sent"}] );
		nock('https://rest.nexmo.com/sms/json')
			.post('')
			.reply(200, {"message": "success"});
		nock('https://api.getvenn.io/v1')
			.get('/priority/sms')
			.reply(200, [ "twilio"]);

		client.initialize()
		client.send({to:"15138853322", message:"message-13579"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err.code, UserCodes.MISSING)
			done();
		})
	})

	it('when bad to number', function (done) {
		nock.cleanAll()
		nock('https://api.getvenn.io/v1')
			.get('/keys/sms')
			.reply(200, {
				"twilio": {
					"account_sid": "sldkfjdslkjf",
					"auth_token": "sldkfjdslkjf"
				},
				"nexmo": {
					"api_key": "sldkfjdslkjf",
					"api_secret": "sldkfjdslkjf"
				}
			});
		nock('https://api.twilio.com:443')
			.post('/2010-04-01/Accounts/sldkfjdslkjf/Messages.json')
			.reply(201, [{"status": "sent"}] );
		nock('https://rest.nexmo.com/sms/json')
			.post('')
			.reply(200, {"message": "success"});
		nock('https://api.getvenn.io/v1')
			.get('/priority/sms')
			.reply(200, [ "twilio"]);

		client.initialize()
		client.send({to:"15138853322923042903432", from: "15135549122", message:"message-13579"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err.code, UserCodes.INVALID);
			assert.equal(err.message, 'Invalid "to" phone number: 15138853322923042903432');
			done()
		})
	})

	it('when bad from number', function (done) {
		nock.cleanAll()
		nock('https://api.getvenn.io/v1')
			.get('/keys/sms')
			.reply(200, {
				"twilio": {
					"account_sid": "sldkfjdslkjf",
					"auth_token": "sldkfjdslkjf"
				},
				"nexmo": {
					"api_key": "sldkfjdslkjf",
					"api_secret": "sldkfjdslkjf"
				}
			});
		nock('https://api.twilio.com:443')
			.post('/2010-04-01/Accounts/sldkfjdslkjf/Messages.json')
			.reply(201, [{"status": "sent"}] );
		nock('https://rest.nexmo.com/sms/json')
			.post('')
			.reply(200, {"message": "success"});
		nock('https://api.getvenn.io/v1')
			.get('/priority/sms')
			.reply(200, [ "twilio"]);

		client.initialize()
		client.send({to:"15135549122", from: "2309423098493840923", message:"message-13579"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err.code, UserCodes.INVALID);
			assert.equal(err.message, 'Invalid "from" phone number: 2309423098493840923');
			done()
		})
	})

	it("when from number is formatted correctly but isn't a valid twilio number associated with your account", function (done) {
		nock.cleanAll();
		nock('https://api.getvenn.io/v1')
			.get('/keys/sms')
			.reply(200, {
				"twilio": {
					"account_sid": "sldkfjdslkjf",
					"auth_token": "sldkfjdslkjf"
				}
			});
		nock('https://api.twilio.com:443')
			.post('/2010-04-01/Accounts/sldkfjdslkjf/Messages.json')
			.reply(401, {'status': 401, 'message': "'From' phone number not verified", 'code': 21606, 'moreInfo': 'https://www.twilio.com/docs/errors/21606'});
		nock('https://api.getvenn.io/v1')
			.get('/priority/sms')
			.reply(200, [ "twilio"]);

		client.initialize();
		client.send({to:"15135549122", from: "12345678900", message:"message-13579"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.notEqual(err[0], undefined);
			assert.equal(err[0].code, StatusCodes.DATA_REJECTED);
			done()
		})
	})

	it('when to number is formatted correctly but has an invalid area code', function (done) {
		nock.cleanAll();
		nock('https://api.getvenn.io/v1')
			.get('/keys/sms')
			.reply(200, {
				"twilio": {
					"account_sid": "sldkfjdslkjf",
					"auth_token": "sldkfjdslkjf"
				}
			});
		nock('https://api.twilio.com:443')
			.post('/2010-04-01/Accounts/sldkfjdslkjf/Messages.json')
			.reply(401, {'status': 401, 'message': "'To' phone number has invalid area code", 'code': 21211, 'moreInfo': 'https://www.twilio.com/docs/errors/21211'});
		nock('https://api.getvenn.io/v1')
			.get('/priority/sms')
			.reply(200, [ "twilio"]);

		client.initialize();
		client.send({to:"10142849070", from: "15135549122", message:"message-13579"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.notEqual(err[0], undefined);
			assert.equal(err[0].code, StatusCodes.DATA_REJECTED);
			done()
		})
	})

	it('when to number is formatted correctly but has an invalid main number', function (done) {
		nock.cleanAll();
		nock('https://api.getvenn.io/v1')
			.get('/keys/sms')
			.reply(200, {
				"twilio": {
					"account_sid": "sldkfjdslkjf",
					"auth_token": "sldkfjdslkjf"
				}
			});
		nock('https://api.twilio.com:443')
			.post('/2010-04-01/Accounts/sldkfjdslkjf/Messages.json')
			.reply(401, {'status': 401, 'message': "'To' phone number has invalid main number", 'code': 21211, 'moreInfo': 'https://www.twilio.com/docs/errors/21211'});
		nock('https://api.getvenn.io/v1')
			.get('/priority/sms')
			.reply(200, [ "twilio"]);

		client.initialize();
		client.send({to:"10142849070", from: "15135549122", message:"message-13579"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.notEqual(err[0], undefined);
			assert.equal(err[0].code, StatusCodes.DATA_REJECTED);
			done()
		})
	})
})