var assert = require("assert")
var nock = require("nock")
var emailClient = require("../../lib/index").Email;

describe('sending an email', function(){

	describe('when services are down', function(){

		it('should send with sendgrid when mandrill and mailgun are down', function(done){
			nock.cleanAll()
			nock('https://api.getvenn.io/v1')
				.get('/keys/email')
				.reply(200, {
					"sendgrid": {
						"api_user": process.env.SENDGRID_API_USER,
						"api_key": process.env.SENDGRID_API_KEY
					},
					"mandrill": {
						"api_key": process.env.MANDRILL_API_KEY
					},
					"mailgun": {
						"domain": process.env.MAILGUN_DOMAIN,
						"api_key": process.env.MAILGUN_API_KEY
					}
				});
			nock('https://api.getvenn.io/v1')
				.get('/priority/email')
				.reply(200, [ "mandrill", "mailgun", "sendgrid" ]);

			nock('https://mandrillapp.com/api/1.0')
				.post('/messages/send.json')
				.reply(500, {});

			nock('https://api.mailgun.net/v2')
				.post('/messages')
				.reply(500, {"message": "success"});
			nock('https://api.sendgrid.com/api')
				.post('/mail.send.json')
				.reply(200, {"message": "success"});
			emailClient.initialize(process.env.VENN_API_KEY)
			emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
				assert.notEqual(result, undefined);
				assert.equal(result.service, "sendgrid");
				done()
			})
		})

		it('should send with mandrill when sendgrid is down', function(done){
			nock('https://api.getvenn.io/v1')
				.get('/keys/email')
				.reply(200, {
					"sendgrid": {
						"api_user": process.env.SENDGRID_API_USER,
						"api_key": process.env.SENDGRID_API_KEY
					},
					"mandrill": {
						"api_key": process.env.MANDRILL_API_KEY
					},
					"mailgun": {
						"domain": process.env.MAILGUN_DOMAIN,
						"api_key": process.env.MAILGUN_API_KEY
					}
				});
			nock('https://api.getvenn.io/v1')
				.get('/priority/email')
				.reply(200, [ "sendgrid", "mandrill" ]);
			nock('https://mandrillapp.com/api/1.0')
				.post('/messages/send.json')
				.reply(200, [{"status": "sent"}] );
			nock('https://api.sendgrid.com/api')
				.post('/mail.send.json')
				.reply(500, {});
			emailClient.initialize(process.env.VENN_API_KEY)
			emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
				assert.notEqual(result, undefined);
				assert.equal(result.service, "mandrill");
				done()
			})
		})

		it('should send with mailgun when sendgrid is down', function(done){
			nock.cleanAll()
			nock('https://api.getvenn.io/v1')
				.get('/keys/email')
				.reply(200, {
					"sendgrid": {
						"api_user": process.env.SENDGRID_API_USER,
						"api_key": process.env.SENDGRID_API_KEY
					},
					"mandrill": {
						"api_key": process.env.MANDRILL_API_KEY
					},
					"mailgun": {
						"domain": process.env.MAILGUN_DOMAIN,
						"api_key": process.env.MAILGUN_API_KEY
					}
				});
			nock('https://api.getvenn.io/v1')
				.get('/priority/email')
				.reply(200, [ "sendgrid", "mailgun" ]);
			nock('https://api.sendgrid.com/api')
				.post('/mail.send.json')
				.reply(500, {});
			nock('https://api.mailgun.net/v2')
				.post('/messages')
				.reply(200, {"message": "success"});
			emailClient.initialize(process.env.VENN_API_KEY)
			emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
				assert.notEqual(result, undefined);
				assert.equal(result.service, "mailgun");
				done()
			})
		})
	})


})