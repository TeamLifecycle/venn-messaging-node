var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider")
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');

/*=============================================================================

Define Sendgrid Service Provider

=============================================================================*/
function Sendgrid(keys){
  if (!keys) return
	this.name = "sendgrid"
	this.keys = keys

  this.initialize = function() {
    this.client = require('sendgrid')(this.keys.api_user, this.keys.api_key);
  }

  this.send = function(data, callback) {
    var context = this;
    return this.client.send({
      to: data.to,
      from: data.from,
      subject: data.subject,
      text: data.message
    }, function(err, result) {
      var sendgridStat;
      if (err) {
        sendgridStat = new SendgridErrorStatus(err);
        debug("-_-_ FAILED with sendgrid _-_-");
        debug(sendgridStat);
        return callback(sendgridStat);
      } else {
        sendgridStat = new SendgridSuccessStatus(result);
        debug("-_-_ sent with sendgrid _-_-");
        result.service = context;
        result.status = sendgridStat;
        debug(result);
        return callback(null, result);
      }
    });
  }

  this.initialize()
}

Sendgrid.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Sendgrid Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Sendgrid service  
*/
function SendgridSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'sendgrid');

  // Message successfully sent
  this.state.message = response.message;
  this.state.code = this.StatusCodes.SUCCESS;
}

SendgridSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
SendgridSuccessStatus.prototype.constructor = SendgridSuccessStatus;

/*
Error Status

@param response     JSON response object from Sendgrid service  
*/
function SendgridErrorStatus(response) {
  MessagingServiceStatus.call(this, 'sendgrid');

  // There was an error when attempting to send message
  this.state.message = response.message;

  // See https://sendgrid.com/docs/API_Reference/Web_API_v3/index.html for errors
  // Currently unable to access the HTTP statusCode of the error response, so we must rely on the error messages
  if (this.state.message === 'Maximum credits exceeded') this.state.code = this.StatusCodes.LIMIT_EXCEEDED;
  else if (this.state.message === 'sendgrid error') this.state.code = this.StatusCodes.SERVICE_DOWN;
  else this.state.code = this.StatusCodes.DEFAULT;
}

SendgridErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
SendgridErrorStatus.prototype.constructor = SendgridErrorStatus;


/*=============================================================================

Define Sendgrid User Status Handler

=============================================================================*/
function SendgridUserStatus(message, code) {
  MessagingUserStatus.call(this, 'sendgrid');

  // Put logic here for handling any possible user errors
}

SendgridUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
SendgridUserStatus.prototype.constructor = SendgridUserStatus;


/*=============================================================================

Define Sendgrid Helper Functions

=============================================================================*/


module.exports = Sendgrid