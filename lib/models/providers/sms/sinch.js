var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');
var request = require('request');

/*=============================================================================

Define Sinch Service Provider

=============================================================================*/
function Sinch(keys){
  if (!keys) return
	this.name = "sinch"
	this.keys = keys

  this.send = function(data, callback) {
    var context = this;

    request( getOptions(data.to, this.keys.application_key, this.keys.application_secret, data.message), function(err, result) {
        if (err) {
          sinchStat = new SinchServiceStatus(err, false);
          debug("-_-_ FAILED with sinch _-_-");
          debug(sinchStat);
          return callback(sinchStat);
        } else {
          sinchStat = new SinchServiceStatus(result, true);
          debug("-_-_ sent with sinch _-_-");
          result.service = context;
          result.status = sinchStat;
          debug(result);
          return callback(null, result);
        }
    } );
  }

}

Sinch.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Twilio Service Status Handler

=============================================================================*/
function SinchServiceStatus(response, success) {
  MessagingServiceStatus.call(this, 'sinch');
  
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

SinchServiceStatus.prototype = Object.create(MessagingServiceStatus.prototype);
SinchServiceStatus.prototype.constructor = SinchServiceStatus;


/*=============================================================================

Define Sinch User Status Handler

=============================================================================*/
function SinchUserStatus(message, code) {
  MessagingUserStatus.call(this, 'sinch');

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

SinchUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
SinchUserStatus.prototype.constructor = SinchUserStatus;


getOptions = function(to, key, secret, message) {
  var options = {
    url: 'https://messagingapi.sinch.com/v1/sms/+' + to,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    json: true,
    'auth': {
      'user': key,
      'pass': secret
      // 'sendImmediately': false
    },
    body: {
      message: message
    }
  };
  console.log("options", options);
  return options;
}



module.exports = Sinch