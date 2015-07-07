var debug                     = require('debug')('venn'),
    _                         = require("underscore"),
    helpers                   = require("../../../services/helpers"),
    MessagingServiceProvider  = require("../../messaging_service_provider"),
    MessagingServiceStatus    = require('../../messaging_service_status'),
    MessagingUserStatus       = require('../../messaging_user_status');

/*=============================================================================

Define Mandrill Service Provider

=============================================================================*/
function Mandrill(keys){
	this.name = "mandrill"
	this.keys = keys

  this.initialize = function() {
    var mandrill = require('mandrill-api/mandrill')
    this.client = new mandrill.Mandrill(this.keys.api_key);
  }

  this.send = function(data, callback) {
    var context = this
    var mandrillMessage = {
      'html': data.message,
      'subject': data.subject,
      'from_email': data.from || this.keys.from_email,
      'to': [
        {
          'email': data.to,
          'type': 'to'
        }
      ]
    };

    // Validate from email
    var fromObj = validateFromEmail(mandrillMessage.from_email);
    if (!fromObj.valid) return callback(new MandrillUserStatus(fromObj.message, fromObj.statusCode));

    return this.client.messages.send({
      'message': mandrillMessage
    }, (function(result) {
      isSent = _.indexOf(["sent", "queued", "scheduled"], result[0].status) > -1
      var mandrillStat;
      if(isSent){
        mandrillStat = new MandrillSuccessStatus(result[0]);
        debug("-_-_ sent with mandrill _-_-");
        result.service = context;
        result.status = mandrillStat;
        debug(result);
        return callback(null, result);
      } else {
        mandrillStat = new MandrillErrorStatus(result[0]);
        debug("-_-_ FAILED with mandrill _-_-");
        debug(mandrillStat);
        return callback(mandrillStat);
      }
    }), function(e) {
      mandrillStat = new MandrillErrorStatus(e);
      debug("-_-_ FAILED with mandrill _-_-");
      debug(mandrillStat);
      return callback(mandrillStat);
    });
  }

  this.initialize()
}

Mandrill.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Mandrill Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Mandrill service  
*/
function MandrillSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'mandrill');

  // Message successfully sent
  this.state.message = response.status;

  // Queued parsing
  this.state.code = (response.status === 'queued' ? this.StatusCodes.QUEUED : this.StatusCodes.SUCCESS);
}

MandrillSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
MandrillSuccessStatus.prototype.constructor = MandrillSuccessStatus;

/*
Error Status

@param response     JSON response object from Mandrill service  
*/
function MandrillErrorStatus(response) {
  MessagingServiceStatus.call(this, 'mandrill');

  // There was an error when attempting to send message
  this.state.message = response.name + ': ' + response.message;

  // See https://mandrillapp.com/api/docs/messages.html for errors
  if (response.name === 'PaymentRequired') this.state.code = this.StatusCodes.LIMIT_EXCEEDED;
  else if (response.name === 'ValidationError') this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.name === 'GeneralError') this.state.code = this.StatusCodes.SERVICE_DOWN;
  else this.state.code = this.StatusCodes.DEFAULT;
}

MandrillErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
MandrillErrorStatus.prototype.constructor = MandrillErrorStatus;


/*=============================================================================

Define Mandrill User Status Handler

=============================================================================*/
function MandrillUserStatus(message, code) {
  MessagingUserStatus.call(this, 'mandrill');

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

MandrillUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
MandrillUserStatus.prototype.constructor = MandrillUserStatus;


/*=============================================================================

Define Mandrill Helper Functions

=============================================================================*/

/*
Validate that given from email exists and has correct format

@param email       The email to validate
@return             Object containing results of validation
                      - 'valid':        true if valid email, false otherwise
                      - 'message':      further information
                      - 'statusCode':   code corresponding to MandrillUserStatus parameter
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


module.exports = Mandrill