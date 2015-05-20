var nock = require("nock")
var assert = require("assert")
var client = require("../../../lib/index").Email;
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;

describe('Postmark errors', function () {

	beforeEach(function (done) {
		nock.cleanAll();
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {
			"postmark": {
				"server_key": "key"
			}
		});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, ["postmark"]);
		done()
	})

	it('should catch an internal server error', function (done) {
		nock('https://api.postmarkapp.com').filteringRequestBody(/.*/, '*')
			.post('/email')
			.reply(500, {"ErrorCode": 500, "Message": "Internal Server Error"} );
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.SERVICE_DOWN);
			assert.equal(err[0].service, 'postmark');
			assert.equal(err[0].message, '500: Internal Server Error');
			done()
		})
	})

	it('should catch an invalid Sender Signature', function (done) {
		nock('https://api.postmarkapp.com').filteringRequestBody(/.*/, '*')
			.post('/email')
			.reply(422, {"ErrorCode": 400, "Message": "Sender Signature not found"} );
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.DATA_REJECTED);
			assert.equal(err[0].service, 'postmark');
			assert.equal(err[0].message, '400: Sender Signature not found');
			done()
		})
	})

	it('should catch an unconfirmed Sender Signature', function (done) {
		nock('https://api.postmarkapp.com').filteringRequestBody(/.*/, '*')
			.post('/email')
			.reply(422, {"ErrorCode": 401, "Message": "Sender signature not confirmed"} );
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.DATA_REJECTED);
			assert.equal(err[0].service, 'postmark');
			assert.equal(err[0].message, '401: Sender signature not confirmed');
			done()
		})
	})

	it('should catch a limit exceeded error', function (done) {
		nock('https://api.postmarkapp.com').filteringRequestBody(/.*/, '*')
			.post('/email')
			.reply(422, {"ErrorCode": 405, "Message": "Not allowed to send"} );
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.LIMIT_EXCEEDED);
			assert.equal(err[0].service, 'postmark');
			assert.equal(err[0].message, '405: Not allowed to send');
			done()
		})
	})

	it('should catch an Inactive Recipient', function (done) {
		nock('https://api.postmarkapp.com').filteringRequestBody(/.*/, '*')
			.post('/email')
			.reply(422, {"ErrorCode": 406, "Message": "Inactive recipient"} );
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.DATA_REJECTED);
			assert.equal(err[0].service, 'postmark');
			assert.equal(err[0].message, '406: Inactive recipient');
			done()
		})
	})

	it('should catch an unauthorized Sender Signature', function (done) {
		nock('https://api.postmarkapp.com').filteringRequestBody(/.*/, '*')
			.post('/email')
			.reply(422, {"ErrorCode": 507, "Message": "You do not own this Sender Signature"} );
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.DATA_REJECTED);
			assert.equal(err[0].service, 'postmark');
			assert.equal(err[0].message, '507: You do not own this Sender Signature');
			done()
		})
	})

	it('should catch an invalid field value', function (done) {
		nock('https://api.postmarkapp.com').filteringRequestBody(/.*/, '*')
			.post('/email')
			.reply(422, {"ErrorCode": 522, "Message": "Value for field is invalid."} );
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.DATA_REJECTED);
			assert.equal(err[0].service, 'postmark');
			assert.equal(err[0].message, '522: Value for field is invalid.');
			done()
		})
	})
})