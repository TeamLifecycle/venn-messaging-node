var nock = require("nock");
var assert = require("assert");
var should = require('chai').should();
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status');
var MessagingUserStatus = require('../../../lib/models/messaging_user_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;
var UserCode = (new MessagingUserStatus()).StatusCodes;

var client = require("../../../lib/index")().Postal;

describe('TryPaper errors', function () {

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

	describe('User errors', function () {

		it('should catch a missing to address', function (done) {

			var letter = {
				from: 'Return_Address_Id_String',
				file: "http://i.trypaper.com/pub/MacroniAndCheeseReference.pdf"
			};

			client.initialize()
			client.send(letter, function(err, result) {
				should.not.exist(result);
				should.exist(err);
				err.service.should.equal('postal validator');
				err.code.should.equal(UserCode.MISSING);
				err.message.should.equal('No "to" address given');
				done()
			})
		})

		it('should catch a missing from address', function (done) {

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
				file: "http://i.trypaper.com/pub/MacroniAndCheeseReference.pdf"
			};

			client.initialize()
			client.send(letter, function(err, result) {
				should.not.exist(result);
				should.exist(err);
				err.service.should.equal('postal validator');
				err.code.should.equal(UserCode.MISSING);
				err.message.should.equal('No "from" address given');
				done()
			})
		})

		it('should catch a missing file', function (done) {

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
				from: 'Return_Address_Id_String'
			};

			client.initialize()
			client.send(letter, function(err, result) {
				should.not.exist(result);
				should.exist(err);
				err.service.should.equal('postal validator');
				err.code.should.equal(UserCode.MISSING);
				err.message.should.equal('No file given');
				done()
			})
		})
	})

	describe('Service errors', function () {

		describe('Invalid required fields', function () {

			it('should catch an invalid to address', function (done) {

				var letter = {
					to: {
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
					tags: ["duplex","force_bw"],
					HIPAASensitive: false,
					batchId: "Feb 2013 Invoices",
					id: "random_id_string"
				};

				nock('https://api.trypaper.com')
					.post('/Mailing')
					.reply(400, 'Invalid to address!');

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('trypaper');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('Invalid to address!');
					done()
				})
			})

			it('should catch an invalid from address id', function (done) {

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
					from: 'invalid from address id',
					file: "http://i.trypaper.com/pub/MacroniAndCheeseReference.pdf",
					tags: ["duplex","force_bw"],
					HIPAASensitive: false,
					batchId: "Feb 2013 Invoices",
					id: "random_id_string"
				};

				nock('https://api.trypaper.com')
					.post('/Mailing')
					.reply(400, "Mailing ReturnAddressId of '5123_Test_St_Fake' is invalid.");

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('trypaper');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal("Mailing ReturnAddressId of '5123_Test_St_Fake' is invalid.");
					done()
				})
			})

			it('should catch an invalid file', function (done) {

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
					file: "http://lol.thisIsNotAValid.url",
					tags: ["duplex","force_bw"],
					HIPAASensitive: false,
					batchId: "Feb 2013 Invoices",
					id: "random_id_string"
				};

				nock('https://api.trypaper.com')
					.post('/Mailing')
					.reply(400, "Mailing.Content is required.");

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('trypaper');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal("Mailing.Content is required.");
					done()
				})
			})
		})

		describe('Invalid optional fields', function () {

			it('should catch an invalid tags array', function (done) {

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
					tags: ["duplex", "this should not work...","force_bw"],
					HIPAASensitive: false,
					batchId: "Feb 2013 Invoices",
					id: "random_id_string"
				};

				nock('https://api.trypaper.com')
					.post('/Mailing')
					.reply(400, 'Invalid tags!');

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('trypaper');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('Invalid tags!');
					done()
				})
			})

			it('should catch an invalid HIPAASensitive boolean', function (done) {

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
					HIPAASensitive: 'not a boolean',
					batchId: "Feb 2013 Invoices",
					id: "random_id_string"
				};

				nock('https://api.trypaper.com')
					.post('/Mailing')
					.reply(400, 'An error has occurred.');

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('trypaper');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('An error has occurred.');
					done()
				})
			})

			it('should catch an invalid batchId', function (done) {

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
					batchId: "This is not a batch id",
					id: "random_id_string"
				};

				nock('https://api.trypaper.com')
					.post('/Mailing')
					.reply(400, 'Invalid BatchId!');

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('trypaper');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('Invalid BatchId!');
					done()
				})
			})

			it('should catch an invalid account id', function (done) {

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
					id: "not an account id"
				};

				nock('https://api.trypaper.com')
					.post('/Mailing')
					.reply(400, 'Invalid Id!');

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('trypaper');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('Invalid Id!');
					done()
				})
			})
		})
	})
})