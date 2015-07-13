var debug                     = require('debug')('venn'),
    request                   = require("request"),
    MessagingServiceProvider  = require("../../messaging_service_provider"),
    MessagingServiceStatus    = require('../../messaging_service_status'),
    MessagingUserStatus       = require('../../messaging_user_status');

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
    var pushbotsStat;
    var deviceType = getType(data.deviceType);

    request( getRegisterOptions(context.keys.app_id, context.keys.app_secret, deviceType, data.deviceToken), function(err, result) {

      if (err) {
        pushbotsStat = new PushBotsErrorStatus(err);
        debug("-_-_ FAILED with pushbots _-_-");
        debug(pushbotsStat);
        return callback(pushbotsStat);

      } else if (result.statusCode != 200) {
        result.body.statusCode = result.statusCode;
        pushbotsStat = new PushBotsErrorStatus(result.body);
        debug("-_-_ FAILED with pushbots _-_-");
        debug(pushbotsStat);
        return callback(pushbotsStat);
      }

      request( getSendOptions(context.keys.app_id, context.keys.app_secret, deviceType, data.deviceToken, data.message), function(err, result) {
        
        if (err) {
          pushbotsStat = new PushBotsErrorStatus(err);
          debug("-_-_ FAILED with pushbots _-_-");
          debug(pushbotsStat);
          return callback(pushbotsStat);

        } else if (result.statusCode != 200) {
          result.body.statusCode = result.statusCode;
          pushbotsStat = new PushBotsErrorStatus(result.body);
          debug("-_-_ FAILED with pushbots _-_-");
          debug(pushbotsStat);
          return callback(pushbotsStat);

        } else {
          pushbotsStat = new PushBotsSuccessStatus(result);
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

Define Push Bots Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Push Bots service  
*/
function PushBotsSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'pushbots');

  // Message successfully sent
  this.state.message = response.statusCode + ': ' + response.statusMessage;
  this.state.code = this.StatusCodes.SUCCESS;
}

PushBotsSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
PushBotsSuccessStatus.prototype.constructor = PushBotsSuccessStatus;

/*
Error Status

@param response     JSON response object from Push Bots service  
*/
function PushBotsErrorStatus(response) {
  MessagingServiceStatus.call(this, 'pushbots');

  // There was an error when attempting to send message
  this.state.message = response.code + ': ' + response.message;

  // See https://pushbots.com/developer/api/1 for details
  if (response.statusCode == 400) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.statusCode == 401) this.state.code = this.StatusCodes.UNAUTHORIZED;
  else if (response.statusCode == 405) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.statusCode == 409) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.statusCode == 429) this.state.code = this.StatusCodes.LIMIT_EXCEEDED;
  else if (response.statusCode == 507) this.state.code = this.StatusCodes.LIMIT_EXCEEDED;
  else if (response.statusCode >= 500 && response.statusCode < 600) this.state.code = this.StatusCodes.SERVICE_DOWN;
  else this.state.code = this.StatusCodes.DEFAULT;
}

PushBotsErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
PushBotsErrorStatus.prototype.constructor = PushBotsErrorStatus;


/*=============================================================================

Define PushBots User Status Handler

=============================================================================*/
function PushBotsUserStatus(message, code) {
  MessagingUserStatus.call(this, 'pushbots');

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
      "platform": deviceType,
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

getType = function (deviceTypeString) {
  var type = null;

  // See https://pushbots.com/developer/api/1#push for options (look for platform)
  switch (deviceTypeString.toLowerCase()) {
    case 'ios':
      type = 0;
      break;
    case 'android':
      type = 1;
      break;
    default:
      type = -1;
      break;
  }

  return type.toString();
}

module.exports = PushBots