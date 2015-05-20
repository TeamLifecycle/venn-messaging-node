var nock = require("nock")
var assert = require("assert")
var client = require("../../../lib/index").Email;
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;

describe('Sendgrid errors', function () {

	beforeEach(function (done) {
		nock.cleanAll();
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {
			"sendgrid": {
				"api_user": 'user',
				"api_key": 'key'
			}
		});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, ["sendgrid"]);
		done()
	})

	it('should catch a limit exceeded error', function (done) {
		nock('https://api.sendgrid.com/api')
			.post('/mail.send.json')
			.reply(429, {'message': 'Too Many Requests', 'errors': ['Maximum credits exceeded']});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.notEqual(err[0], undefined);
			assert.equal(err[0].code, StatusCode.LIMIT_EXCEEDED);
			assert.equal(err[0].service, 'sendgrid');
			assert.equal(err[0].message, 'Maximum credits exceeded');
			done()
		})
	})

	it('should catch an internal server error', function (done) {
		nock('https://api.sendgrid.com/api')
			.post('/mail.send.json')
			.reply(500, {'message': 'Internal server error', 'errors': ['sendgrid error']});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.notEqual(err[0], undefined);
			assert.equal(err[0].code, StatusCode.SERVICE_DOWN);
			assert.equal(err[0].service, 'sendgrid');
			assert.equal(err[0].message, 'sendgrid error');
			done()
		})
	})
})