var assert = require("assert")
var should = require("chai").should()
var client = require("../../lib/index")().Push;
var MessagingUserStatus = require('../../lib/models/messaging_user_status');
var UserCodes = (new MessagingUserStatus()).StatusCodes;

describe('when push services up', function(){

	it('should show error if incorrect params', function(done){
		client.initialize()
		client.send({deviceType:"apple", deviceToken: "sdfsfd", message:"message-13579"}, function(err, result){
			should.exist(err);
			should.not.exist(result);
			err.code.should.equal(UserCodes.INVALID);
			err.message.should.equal('Invalid device type: apple');
			done()
		})
	})
})