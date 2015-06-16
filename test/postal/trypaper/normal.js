var nock = require("nock");
var assert = require("assert");
var should = require('chai').should();
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;

var client = require("../../../lib/index")().Postal;

describe('TryPaper success', function () {

	beforeEach(function (done) {
		nock.cleanAll();

		nock('https://api.getvenn.io/v1')
			.get('/keys/postal')
			.reply(200, {
			"trypaper": {
				"api_key": "trypaper-api-key"
			}
		});

		nock('https://api.getvenn.io/v1')
			.get('/priority/postal')
			.reply(200, ["trypaper"]);

		done();
	})

	it('should send successfully with proper data', function (done) {

		var letter = {

		};

		nock('https://api.trypaper.com')
			.post('/Mailing')
			.reply(201, {'message': 'TODO: Find out what should go here!'});

		client.initialize()
		client.send(letter, function(err, result) {
		
			// TODO: assertions here

			done()
		})
	})
})