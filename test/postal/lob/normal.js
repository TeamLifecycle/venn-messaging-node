var nock = require("nock");
var assert = require("assert");
var should = require('chai').should();
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;

var client = require("../../../lib/index")().Postal;

describe('Lob success', function () {

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

	it('should send successfully with proper data', function (done) {

		var letter = {
			to: {
				name: 'Harry Zhang',
				address_line1: '123 Test Street',
		        address_city: 'Mountain View',
		        address_state: 'CA',
		        address_zip: '94041',
		        address_country: 'US'
			},
			from: {
				name: 'Ami Wang',
				address_line1: '123 Test Avenue',
		        address_city: 'Mountain View',
		        address_state: 'CA',
		        address_zip: '94041',
		        address_country: 'US'
			},
			file: "<html style='padding-top': 3in; 'margin': .5in;>HTML Letter for {{name}}</html>",
			variables: {
				name: 'Harry'
			},
			color: false,
			description: 'Zhang-Wang pudding tang',
			extra_service: 'certified',
			double_sided: true,
			template: true,
			metadata: {
				campaign: 'Hungry Hungry Hippo'
			}
		};

		nock('https://api.lob.com')
			.post('/v1/letters')
			.reply(200, {'status_code': 200, 'message': 'TODO: Find out what this message should be!'});

		client.initialize()
		client.send(letter, function(err, result) {
			should.not.exist(err);
			should.exist(result);
			result.service.should.equal('lob');
			done()
		})
	})
})