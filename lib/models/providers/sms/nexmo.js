var debug                   = require('debug')('venn'),
    EmailServiceProvider    = require("../../messaging_service_provider"),
    MessagingServiceStatus  = require('../../messaging_service_status'),
    MessagingUserStatus     = require('../../messaging_user_status');

/*=============================================================================

Define Nexmo Service Provider

=============================================================================*/
function Nexmo(keys){
  if (!keys) return
  this.name = "nexmo"
  this.keys = keys

  this.initialize = function() {
    var API_PROTOCOL = "https"
    var DEBUG = false
    nexmo = require('easynexmo')
    nexmo.initialize(this.keys.api_key, this.keys.api_secret, API_PROTOCOL, DEBUG)
    this.client = nexmo
  }

  this.send = function(data, callback) {
    var context = this;
    this.client.sendTextMessage(this.keys.from_phone, data.to, data.message, {}, function(err, result){
      var nexmoStat;

      if (err) {
        // Something went wrong
        nexmoStat = new NexmoErrorStatus(err);
        debug("-_-_ FAILED with nexmo _-_-");
        debug(nexmoStat);
        return callback(nexmoStat);

      } else {

        if (parseInt(result.messages[0].status) != 0) {
          // Message rejected by Nexmo
          nexmoStat = new NexmoErrorStatus(result);
          debug("-_-_ FAILED with nexmo _-_-");
          debug(nexmoStat);
          return callback(nexmoStat);

        } else {
          // Success
          nexmoStat = new NexmoSuccessStatus(result);
          debug("-_-_ sent with nexmo _-_-");
          result.service = context;
          result.status = nexmoStat;
          debug(result);
          return callback(null, result);
        }
      }
    })

  }

  this.initialize()
}

Nexmo.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Nexmo Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Nexmo service  
*/
function NexmoSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'nexmo');

  // Create message string
  var parts = parseInt(response['message-count']);
  this.state.message = 'Sent to ' + response.messages[0].to + ' in ' + parts.toString() + ' parts: ';

  for (var i = 0; i < parts; i++) {
    this.state.message += response.messages[i]['message-id'];

    if (i != parts - 1) {
      this.state.message += ', ';
    }
  }

  // Message sent successfully
  this.state.code = this.StatusCodes.SUCCESS;
}

NexmoSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
NexmoSuccessStatus.prototype.constructor = NexmoSuccessStatus;

/*
Error Status

@param response     JSON response object from Nexmo service  
*/
function NexmoErrorStatus(response) {
  MessagingServiceStatus.call(this, 'nexmo');

  // There was an error when attempting to send message
  this.state.message = response.messages[0].status + ': ' + response.messages[0]['error-text'];

  // See https://docs.nexmo.com/index.php/sms-api/send-message#response_code for details
  var statusCode = parseInt(response.messages[0].status);
  if (statusCode == 1) this.state.code = this.StatusCodes.LIMIT_EXCEEDED;
  else if (statusCode == 2) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (statusCode == 3) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (statusCode == 4) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (statusCode == 5) this.state.code = this.StatusCodes.SERVICE_DOWN;
  else if (statusCode == 6) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (statusCode == 7) this.state.code = this.StatusCodes.UNAUTHORIZED;
  else if (statusCode == 8) this.state.code = this.StatusCodes.UNAUTHORIZED;
  else if (statusCode == 9) this.state.code = this.StatusCodes.LIMIT_EXCEEDED;
  else if (statusCode == 11) this.state.code = this.StatusCodes.UNAUTHORIZED;
  else if (statusCode == 12) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (statusCode == 13) this.state.code = this.StatusCodes.SERVICE_DOWN;
  else if (statusCode == 14) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (statusCode == 15) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (statusCode == 16) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (statusCode == 19) this.state.code = this.StatusCodes.UNAUTHORIZED;
  else if (statusCode == 20) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (statusCode == 29) this.state.code = this.StatusCodes.UNAUTHORIZED;
  else this.state.code = this.StatusCodes.DEFAULT;
}

NexmoErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
NexmoErrorStatus.prototype.constructor = NexmoErrorStatus;


/*=============================================================================

Define Nexmo User Status Handler

=============================================================================*/
function NexmoUserStatus(message, code) {
  MessagingUserStatus.call(this, 'nexmo');

  // Put logic here for handling any possible user errors
}

NexmoUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
NexmoUserStatus.prototype.constructor = NexmoUserStatus;


/*=============================================================================

Define Nexmo Helper Functions

=============================================================================*/


module.exports = Nexmo