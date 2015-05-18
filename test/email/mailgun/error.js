var nock = require("nock")
var assert = require("assert")
var client = require("../../../lib/index").Email;
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;

describe('Mailgun errors', function () {

	beforeEach(function (done) {
		nock.cleanAll();
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {
			"mailgun": {
				"api_key": 'key',
				"domain": 'domain'
			}
		});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, ["mailgun"]);
		done()
	})

	it('should catch a bad request error', function (done) {
		nock('https://api.mailgun.net')
			.filteringPath(function(path) { return '/'; })
			.post('/')
			.reply(400, {'message': 'Bad Request - Often missing a required parameter'});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.DATA_REJECTED);
			assert.equal(err[0].service, 'mailgun');
			assert.equal(err[0].message, 'Bad Request - Often missing a required parameter');
			done()
		})
	})

	it('should catch an invalid API key error', function (done) {
		nock('https://api.mailgun.net')
			.filteringPath(function(path) { return '/'; })
			.post('/')
			.reply(401, {'message': 'Unauthorized - No valid API key provided'});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.DATA_REJECTED);
			assert.equal(err[0].service, 'mailgun');
			assert.equal(err[0].message, 'Unauthorized - No valid API key provided');
			done()
		})
	})

	it('should catch a limit exceeded error (by status code)', function (done) {
		nock('https://api.mailgun.net')
			.filteringPath(function(path) { return '/'; })
			.post('/')
			.reply(402, {'message': 'Request Failed - Parameters were valid but request failed'});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.LIMIT_EXCEEDED);
			assert.equal(err[0].service, 'mailgun');
			assert.equal(err[0].message, 'Request Failed - Parameters were valid but request failed');
			done()
		})
	})

	it('should catch a limit exceeded error (by error message)', function (done) {
		nock('https://api.mailgun.net')
			.filteringPath(function(path) { return '/'; })
			.post('/')
			.reply(444, {'message': 'Message limit reached.'});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.LIMIT_EXCEEDED);
			assert.equal(err[0].service, 'mailgun');
			assert.equal(err[0].message, 'Message limit reached.');
			done()
		})
	})

	it('should catch a not found error', function (done) {
		nock('https://api.mailgun.net')
			.filteringPath(function(path) { return '/'; })
			.post('/')
			.reply(404, {'message': 'Not Found - The requested item doesn’t exist'});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.DATA_REJECTED);
			assert.equal(err[0].service, 'mailgun');
			assert.equal(err[0].message, 'Not Found - The requested item doesn’t exist');
			done()
		})
	})

	it('should catch a 500 server error', function (done) {
		nock('https://api.mailgun.net')
			.filteringPath(function(path) { return '/'; })
			.post('/')
			.reply(500, {'message': 'Server Errors - something is wrong on Mailgun’s end'});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.SERVICE_DOWN);
			assert.equal(err[0].service, 'mailgun');
			assert.equal(err[0].message, 'Server Errors - something is wrong on Mailgun’s end');
			done()
		})
	})

	it('should catch a 502 server error', function (done) {
		nock('https://api.mailgun.net')
			.filteringPath(function(path) { return '/'; })
			.post('/')
			.reply(502, {'message': 'Server Errors - something is wrong on Mailgun’s end'});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.SERVICE_DOWN);
			assert.equal(err[0].service, 'mailgun');
			assert.equal(err[0].message, 'Server Errors - something is wrong on Mailgun’s end');
			done()
		})
	})

	it('should catch a 503 server error', function (done) {
		nock('https://api.mailgun.net')
			.filteringPath(function(path) { return '/'; })
			.post('/')
			.reply(503, {'message': 'Server Errors - something is wrong on Mailgun’s end'});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.SERVICE_DOWN);
			assert.equal(err[0].service, 'mailgun');
			assert.equal(err[0].message, 'Server Errors - something is wrong on Mailgun’s end');
			done()
		})
	})

	it('should catch a 504 server error', function (done) {
		nock('https://api.mailgun.net')
			.filteringPath(function(path) { return '/'; })
			.post('/')
			.reply(504, {'message': 'Server Errors - something is wrong on Mailgun’s end'});
		client.initialize()
		client.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(err, undefined);
			assert.equal(result, undefined);
			assert.equal(err[0].code, StatusCode.SERVICE_DOWN);
			assert.equal(err[0].service, 'mailgun');
			assert.equal(err[0].message, 'Server Errors - something is wrong on Mailgun’s end');
			done()
		})
	})
})