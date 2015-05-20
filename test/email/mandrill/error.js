var nock = require("nock")
var assert = require("assert")
var client = require("../../../lib/index").Email;
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;

describe('Mandrill errors', function () {

	beforeEach(function (done) {
		nock.cleanAll();
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {
			"mandrill": {
				"api_key": "key"
			}
		});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, ["mandrill"]);
		done()
	})

	it('should catch a limit exceeded error', function (done) {
		nock('https://mandrillapp.com/api/1.0')
			.post('/messages/send.json')
			.reply(400, {"status": "error", "code": 11, "name": "PaymentRequired", "message": "The requested feature requires payment."});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.notEqual(err[0], undefined);
			assert.equal(err[0].code, StatusCode.LIMIT_EXCEEDED);
			assert.equal(err[0].service, 'mandrill');
			assert.equal(err[0].message, 'PaymentRequired: The requested feature requires payment.');
			done()
		})
	})

	it('should catch an invalid parameter', function (done) {
		nock('https://mandrillapp.com/api/1.0')
			.post('/messages/send.json')
			.reply(400, {"status": "error", "code": 13, "name": "ValidationError", "message": "The parameters passed to the API call are invalid or not provided when required "});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.notEqual(err[0], undefined);
			assert.equal(err[0].code, StatusCode.DATA_REJECTED);
			assert.equal(err[0].service, 'mandrill');
			assert.equal(err[0].message, 'ValidationError: The parameters passed to the API call are invalid or not provided when required ');
			done()
		})
	})

	it('should catch a service down or unexpected error', function (done) {
		nock('https://mandrillapp.com/api/1.0')
			.post('/messages/send.json')
			.reply(400, {"status": "error", "code": 14, "name": "GeneralError", "message": "An unexpected error occurred processing the request."});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.notEqual(err[0], undefined);
			assert.equal(err[0].code, StatusCode.SERVICE_DOWN);
			assert.equal(err[0].service, 'mandrill');
			assert.equal(err[0].message, 'GeneralError: An unexpected error occurred processing the request.');
			done()
		})
	})
})