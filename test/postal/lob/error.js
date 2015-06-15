var nock = require("nock");
var assert = require("assert");
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status');
var MessagingUserStatus = require('../../../lib/models/messaging_user_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;
var UserCode = (new MessagingUserStatus()).StatusCodes;

var client = require("../../../lib/index").Postal;

describe('Lob errors', function () {

	beforeEach(function (done) {
		nock.cleanAll();

		nock('https://api.getvenn.io/v1')
			.get('/keys/postal')
			.reply(200, {
			"lob": {
				"api_key": "lob-api-key"				
			}
		});

		nock('https://api.getvenn.io/v1')
			.get('/priority/postal')
			.reply(200, ["lob"]);

		done();
	})

	describe('User errors', function () {

		it('should catch missing to address', function (done) {

			var letter = {

			};

			nock('https://api.lob.com')
				.post('/v1/letters/')
				.reply(422, {'message': 'Find out what this message should be'});

			/*client.initialize()
			client.send(letter, function(err, result) {
			
				// Do assertions here

				done()
			})*/
			done()
		})
	})

	/*describe.skip('Service errors', function () {

		it('description of what should happen', function (done) {

			nock('https://api.lob.com')
				.post('/v1/letters/')
				.reply(422, {'message': 'Some type of error message...'});

			client.initialize()
			client.send({[JSON data]}, function(err, result) {
			
				// Do assertions here

				done()
			})
		})
	})*/
})