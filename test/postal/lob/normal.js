/*
Template Instructions

- Follow the general guidlines under each function and object
- Rename all instances of ServiceType to the appropriate type of the service being tested
- Rename all instances of 'service_name' to the slug (all lowercase name) of the service being tested
- Delete all templating comments after creating the new tests

Tests should outline the logic that you want the service to follow. The tests should fail initially,
and then pass after writing the service's logic behavior.
*/

var nock = require("nock")
var assert = require("assert")
var MessagingServiceStatus = require('../../../lib/models/messaging_service_status'); // This path may change depending on location of test file
var StatusCode = (new MessagingServiceStatus()).StatusCodes;

/*
Require the specific Venn service type being tested (Email, SMS, or Push)

var client = require("../../../lib/index").[ServiceType];
*/

describe('ServiceName errors', function () {

	before(function (done) {
		// Define any logic that must run once immediately before all tests
		// Delete if not needed
		done();
	})

	beforeEach(function (done) {
		// Define any logic that must run immediately before each test
		// Delete if not needed

		/*
		Usually need to run nock logic before each test that mimics hitting the venn api

		Example nock paths:

		nock.cleanAll();

		// Nock getting service api keys from Venn api
		nock('https://api.getvenn.io/v1')
			.get('/keys/[ServiceType]')
			.reply(200, {
			"service_name": {
				
				// Venn api will return service credentials (like api keys or username, password)
			}
		});

		// Nock returning the priority of all "on" services of the same type
		nock('https://api.getvenn.io/v1')
			.get('/priority/[ServiceType]')
			.reply(200, ["service_name"]);
		*/

		done();
	})

	/*
	Define all tests here

	Example test:
	it('description of what should happen', function (done) {

		// Mock hitting the service's web api
		nock('[https://api.pathHere.domain]')
			.post('[/api/endPoint]')
			.reply([StatusCode], {[JSON response that mimics what you would actually get back]});

		// Run Venn sending service
		client.initialize()
		client.send({[JSON data]}, function(err, result) {
		
			// Do assertions here

			done()
		})
	})
	*/
})