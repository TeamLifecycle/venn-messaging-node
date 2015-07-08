var debug                     = require('debug')('venn'),
    request                   = require('request'),
    MessagingServiceProvider  = require("../../messaging_service_provider"),
    MessagingServiceStatus    = require('../../messaging_service_status'),
    MessagingUserStatus       = require('../../messaging_user_status');

/*=============================================================================

Define Sinch Service Provider

=============================================================================*/
function Sinch(keys){
  if (!keys) return
  this.name = "sinch"
  this.keys = keys

  this.send = function(data, callback) {
    var context = this;

    // from number not allowed
    // Sinch docs : In order to be allowed to set a custom “From” number 
    //   or alphanumeric, please contact our sales team.
    request( getOptions(data.to, this.keys.application_key, this.keys.application_secret, data.message), function(err, result) {
      var sinchStat;

      if (err) {
        // Something went wrong
        sinchStat = new SinchErrorStatus(err);
        debug("-_-_ FAILED with sinch _-_-");
        debug(sinchStat);
        return callback(sinchStat);

      } else {

        if (result.body.errorCode) {
          // Rejected by Sinch
          sinchStat = new SinchErrorStatus(result.body);
          debug("-_-_ FAILED with sinch _-_-");
          debug(sinchStat);
          return callback(sinchStat);

        } else {
          // Success
          sinchStat = new SinchSuccessStatus(result.body);
          debug("-_-_ sent with sinch _-_-");
          result.service = context;
          result.status = sinchStat;
          debug(result);
          return callback(null, result);
        }
      }
    });
  }

}

Sinch.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Sinch Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Sinch service  
*/
function SinchSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'sinch');

  // Message sent successfully
  this.state.message = 'Message ID: ' + response.messageId;
  this.state.code = this.StatusCodes.SUCCESS;
}

SinchSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
SinchSuccessStatus.prototype.constructor = SinchSuccessStatus;

/*
Error Status

@param response     JSON response object from Sinch service
*/
function SinchErrorStatus(response) {
  MessagingServiceStatus.call(this, 'sinch');
  
  // There was an error when attempting to send message
  this.state.message = response.message + ' -- Reference: ' + response.reference;

  // See https://www.sinch.com/docs/sms/#messagingapierrorcodes for details
  if (response.errorCode == 40001) this.state.code = this.state.StatusCodes.DATA_REJECTED;
  else if (response.errorCode == 40002) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.errorCode == 40003) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.errorCode == 40100) this.state.code = this.StatusCodes.UNAUTHORIZED;
  else if (response.errorCode == 40200) this.state.code = this.StatusCodes.LIMIT_EXCEEDED;
  else if (response.errorCode == 40300) this.state.code = this.StatusCodes.UNAUTHORIZED;
  else if (response.errorCode == 40301) this.state.code = this.StatusCodes.UNAUTHORIZED;
  else if (response.errorCode == 40303) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.errorCode == 50000) this.state.code = this.StatusCodes.SERVICE_DOWN;
  else this.state.code = this.state.StatusCodes.DEFAULT;
}

SinchErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
SinchErrorStatus.prototype.constructor = SinchErrorStatus;


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


/*=============================================================================

Define Sinch Helper Functions

=============================================================================*/

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
  return options;
}


module.exports = Sinch