var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider")
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');

/*=============================================================================

Define Mailgun Service Provider

=============================================================================*/
function Mailgun(keys){
  if (!keys) return
	this.name = "mailgun"
	this.keys = keys

  this.initialize = function() {
    this.client = require('mailgun-js')({apiKey: this.keys.api_key, domain: this.keys.domain});
  }

  this.send = function(data, callback) {
    var context = this;
    var emailData = {
      from: data.from,
      to: data.to,
      subject: data.subject,
      text: data.message
    };
    
    this.client.messages().send(emailData, function (err, body) {
        var mailgunStat;
        if (err) {
          mailgunStat = new MailgunErrorStatus(err);
          debug("-_-_ FAILED with mailgun _-_-");
          debug(mailgunStat);
          return callback(mailgunStat);
        } else {
          mailgunStat = new MailgunSuccessStatus(body);
          debug("-_-_ sent with mailgun _-_-");
          body.service = context;
          body.status = mailgunStat;
          debug(body);
          return callback(null, body);
        }
      });

  }

  this.initialize()
}

Mailgun.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Mailgun Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Mailgun service  
*/
function MailgunSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'mailgun');

  // Message successfully sent
  this.state.message = response.message;
  this.state.code = this.StatusCodes.SUCCESS;
}

MailgunSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
MailgunSuccessStatus.prototype.constructor = MailgunSuccessStatus;

/*
Error Status

@param response     JSON response object from Mailgun service  
*/
function MailgunErrorStatus(response) {
  MessagingServiceStatus.call(this, 'mailgun');

  // There was an error when attempting to send message
  this.state.message = response.message;

  // See https://documentation.mailgun.com/api-intro.html#errors for very minimal error documentation
  if (response.statusCode == 400) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.statusCode == 401) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.statusCode == 402 || this.state.message === 'Message limit reached.') this.state.code = this.StatusCodes.LIMIT_EXCEEDED;
  else if (response.statusCode == 404) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.statusCode >= 500 && response.statusCode <= 504) this.state.code = this.StatusCodes.SERVICE_DOWN;
  else this.state.code = this.StatusCodes.DEFAULT;
}

MailgunErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
MailgunErrorStatus.prototype.constructor = MailgunErrorStatus;


/*=============================================================================

Define Mailgun User Status Handler

=============================================================================*/
function MailgunUserStatus(message, code) {
  MessagingUserStatus.call(this, 'mailgun');

  // Put logic here for handling any possible user errors
}

MailgunUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
MailgunUserStatus.prototype.constructor = MailgunUserStatus;


/*=============================================================================

Define Mailgun Helper Functions

=============================================================================*/


module.exports = Mailgun