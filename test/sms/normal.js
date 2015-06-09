var assert = require("assert")
var nock = require("nock")
var client = require("../../lib/index")().SMS;

describe('when sms services up', function(){

	describe('when from number input in webapp', function(){

		it('should send with twilio when suggested first', function(done){
			nock.cleanAll()
			nock('https://api.getvenn.io/v1')
				.get('/keys/sms')
				.reply(200, {
					"twilio": {
						"account_sid": "sldkfjdslkjf",
						"auth_token": "sldkfjdslkjf",
						"from_phone": "15139455543"
					},
					"nexmo": {
						"api_key": "sldkfjdslkjf",
						"api_secret": "sldkfjdslkjf"
					}
				});
			nock('https://api.twilio.com:443')
				.post('/2010-04-01/Accounts/sldkfjdslkjf/Messages.json')
				.reply(201, [{"status": "sent"}] );
			nock('https://rest.nexmo.com/sms/json')
				.post('')
				.reply(200, {"message": "success"});
			nock('https://api.getvenn.io/v1')
				.get('/priority/sms')
				.reply(200, [ "twilio", "nexmo"]);

			client.initialize()
			client.send({to:"15138853322", message:"message-13579"}, function(err, result){
				assert.notEqual(result, undefined);
				assert.equal(result.service, "twilio");
				assert.equal(Object.keys(client.services).length, 2);
				done()
			})
		})
	})


	it('should send with nexmo when suggested first', function(done){
		nock.cleanAll()
		nock('https://api.getvenn.io/v1')
			.get('/keys/sms')
			.reply(200, {
				"parse": {
					"api_key": "nsldkfjdslkjf",
					"app_id": "nsldkfjdslkjf"
				},
				"nexmo": {
					"api_key": "nsldkfjdslkjf",
					"api_secret": "nsldkfjdslkjf",
					"from_phone": "15139453300"
				}
			});
		nock('https://rest.nexmo.com')
			.post('/sms/json?from=15139453300&to=15138853322&text=message-13579&api_key=nsldkfjdslkjf&api_secret=nsldkfjdslkjf')
			.reply(200, {"message": "success"});
		nock('https://api.getvenn.io/v1')
			.get('/priority/sms')
			.reply(200, ["nexmo", "twilio"]);

		client.initialize("test123")
		client.send({from:"15138853322", to:"15138853322", message:"message-13579"}, function(err, result){
			assert.notEqual(result, undefined);
			assert.equal(result.service, "nexmo");
			assert.equal(Object.keys(client.services).length, 2);
			done()
		})
	})

})