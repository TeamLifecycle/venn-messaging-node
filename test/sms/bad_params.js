var assert = require("assert")
var should = require("chai").should()
var client = require("../../lib/index")().SMS;
var MessagingUserStatus = require('../../lib/models/messaging_user_status');
var UserCodes = (new MessagingUserStatus()).StatusCodes;

describe('when sms services up', function(){

	it('should show error if incorrect params', function(done){
		client.initialize()
		client.send({to:"5138853322", message:"message-13579"}, function(err, result){
			should.exist(err);
			should.not.exist(result);
			err.code.should.equal(UserCodes.INVALID);
			err.message.should.equal('Invalid "to" phone number: 5138853322');
			done()
		})
	})
})