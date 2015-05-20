var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');
var request = require("request")

// pushbots npm package didnt support sending to single device
// or registering

/*=============================================================================

Define PushBots Service Provider

=============================================================================*/
function PushBots(keys){
  if (!keys) return
  this.name = "pushbots"
  this.keys = keys

  this.initialize = function() {
    this.client = new pushbots.api({
  		id: this.keys.app_id,
  		secret: this.keys.app_secret
  	});
  }

  this.send = function(data, callback) {
    var context = this;
    var ios = "0";

    request( getRegisterOptions(context.keys.app_id, context.keys.app_secret, ios, data.deviceToken), function(err, result) {
      if(err) console.error("register err", err)
      request( getSendOptions(context.keys.app_id, context.keys.app_secret, ios, data.deviceToken, data.message), function(err, result) {
        if (err) {
          pushbotsStat = new PushBotsServiceStatus(err, false);
          debug("-_-_ FAILED with pushbots _-_-");
          debug(pushbotsStat);
          return callback(pushbotsStat);
        } else {
          pushbotsStat = new PushBotsServiceStatus(result, true);
          debug("-_-_ sent with pushbots _-_-");
          result.service = context;
          result.status = pushbotsStat;
          debug(result);
          return callback(null, result);
        }
      })
    });
  }


}

PushBots.prototype = new MessagingServiceProvider()


/*=============================================================================

Define PushBots Service Status Handler

=============================================================================*/
function PushBotsServiceStatus(response, success) {
  MessagingServiceStatus.call(this, 'zeropush');

  // Put logic here for handling any possible service errors
}

PushBotsServiceStatus.prototype = Object.create(MessagingServiceStatus.prototype);
PushBotsServiceStatus.prototype.constructor = PushBotsServiceStatus;


/*=============================================================================

Define PushBots User Status Handler

=============================================================================*/
function PushBotsUserStatus(message, code) {
  MessagingUserStatus.call(this, 'zeropush');

  // Put logic here for handling any possible user errors
}

PushBotsUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
PushBotsUserStatus.prototype.constructor = PushBotsUserStatus;


/*=============================================================================

Define PushBots Helper Functions

=============================================================================*/
getRegisterOptions = function(appId, appSecret, deviceType, token) {
  return {
    url: 'https://api.pushbots.com/deviceToken',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-pushbots-appid': appId,
      'x-pushbots-secret': appSecret
    },
    json: true,
    body: {
      "platform" : deviceType,
      "token": token
    }
  };
}

getSendOptions = function(appId, appSecret, deviceType, token, message) {
 return {
    url: 'https://api.pushbots.com/push/one',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pushbots-appid': appId,
      'x-pushbots-secret': appSecret
    },
    json: true,
    body: {
      "platform": deviceType,
      "token": token,
      "msg": message,
      "sound" : "" ,
      "badge" : "" ,
      "payload" : {} 
    }
  };
}

module.exports = PushBots