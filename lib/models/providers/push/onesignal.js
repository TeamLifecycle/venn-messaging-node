var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');
var request = require('request');

/*=============================================================================

Define OneSignal Service Provider

=============================================================================*/
function OneSignal(keys){
  if (!keys) return
	this.name = "onesignal"
	this.keys = keys

  this.send = function(data, callback) {
    var context = this;
    var ios = 0;
    // appId, deviceType, token
    console.log(context.keys.app_id, context.keys.api_key, context.keys.api_key, data.deviceToken, data.message, ios)
    console.log("getOneSignalRegisterOptions", getOneSignalRegisterOptions(context.keys.app_id, ios, data.deviceToken))
    // appId, apiKey, token, message
    console.log("getOneSignalSendOptions", getOneSignalSendOptions(context.keys.app_id, context.keys.api_key, data.deviceToken, data.message))
    request( getOneSignalRegisterOptions(context.keys.app_id, ios, data.deviceToken), function(err, result) {
      // debug("onesignal register", err, result)
      request( getOneSignalSendOptions(context.keys.app_id, context.keys.api_key, data.deviceToken, data.message), function(err, result) {
        if (err) {
          onesignalStat = new OneSignalServiceStatus(err, false);
          debug("-_-_ FAILED with onesignal _-_-");
          debug(err.body);
          debug(onesignalStat);
          return callback(onesignalStat);
        } else {
          onesignalStat = new OneSignalServiceStatus(result, true);
          debug("-_-_ sent with onesignal _-_-");
          debug(result);
          result.service = context;
          result.status = onesignalStat;
          debug(result);
          return callback(null, result);
        }
      })
    });
  }

}

OneSignal.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Twilio Service Status Handler

=============================================================================*/
function OneSignalServiceStatus(response, success) {
  MessagingServiceStatus.call(this, 'onesignal');
  
  if (success) {
    // Message successfully sent
    this.state.message = response.statusCode;
    this.state.code = this.StatusCodes.SUCCESS;

  } else {
    // There was an error when attempting to send message
    this.state.message = response.message + ': ' + response.moreInfo;

    // See https://www.twilio.com/docs/errors/reference for status error codes
    if (response.code == 20003 || response.code == 20005) this.state.code = this.StatusCodes.LIMIT_EXCEEDED;
    else if (response.code == 21606) this.state.code = this.StatusCodes.DATA_REJECTED;
    else this.state.code = this.StatusCodes.DEFAULT;
  }
}

OneSignalServiceStatus.prototype = Object.create(MessagingServiceStatus.prototype);
OneSignalServiceStatus.prototype.constructor = OneSignalServiceStatus;


/*=============================================================================

Define OneSignal User Status Handler

=============================================================================*/
function OneSignalUserStatus(message, code) {
  MessagingUserStatus.call(this, 'onesignal');

  this.state.message = message;

  // Match desired code to standardized status code
  switch(code.toLowerCase()) {

    case 'missing':
      this.state.code = this.StatusCodes.MISSING;
      break;

    case 'invalid':
      this.state.code = this.StatusCodes.INVALID;
      break;

    default:
      this.state.code = this.StatusCodes.DEFAULT;
      break;
  }
}

OneSignalUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
OneSignalUserStatus.prototype.constructor = OneSignalUserStatus;


getOneSignalRegisterOptions = function(appId, deviceType, token) {
  var options = {
    url: 'https://onesignal.com/api/v1/players',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    json: true,
    body: {
      device_type: deviceType,
      identifier: token,
      app_id: appId
    }
  };
  return options;
}

getOneSignalSendOptions = function(appId, apiKey, token, message) {
  var options = {
    url: 'https://onesignal.com/api/v1/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + new Buffer(apiKey).toString('base64') 
    },
    json: true,
    body: {
      "contents": {"en": message},
      "app_id": appId,
      "isIos": true,
      "include_ios_tokens": [token]
    }
  };
  return options;
}



module.exports = OneSignal