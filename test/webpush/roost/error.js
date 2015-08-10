var nock 					= require("nock"),
	assert 					= require("assert"),
	MessagingServiceStatus 	= require('../../../lib/models/messaging_service_status'),
	MessagingUserStatus 	= require('../../../lib/models/messaging_user_status'),
	StatusCode 				= (new MessagingServiceStatus()).StatusCodes,
	UserCode 				= (new MessagingUserStatus()).StatusCodes,
	client 					= require("../../../lib/index")().WebPush;

describe('Roost Errors', function () {

	beforeEach(function (done) {

		nock.cleanAll();

		// Nock getting service api keys from Venn api
		nock('https://api.getvenn.io/v1')
			.get('/keys/webpush')
			.reply(200, {
			"roost": {
				"api_key": "key",
				"api_secret": "secret"
			}
		});

		// Nock returning the priority of all "on" services of the same type
		nock('https://api.getvenn.io/v1')
			.get('/priority/webpush')
			.reply(200, ["roost"]);

		done();
	})


	describe('From User Error', function () {

		it('should catch missing `message` parameter', function (done) {

			client.initialize();
			client.send({'url': 'https://www.my.url'}, function(err, result) {
			
				assert.notEqual(err, undefined);
				assert.equal(result, undefined);
				assert.equal(err.code, UserCode.MISSING);
				assert.equal(err.service, 'roost');
				assert.equal(err.message, '`message` key required.');
				assert.equal(this.sendLog.length, 1);
				assert.equal(this.sendLog[0].code, UserCode.MISSING);
				assert.equal(this.sendLog[0].service, 'roost');
				assert.equal(this.sendLog[0].message, '`message` key required.');

				done();
			});
		});

		it('should catch missing `url` parameter', function (done) {

			client.initialize();
			client.send({'message': 'A really cool hat!'}, function(err, result) {
			
				assert.notEqual(err, undefined);
				assert.equal(result, undefined);
				assert.equal(err.code, UserCode.MISSING);
				assert.equal(err.service, 'roost');
				assert.equal(err.message, '`url` key required.');
				assert.equal(this.sendLog.length, 1);
				assert.equal(this.sendLog[0].code, UserCode.MISSING);
				assert.equal(this.sendLog[0].service, 'roost');
				assert.equal(this.sendLog[0].message, '`url` key required.');

				done();
			});
		});
	});

	describe('From Bad Data', function () {

		it('should catch bad authorization username', function (done) {

			// For some reason, Roost sends back 200, undefined response body when an invalid api key is specified
			nock('https://api.goroost.com')
			.post('/api/push')
			.reply(200, undefined);

			client.initialize();
			client.send({'message': 'Web Push Title', 'url': 'https://www.my.url'}, function(err, result) {
			
				assert.notEqual(err, undefined);
				assert.equal(result, undefined);
				assert.equal(err.length, 1);
				assert.equal(err[0].code, StatusCode.UNAUTHORIZED);
				assert.equal(err[0].service, 'roost');
				assert.equal(err[0].message, 'Login using basic auth and the configuration\'s key and secret as username and password.');
				assert.equal(this.sendLog.length, 1);
				assert.equal(this.sendLog[0].code, StatusCode.UNAUTHORIZED);
				assert.equal(this.sendLog[0].service, 'roost');
				assert.equal(this.sendLog[0].message, 'Login using basic auth and the configuration\'s key and secret as username and password.');

				done();
			});
		});

		it('should catch bad authorization password', function (done) {

			nock('https://api.goroost.com')
			.post('/api/push')
			.reply(401, {
				success: false,
				error: 'Login using basic auth and the configuration\'s key and secret as username and password.'
			});

			client.initialize();
			client.send({'message': 'Web Push Title', 'url': 'https://www.my.url'}, function(err, result) {
			
				assert.notEqual(err, undefined);
				assert.equal(result, undefined);
				assert.equal(err.length, 1);
				assert.equal(err[0].code, StatusCode.UNAUTHORIZED);
				assert.equal(err[0].service, 'roost');
				assert.equal(err[0].message, 'Login using basic auth and the configuration\'s key and secret as username and password.');
				assert.equal(this.sendLog.length, 1);
				assert.equal(this.sendLog[0].code, StatusCode.UNAUTHORIZED);
				assert.equal(this.sendLog[0].service, 'roost');
				assert.equal(this.sendLog[0].message, 'Login using basic auth and the configuration\'s key and secret as username and password.');

				done();
			});
		});

		it('should catch missing authorization header', function (done) {

			nock('https://api.goroost.com')
			.post('/api/push')
			.reply(401, {
				success: false,
				error: 'Login using basic auth and the configuration\'s key and secret as username and password.'
			});

			client.initialize();
			client.send({'message': 'Web Push Title', 'url': 'https://www.my.url'}, function(err, result) {
			
				assert.notEqual(err, undefined);
				assert.equal(result, undefined);
				assert.equal(err.length, 1);
				assert.equal(err[0].code, StatusCode.UNAUTHORIZED);
				assert.equal(err[0].service, 'roost');
				assert.equal(err[0].message, 'Login using basic auth and the configuration\'s key and secret as username and password.');
				assert.equal(this.sendLog.length, 1);
				assert.equal(this.sendLog[0].code, StatusCode.UNAUTHORIZED);
				assert.equal(this.sendLog[0].service, 'roost');
				assert.equal(this.sendLog[0].message, 'Login using basic auth and the configuration\'s key and secret as username and password.');

				done();
			});
		});

		it('should catch an invalid url key', function (done) {

			nock('https://api.goroost.com')
			.post('/api/push')
			.reply(200, {
				success: false,
				error: 'Incorrectly formatted URL in push request.'
			});

			client.initialize();
			client.send({'message': 'Web Push Title', 'url': 'blah'}, function(err, result) {
			
				assert.notEqual(err, undefined);
				assert.equal(result, undefined);
				assert.equal(err.length, 1);
				assert.equal(err[0].code, StatusCode.DATA_REJECTED);
				assert.equal(err[0].service, 'roost');
				assert.equal(err[0].message, 'Incorrectly formatted URL in push request.');
				assert.equal(this.sendLog.length, 1);
				assert.equal(this.sendLog[0].code, StatusCode.DATA_REJECTED);
				assert.equal(this.sendLog[0].service, 'roost');
				assert.equal(this.sendLog[0].message, 'Incorrectly formatted URL in push request.');

				done();
			});
		});

		it('should catch an invalid segments key', function (done) {

			nock('https://api.goroost.com')
			.post('/api/push')
			.reply(200, {
				success: false,
				error: 'Invalid JSON in body of post.'
			});

			client.initialize();
			client.send({
				'message': 'Web Push Title',
				'url': 'https://www.my.url',
				'segments': ''
			}, function(err, result) {
			
				assert.notEqual(err, undefined);
				assert.equal(result, undefined);
				assert.equal(err.length, 1);
				assert.equal(err[0].code, StatusCode.DATA_REJECTED);
				assert.equal(err[0].service, 'roost');
				assert.equal(err[0].message, 'Invalid JSON in body of post.');
				assert.equal(this.sendLog.length, 1);
				assert.equal(this.sendLog[0].code, StatusCode.DATA_REJECTED);
				assert.equal(this.sendLog[0].service, 'roost');
				assert.equal(this.sendLog[0].message, 'Invalid JSON in body of post.');

				done();
			});
		});

		it('should catch an invalid aliases key', function (done) {

			nock('https://api.goroost.com')
			.post('/api/push')
			.reply(200, {
				success: false,
				error: 'Invalid JSON in body of post.'
			});

			client.initialize();
			client.send({
				'message': 'Web Push Title',
				'url': 'https://www.my.url',
				'aliases': ''
			}, function(err, result) {
			
				assert.notEqual(err, undefined);
				assert.equal(result, undefined);
				assert.equal(err.length, 1);
				assert.equal(err[0].code, StatusCode.DATA_REJECTED);
				assert.equal(err[0].service, 'roost');
				assert.equal(err[0].message, 'Invalid JSON in body of post.');
				assert.equal(this.sendLog.length, 1);
				assert.equal(this.sendLog[0].code, StatusCode.DATA_REJECTED);
				assert.equal(this.sendLog[0].service, 'roost');
				assert.equal(this.sendLog[0].message, 'Invalid JSON in body of post.');

				done();
			});
		});

		it('should catch an invalid device_tokens key', function (done) {

			nock('https://api.goroost.com')
			.post('/api/push')
			.reply(200, {
				success: false,
				error: 'Invalid JSON in body of post.'
			});

			client.initialize();
			client.send({
				'message': 'Web Push Title',
				'url': 'https://www.my.url',
				'device_tokens': ''
			}, function(err, result) {
			
				assert.notEqual(err, undefined);
				assert.equal(result, undefined);
				assert.equal(err.length, 1);
				assert.equal(err[0].code, StatusCode.DATA_REJECTED);
				assert.equal(err[0].service, 'roost');
				assert.equal(err[0].message, 'Invalid JSON in body of post.');
				assert.equal(this.sendLog.length, 1);
				assert.equal(this.sendLog[0].code, StatusCode.DATA_REJECTED);
				assert.equal(this.sendLog[0].service, 'roost');
				assert.equal(this.sendLog[0].message, 'Invalid JSON in body of post.');

				done();
			});
		});

		it('should catch an invalid exclude_tokens key', function (done) {

			nock('https://api.goroost.com')
			.post('/api/push')
			.reply(200, {
				success: false,
				error: 'Invalid JSON in body of post.'
			});

			client.initialize();
			client.send({
				'message': 'Web Push Title',
				'url': 'https://www.my.url',
				'exclude_tokens': ''
			}, function(err, result) {
			
				assert.notEqual(err, undefined);
				assert.equal(result, undefined);
				assert.equal(err.length, 1);
				assert.equal(err[0].code, StatusCode.DATA_REJECTED);
				assert.equal(err[0].service, 'roost');
				assert.equal(err[0].message, 'Invalid JSON in body of post.');
				assert.equal(this.sendLog.length, 1);
				assert.equal(this.sendLog[0].code, StatusCode.DATA_REJECTED);
				assert.equal(this.sendLog[0].service, 'roost');
				assert.equal(this.sendLog[0].message, 'Invalid JSON in body of post.');

				done();
			});
		});
	});
});