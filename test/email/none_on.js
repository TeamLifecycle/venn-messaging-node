var assert = require("assert")
var nock = require("nock")
var emailClient = require("../../lib/index").Email;
var should = require("chai").should()

describe('when one doesnt have any services turned on', function(){

	it('should return an error to the user', function(done){
		nock.cleanAll()
		nock('https://api.getvenn.io/v1')
			.get('/keys/email')
			.reply(200, {});
		nock('https://api.getvenn.io/v1')
			.get('/priority/email')
			.reply(200, [ "mandrill", "sendgrid"]);

		emailClient.initialize()
		emailClient.send({from:"from@email.com", to:"testy@email.com", subject:"subject-1", message:"message-1"}, function(err, result){
			should.exist(err);
			err.should.be.an('object');
			should.not.exist(result);
			err.message.should.equal("No email integrations turned on! Turn some on in your Venn Dashboard!");
			done();
		})
	})


})