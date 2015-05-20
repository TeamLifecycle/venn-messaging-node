var assert = require("assert")
var nock = require("nock")
var emailClient = require("../../lib/index").Email;

describe('when email services up', function(){

	it('should send with mandrill when suggested first', function(done){
		nock.cleanAll()
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {
				"sendgrid": {
					"api_user": "sldkfjdslkjf",
					"api_key": "sldkfjdslkjf"
				},
				"mandrill": {
					"api_key": "sldkfjdslkjf"
				}
			});
		nock('https://mandrillapp.com/api/1.0')
			.post('/messages/send.json')
			.reply(200, [{"status": "sent"}] );
		nock('https://api.sendgrid.com/api')
			.post('/mail.send.json')
			.reply(200, {"message": "success"});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, [ "mandrill", "sendgrid"]);

		emailClient.initialize()
		emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.equal(result.service, "mandrill");
			assert.equal(Object.keys(emailClient.services).length, 2);
			done()
		})
	})

	it('should send with sendgrid when suggested first', function(done){
	nock('https://api.getvenn.io/v1')
		.get('/keys/email')
		.reply(200, {
			"sendgrid": {
				"api_user": process.env.SENDGRID_API_USER,
				"api_key": process.env.SENDGRID_API_KEY
			},
			"mandrill": {
				"api_key": process.env.MANDRILL_API_KEY
			}
		});
		nock('https://mandrillapp.com/api/1.0')
			.post('/messages/send.json')
			.reply(200, [{"status": "sent"}] );
		nock('https://api.sendgrid.com/api')
			.post('/mail.send.json')
			.reply(200, {"message": "success"});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, [ "sendgrid", "mandrill" ]);
		emailClient.initialize(process.env.VENN_API_KEY)
		emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.equal(result.service, "sendgrid");
			done()
		})
	})

	it('should send with mailgun when suggested first', function(done){
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
					"api_key": process.env.MAILGUN_API_KEY,
					"domain": process.env.MAILGUN_DOMAIN
				}
			});
		nock('https://mandrillapp.com/api/1.0')
			.post('/messages/send.json')
			.reply(200, [{"status": "sent"}] );
		nock('https://api.sendgrid.com/api')
			.post('/mail.send.json')
			.reply(200, {"message": "success"});
		nock('https://api.mailgun.net/v2')
			.post('/messages')
			.reply(200, {"message": "success"});
		// nock('https://api.mailgun.net').filteringPath(function(path) {
		// 	return '/';
		// }).get('/').reply(200, {});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, [ "mailgun", "mandrill" ]);
		emailClient.initialize(process.env.VENN_API_KEY)
		emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.equal(result.service, "mailgun");
			done()
		})
	})


	it('should send with postmark when suggested first', function(done){
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {
				"sendgrid": {
					"api_user": process.env.SENDGRID_API_USER,
					"api_key": process.env.SENDGRID_API_KEY
				},
				"postmark": {
					"server_key": "123"
				}
			});
		nock('https://api.messagebus.com/v5').filteringRequestBody(/.*/, '*')
			.post('/messages/send')
			.reply(202, require("../fixtures/messagebus_response") );
		nock('https://api.postmarkapp.com').filteringRequestBody(/.*/, '*')
			.post('/email')
			.reply(200, {"message": "success"} );
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, [ "postmark", "messagebus" ]);
		emailClient.initialize(process.env.VENN_API_KEY)
		emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.equal(result.service, "postmark");
			done()
		})
	})

})