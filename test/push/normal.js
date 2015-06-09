var assert = require("assert")
var nock = require("nock")
var client = require("../../lib/index").Push;

describe('when push services up', function(){

	describe('should send with parse when suggested first', function(){
		it('on ios', function(done){
			nock.cleanAll()
			nock('https://api.getvenn.io/v1')
				.get('/keys/push')
				.reply(200, {
					"parse": {
						"api_key": "a",
						"app_id": "b"
					}
				});
			nock('https://api.parse.com:443')
				.post('/1/installations/')
				.reply(201, [{}] );
			nock('https://api.parse.com:443')
				.post('/1/push/')
				.reply(201, [{}] );
			nock('https://api.getvenn.io/v1')
				.get('/priority/push')
				.reply(200, [ "parse"]);

			client.initialize()
			client.send({deviceToken:"12345", deviceType:"ios", message:"push message 29449"}, function(err, result){
				assert.notEqual(result, undefined);
				assert.equal(result.service, "parse");
				assert.equal(Object.keys(client.services).length, 1);
				done()
			})
		});

		it('on android', function(done){
			nock.cleanAll()
			nock('https://api.getvenn.io/v1')
				.get('/keys/push')
				.reply(200, {
					"parse": {
						"api_key": "a",
						"app_id": "b"
					}
				});
			nock('https://api.parse.com:443')
				.post('/1/installations/')
				.reply(201, [{}] );
			nock('https://api.parse.com:443')
				.post('/1/push/')
				.reply(201, [{}] );
			nock('https://api.getvenn.io/v1')
				.get('/priority/push')
				.reply(200, [ "parse"]);

			client.initialize()
			client.send({deviceToken:"12345", deviceType:"android", message:"push message 29449"}, function(err, result){
				assert.notEqual(result, undefined);
				assert.equal(result.service, "parse");
				assert.equal(Object.keys(client.services).length, 1);
				done()
			})
		})
	})

})