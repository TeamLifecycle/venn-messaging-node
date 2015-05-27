var assert = require("assert")
var nock = require("nock")
var client = require("../../lib/index").SMS;
var MessagingServiceStatus = require('../../lib/models/messaging_service_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;

describe('sms services should provide feedback when user exceeds sending limit', function() {

	it('should catch a limit exceeded error from Twilio', function (done) {

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
			.reply(401, {'status': 401, 'message': 'Authenticate', 'code': 20005, 'moreInfo': 'https://www.twilio.com/docs/errors/20005'});
		nock('https://api.getvenn.io/v1')
			.get('/priority/sms')
			.reply(200, ["twilio"]);

		client.initialize()
		client.send({from:"15138853322", to:"15138853322", message:"message-13579"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.notEqual(err[0], undefined);
			assert.equal(err[0].code, StatusCode.LIMIT_EXCEEDED);
			done()
		})
	})
})