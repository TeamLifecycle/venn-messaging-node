var assert = require("assert")
var nock = require("nock")
var client = require("../../../lib/index")().SMS;

describe('send with twilio', function () {

	it('when from number in database', function (done) {
		nock.cleanAll()
		nock('https://api.getvenn.io/v1')
			.get('/keys/sms')
			.reply(200, {
				"twilio": {
					"account_sid": "sldkfjdslkjf",
					"auth_token": "sldkfjdslkjf",
					"from_phone": "15139455543"
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
			.reply(200, [ "twilio", "nexmo"]);

		client.initialize()
		client.send({to:"15138853322", message:"message-13579"}, function(err, result){
			assert.notEqual(result, undefined);
			assert.equal(result.service, "twilio");
			assert.equal(Object.keys(client.services).length, 2);
			done()
		})
	})

	it('when from number input in code', function (done) {
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
			.reply(200, [ "twilio", "nexmo"]);

		client.initialize()
		client.send({to:"15138853322", from: "15134552211", message:"message-13579"}, function(err, result){
			assert.notEqual(result, undefined);
			assert.equal(result.service, "twilio");
			assert.equal(Object.keys(client.services).length, 2);
			done()
		})
	})
})