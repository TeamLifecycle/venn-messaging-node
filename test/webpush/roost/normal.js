var nock 					= require("nock")
var assert 					= require("assert")
var MessagingServiceStatus 	= require('../../../lib/models/messaging_service_status');
var StatusCode 				= (new MessagingServiceStatus()).StatusCodes;
var client 					= require("../../../lib/index")().WebPush

describe('Roost Normal Behavior', function () {

	beforeEach(function (done) {

		nock.cleanAll();

		// Nock getting service api keys from Venn api
		nock('https://api.getvenn.io/v1')
			.get('/keys/WebPush')
			.reply(200, {
			"roost": {
				"api_key": "key",
				"api_secret": "secret"
			}
		});

		// Nock returning the priority of all "on" services of the same type
		nock('https://api.getvenn.io/v1')
			.get('/priority/WebPush')
			.reply(200, ["roost"]);

		done();
	})

	it('should send a web push notification', function (done) {

		nock('https://api.goroost.com')
			.post('/api/push')
			.reply(200, {
				'success': true,
				'message': 'Push queued; will be sent to devices within the next few seconds.',
				'notification_id': 'id'
			});

		client.initialize()
		client.send({'alert': 'Web Push Title', 'url': 'https://www.my.url'}, function(err, result) {
		
			assert.equal(err, undefined);
			assert.notEqual(result, undefined);
			assert.equal(result.service, 'roost');

			//TODO: other assertions

			done()
		})
	})
})