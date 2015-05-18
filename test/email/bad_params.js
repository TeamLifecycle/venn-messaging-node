var assert = require("assert")
var should = require("chai").should()
var client = require("../../lib/index").Email;
var MessagingUserStatus = require('../../lib/models/messaging_user_status');
var UserCodes = (new MessagingUserStatus()).StatusCodes;

describe('bad email parameters', function(){

	describe('"to" email address', function () {

		it('should show error if invalid "to" email address', function(done){
		client.initialize()
		client.send({to:"bob", from: "from@email.com", subject: "subject 321", message:"message-13579"}, function(err, result){
			should.exist(err);
			should.not.exist(result);
			err.code.should.equal(UserCodes.INVALID);
			done()
			})
		})

		it('should show error if "to" email address is missing', function(done){
			client.initialize()
			client.send({from: "from@email.com", subject: "subject 321", message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if "to" email address is null', function(done){
			client.initialize()
			client.send({to: null, from: "from@email.com", subject: "subject 321", message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if "to" email address is undefined', function(done){
			client.initialize()
			client.send({to: undefined, from: "from@email.com", subject: "subject 321", message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if "to" email address is an empty string', function(done){
			client.initialize()
			client.send({to: '', from: "from@email.com", subject: "subject 321", message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})
	})

	describe('"from" email address', function () {

		it('should show error if invalid "from" email address', function(done){
		client.initialize()
		client.send({to:"to@email.com", from: "bob", subject: "subject 321", message:"message-13579"}, function(err, result){
			should.exist(err);
			should.not.exist(result);
			err.code.should.equal(UserCodes.INVALID);
			done()
			})
		})

		it('should show error if "from" email address is missing', function(done){
			client.initialize()
			client.send({to: "to@email.com", subject: "subject 321", message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if "from" email address is null', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: null, subject: "subject 321", message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if "from" email address is undefined', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: undefined, subject: "subject 321", message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if "from" email address is an empty string', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: '', subject: "subject 321", message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})
	})

	describe('subject', function () {

		it('should show error if subject is missing', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: "from@email.com", message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if subject is null', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: "from@email.com", subject: null, message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if subject is undefined', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: "from@email.com", subject: undefined, message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if subject is an empty string', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: "from@email.com", subject: "", message:"message-13579"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})
	})

	describe('message', function () {

		it('should show error if message is missing', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: "from@email.com", subject: "subject"}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if message is null', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: "from@email.com", subject: "subject", message: null}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if message is undefined', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: "from@email.com", subject: "subject", message: undefined}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})

		it('should show error if message is an empty string', function(done){
			client.initialize()
			client.send({to: "to@email.com", from: "from@email.com", subject: "", message:""}, function(err, result){
				should.exist(err);
				should.not.exist(result);
				err.code.should.equal(UserCodes.INVALID);
				done()
			})
		})
	})
})