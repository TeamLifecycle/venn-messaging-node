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
			to: {
				"Name": "John Smith",
			    "Organization": "ACME, Inc.",
			    "AddressLineOne": "123 Any Street",
			    "AddressLineTwo": "Suite 789",
			    "City": "Anytown",
			    "Province": "WA",
			    "PostalCode": "12345",
			    "Country": "US"
			},
			from: 'Return_Address_Id_String',
			file: "http://i.trypaper.com/pub/MacroniAndCheeseReference.pdf",
			tags: ["duplex", "force_bw"],
			HIPAASensitive: false,
			batchId: "Feb 2013 Invoices",
			id: "accountId"
		};

		nock('https://api.trypaper.com')
			.post('/Mailing')
			.reply(201, {'message': 'Success!'});

		client.initialize()
		client.send(letter, function(err, result) {
			should.not.exist(err);
			should.exist(result);
			result.service.should.equal('trypaper');
			done()
		})
	})
})