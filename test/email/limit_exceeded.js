var assert = require('assert');
var nock = require('nock');
var emailClient = require("../../lib/index").Email;
var MessagingServiceStatus = require('../../lib/models/messaging_service_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;

describe('email services should provide feedback when user exceeds sending limit', function() {

	it('should catch a limit exceeded error from Sendgrid', function(done) {
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {
			"sendgrid": {
				"api_user": 'user',
				"api_key": 'key'
			}
		});
		nock('https://api.sendgrid.com/api')
			.post('/mail.send.json')
			.reply(400, {"message": "error", "errors": ["Maximum credits exceeded"]});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, ["sendgrid"]);
		emailClient.initialize()
		emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.LIMIT_EXCEEDED);
			done()
		})
	})

	it('should catch a limit exceeded error from Mailgun', function(done) {
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {
			"mailgun": {
				"api_key": 'key',
				"domain": 'domain'
			}
		});
		nock('https://api.mailgun.net')
			.filteringPath(function(path) { return '/'; })
			.post('/')
			.reply(400, {'message': 'Message limit reached.'});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, ["mailgun"]);
		emailClient.initialize()
		emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.LIMIT_EXCEEDED);
			done()
		})
	})

	it('should catch a limit exceeded error from Mandrill', function(done) {
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {
			"mandrill": {
				"api_key": 'key'
			}
		});
		nock('https://mandrillapp.com/api/1.0')
			.post('/messages/send.json')
			.reply(400, {"status": "error", "code": 11, "name": "PaymentRequired", "message": "Some message."});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, ["mandrill"]);
		emailClient.initialize()
		emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.LIMIT_EXCEEDED);
			done()
		})
	})

	it('should catch a limit exceeded error from Postmark', function(done) {
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {
			"postmark": {
				"server_key": "123"
			}
		});
		nock('https://api.postmarkapp.com').filteringRequestBody(/.*/, '*')
			.post('/email')
			.reply(422, {"ErrorCode": 405, "Message": "Some explanation."} );
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, ["postmark"]);
		emailClient.initialize()
		emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.LIMIT_EXCEEDED);
			done()
		})
	})
})