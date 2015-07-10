var debug                     = require('debug')('venn'),
    helpers                   = require("../../../services/helpers"),
    MessagingServiceProvider  = require("../../messaging_service_provider"),
    MessagingServiceStatus    = require('../../messaging_service_status'),
    MessagingUserStatus       = require('../../messaging_user_status');

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
      from: data.from || this.keys.from_email,
      to: data.to,
      subject: data.subject,
      html: data.message
    };

    // Validate from email
    var fromObj = validateFromEmail(emailData.from);
    if (!fromObj.valid) return callback(new MailgunUserStatus(fromObj.message, fromObj.statusCode));
    
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

MailgunUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
MailgunUserStatus.prototype.constructor = MailgunUserStatus;


/*=============================================================================

Define Mailgun Helper Functions

=============================================================================*/

/*
Validate that given from email exists and has correct format

@param email       The email to validate
@return             Object containing results of validation
                      - 'valid':        true if valid email, false otherwise
                      - 'message':      further information
                      - 'statusCode':   code corresponding to MailgunUserStatus parameter
*/
validateFromEmail = function(email) {

  var validateObj = {}
  validateObj.valid = false;
  validateObj.message = null;
  validateObj.statusCode = null;

  if (!email) {
    // Check that the email exists
    validateObj.message = 'No from email given';
    validateObj.statusCode = 'missing';

  } else if (!helpers.validateEmail(email)) {
    // Check that the email has valid format
    validateObj.message = 'From email must have proper format';
    validateObj.statusCode = 'invalid';

  } else {
    // Number is valid
    validateObj.valid = true;
    validateObj.message = 'valid';
    validateObj.statusCode = 'success';
  }

  return validateObj;
}


module.exports = Mailgun