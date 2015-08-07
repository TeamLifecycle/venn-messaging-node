var nock 					= require("nock")
var assert 					= require("assert")
var MessagingServiceStatus 	= require('../../../lib/models/messaging_service_status');
var StatusCode 				= (new MessagingServiceStatus()).StatusCodes;
var client 					= require("../../../lib/index")().WebPush

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

	it.skip('should catch bad authorization', function (done) {

		nock('https://api.goroost.com')
			.post('/api/push')
			.reply(401, {
				'success': false,
				'error': 'Login using basic auth and the configuration\'s key and secret as username and password.'
			});

		client.initialize()
		client.send({'alert': 'Web Push Title', 'url': 'https://www.my.url'}, function(err, result) {
		
			assert.equal(err, undefined);
			assert.notEqual(result, undefined);
			//TODO: other assertions

			done()
		})
	})
})