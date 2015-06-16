var nock = require("nock");
var assert = require("assert");
var should = require('chai').should();
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status');
var MessagingUserStatus = require('../../../lib/models/messaging_user_status');
var StatusCode = (new MessagingServiceStatus()).StatusCodes;
var UserCode = (new MessagingUserStatus()).StatusCodes;

var client = require("../../../lib/index")().Postal;

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
				}
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

		it('should catch missing from address', function (done) {

			var letter = {
				to: {
					name: 'Harry Zhang',
			        address_line1: '123 Test Street',
			        address_city: 'Mountain View',
			        address_state: 'CA',
			        address_zip: '94041',
			        address_country: 'US'
				},
				file: "<html style='padding-top': 3in; 'margin': .5in;>HTML Letter for {{name}}</html>",
				variables: {
			        name: 'Harry'
				}
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

		it('should catch missing file', function (done) {

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
				}
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
						name: 'Harry Zhang',
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
					.reply(422, {'status_code': 422, 'message': 'TODO: Find out what this message should be!'});

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('lob');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('TODO: Find out what this message should be!');
					done()
				})
			})

			it('should catch an invalid from address', function (done) {

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
					.reply(422, {'status_code': 422, 'message': 'TODO: Find out what this message should be!'});

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('lob');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('TODO: Find out what this message should be!');
					done()
				})
			})

			it('should catch an invalid color boolean', function (done) {

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
					color: 'Blue',
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
					.reply(422, {'status_code': 422, 'message': 'TODO: Find out what this message should be!'});

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('lob');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('TODO: Find out what this message should be!');
					done()
				})
			})

			it('should catch an invalid file', function (done) {

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
					file: "Just a string, not a file",
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
					.reply(422, {'status_code': 422, 'message': 'TODO: Find out what this message should be!'});

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('lob');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('TODO: Find out what this message should be!');
					done()
				})
			})
		})

		describe('Invalid optional fields', function () {

			it('should catch an invalid variables object', function (done) {

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
						// No name variable given
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
					.reply(422, {'status_code': 422, 'message': 'TODO: Find out what this message should be!'});

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('lob');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('TODO: Find out what this message should be!');
					done()
				})
			})

			it('should catch an invalid extra_service', function (done) {

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
					extra_service: 'not-a-service',
					double_sided: true,
					template: true,
					metadata: {
						campaign: 'Hungry Hungry Hippo'
					}
				};

				nock('https://api.lob.com')
					.post('/v1/letters')
					.reply(422, {'status_code': 422, 'message': 'TODO: Find out what this message should be!'});

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('lob');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('TODO: Find out what this message should be!');
					done()
				})
			})

			it('should catch an invalid double_sided boolean', function (done) {

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
					double_sided: 'not-a-boolean',
					template: true,
					metadata: {
						campaign: 'Hungry Hungry Hippo'
					}
				};

				nock('https://api.lob.com')
					.post('/v1/letters')
					.reply(422, {'status_code': 422, 'message': 'TODO: Find out what this message should be!'});

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('lob');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('TODO: Find out what this message should be!');
					done()
				})
			})

			it('should catch an invalid template boolean', function (done) {

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
					template: 'not-a-boolean',
					metadata: {
						campaign: 'Hungry Hungry Hippo'
					}
				};

				nock('https://api.lob.com')
					.post('/v1/letters')
					.reply(422, {'status_code': 422, 'message': 'TODO: Find out what this message should be!'});

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('lob');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('TODO: Find out what this message should be!');
					done()
				})
			})

			it('should catch an invalid metadata object', function (done) {

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
						'1': '1',
						'2': '2',
						'3': '3',
						'4': '4',
						'5': '5',
						'6': '6',
						'7': '7',
						'8': '8',
						'9': '9',
						'10': '10',
						'11': '11',
						'12': '12',
						'13': '13',
						'14': '14',
						'15': '15',
						'16': '16',
						'17': '17',
						'18': '18',
						'19': '19',
						'20': '20',
						'21': '21'
						// Metadata should have no more than 20 key-value pairs
					}
				};

				nock('https://api.lob.com')
					.post('/v1/letters')
					.reply(422, {'status_code': 422, 'message': 'TODO: Find out what this message should be!'});

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('lob');
					err[0].code.should.equal(StatusCode.DATA_REJECTED);
					err[0].message.should.equal('TODO: Find out what this message should be!');
					done()
				})
			})

			it('should catch an internal Lob server error', function (done) {

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
					.reply(500, {'status_code': 500, 'message': 'TODO: Find out what this message should be!'});

				client.initialize()
				client.send(letter, function(err, result) {
					should.not.exist(result);
					should.exist(err);
					err.length.should.equal(1);
					should.exist(err[0].service);
					should.exist(err[0].code);
					should.exist(err[0].message);
					err[0].service.should.equal('lob');
					err[0].code.should.equal(StatusCode.SERVICE_DOWN);
					err[0].message.should.equal('TODO: Find out what this message should be!');
					done()
				})
			})
		})
	})
})