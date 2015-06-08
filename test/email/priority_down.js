var assert = require("assert")
var nock = require("nock")
var emailClient = require("../../lib/index")().Email;
var env = process.env

describe('email should still send even if priority endpoint down', function(){

	it('should send with sendgrid suggested first', function(done){
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
			.reply(500, {});
		emailClient.initialize(process.env.VENN_API_KEY)
		emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			assert.notEqual(result, undefined);
			assert.notEqual("not sent :(", result.service, "email sent successfully");
			done()
		})
	})
})