var debug                     = require('debug')('venn'),
    request                   = require('request'),
    MessagingServiceProvider  = require("../../messaging_service_provider"),
    MessagingServiceStatus    = require('../../messaging_service_status'),
    MessagingUserStatus       = require('../../messaging_user_status');

/*=============================================================================

Define OneSignal Service Provider

=============================================================================*/
function OneSignal(keys){
  if (!keys) return
  this.name = "onesignal"
  this.keys = keys

  this.send = function(data, callback) {
    var context = this;
    var onesignalStat;
    var deviceType = getOneSignalDeviceType(data.deviceType);
    var notification = getOneSignalNotificationObject(deviceType, context.keys.app_id, data.deviceToken, data.message);

    request( getOneSignalRegisterOptions(context.keys.app_id, deviceType, data.deviceToken), function(err, result) {

      if (err) {
        onesignalStat = new OneSignalErrorStatus(err);
        debug("-_-_ FAILED with onesignal _-_-");
        debug(err);
        debug(onesignalStat);
        return callback(onesignalStat);

      } else if (result.statusCode != 200) {
        result.body.statusCode = result.statusCode;
        onesignalStat = new OneSignalErrorStatus(result.body);
        debug("-_-_ FAILED with onesignal _-_-");
        debug(onesignalStat);
        return callback(onesignalStat);
      }

      request( getOneSignalSendOptions(context.keys.api_key, notification), function(err, result) {

        if (err) {
          onesignalStat = new OneSignalErrorStatus(err);
          debug("-_-_ FAILED with onesignal _-_-");
          debug(err);
          debug(onesignalStat);
          return callback(onesignalStat);

        } else if (result.statusCode != 200) {
          result.body.statusCode = result.statusCode;
          onesignalStat = new OneSignalErrorStatus(result.body);
          debug("-_-_ FAILED with onesignal _-_-");
          debug(onesignalStat);
          return callback(onesignalStat);

        } else {
          onesignalStat = new OneSignalSuccessStatus(result.body);
          debug("-_-_ sent with onesignal _-_-");
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

Define One Signal Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from One Signal service  
*/
function OneSignalSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'onesignal');

  // Message successfully sent
  this.state.message = 'Recipient Id: ' + response.id;
  this.state.code = this.StatusCodes.SUCCESS;
}

OneSignalSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
OneSignalSuccessStatus.prototype.constructor = OneSignalSuccessStatus;

/*
Error Status

@param response     JSON response object from One Signal service  
*/
function OneSignalErrorStatus(response) {
  MessagingServiceStatus.call(this, 'onesignal');

  // There was an error when attempting to send message
  this.state.message = response.errors;

  if (response.statusCode == 400) this.state.code = this.StatusCodes.DATA_REJECTED;
  else this.state.code = this.StatusCodes.DEFAULT;
}

OneSignalErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
OneSignalErrorStatus.prototype.constructor = OneSignalErrorStatus;


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


/*=============================================================================

Define OneSignal Helper Functions

=============================================================================*/

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

getOneSignalSendOptions = function(apiKey, notification) {
  var options = {
    url: 'https://onesignal.com/api/v1/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + new Buffer(apiKey).toString('base64') 
    },
    json: true,
    body: notification
  };
  return options;
}

getOneSignalDeviceType = function (deviceTypeString) {

  // See http://documentation.onesignal.com/v2.0/docs/players-add-a-device for options
  switch (deviceTypeString.toLowerCase()) {
    case 'ios':
      return 0;
    case 'android':
      return 1;
    case 'amazon':
      return 2;
    case 'windows':
      return 3;
    // Not documented, but it seems to be the case from checking network activity in console
    case 'chrome':
      return 4
    case 'chrome-web':
      return 5
    default:
      return -1;
  }
}

getOneSignalNotificationObject = function (deviceType, appId, token, message) {
  var notification = {};
  notification.contents = {'en': message};
  notification.app_id = appId;

  // See http://documentation.onesignal.com/v2.0/docs/notifications-create-notification for options
  switch (deviceType) {

    case 0:
      notification.isIos = true;
      notification.include_ios_tokens = [token];
      break;

    case 1:
      notification.isAndroid = true;
      notification.include_android_reg_ids = [token];
      break;

    case 2:
      notification.isWP = true;
      notification.include_wp_urls = [token];
      break;

    case 3:
      notification.isAdm = true;
      notification.include_amazon_reg_ids = [token];
      break;

    case 4:
      notification.isChrome = true;
      notification.include_chrome_reg_ids = [token];
      break;

    case 5:
      notification.isChromeWeb = true;
      notification.include_chrome_web_reg_ids = [token];
      break;

    default:
      break;
  }

  return notification;
}



module.exports = OneSignal