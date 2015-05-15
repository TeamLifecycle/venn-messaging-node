var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');

/*=============================================================================

Define Twilio Service Provider

=============================================================================*/
function Twilio(keys){
  if (!keys) return
	this.name = "twilio"
	this.keys = keys

  this.initialize = function() {
    this.client = require('twilio')(this.keys.account_sid, this.keys.auth_token);
  }

  this.send = function(data, callback) {
    var context = this;
    var from = data.from || this.keys.from_phone;

    // Validate from number
    var fromObj = validateFromNumber(from);
    if (!fromObj.valid) return callback(new TwilioUserStatus(fromObj.message, fromObj.statusCode));

    debug("sending from number:", from)
    return this.client.sendMessage({
        to: twiliofyNumber(data.to),
        from: twiliofyNumber(from),
        body: data.message
    }, function(err, result) {
        var twilioStat;
        if (err) {
          twilioStat = new TwilioServiceStatus(err, false);
          debug("-_-_ FAILED with twilio _-_-");
          debug(twilioStat);
          return callback(twilioStat);
        } else {
          twilioStat = new TwilioServiceStatus(result, true);
          debug("-_-_ sent with twilio _-_-");
          result.service = context;
          result.status = twilioStat;
          debug(result);
          return callback(null, result);
        }
    });
  }

  this.initialize()
}

Twilio.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Twilio Service Status Handler

=============================================================================*/
function TwilioServiceStatus(response, success) {
  MessagingServiceStatus.call(this, 'twilio');
  
  if (success) {
    // Message successfully sent
    this.state.message = response.status;
    this.state.code = this.StatusCodes.SUCCESS;

  } else {
    // There was an error when attempting to send message
    this.state.message = response.message + ': ' + response.moreInfo;

    // See https://www.twilio.com/docs/errors/reference for status error codes
    if (response.code == 20003 || response.code == 20005) this.state.code = this.StatusCodes.LIMIT_EXCEEDED; // should only be code 20005, but Twilio doesn't seem to follow its own documentation
    else if (response.code == 21606) this.state.code = this.StatusCodes.DATA_REJECTED;
    else this.state.code = this.StatusCodes.DEFAULT;
  }
}

TwilioServiceStatus.prototype = Object.create(MessagingServiceStatus.prototype);
TwilioServiceStatus.prototype.constructor = TwilioServiceStatus;


/*=============================================================================

Define Twilio User Status Handler

=============================================================================*/
function TwilioUserStatus(message, code) {
  MessagingUserStatus.call(this, 'twilio');

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

TwilioUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
TwilioUserStatus.prototype.constructor = TwilioUserStatus;


/*=============================================================================

Define Twilio Helper Functions

=============================================================================*/

/*
Add a plus sign to a number

@param number       The number to change
@return             The given number with a plus in front
*/
twiliofyNumber = function(number) {
  return "+" + number
}

/*
Validate that given from number exists and has correct format

@param number       The number to validate
@return             Object containing results of validation
                      - 'valid':        true if valid number, false otherwise
                      - 'message':      further information
                      - 'statusCode':   code corresponding to TwilioUserStatus parameter
*/
validateFromNumber = function(number) {

  var validateObj = {}
  validateObj.valid = false;
  validateObj.message = null;
  validateObj.statusCode = null;

  if (!number) {
    // Check that the number exists
    validateObj.message = 'No from number given';
    validateObj.statusCode = 'missing';

  } else if (number.toString().length != 11) {
    // Check that the number has eleven digits
    validateObj.message = 'From number must have exactly 11 digits';
    validateObj.statusCode = 'invalid';

  } else {
    // Number is valid
    validateObj.valid = true;
    validateObj.message = 'valid';
    validateObj.statusCode = 'success';
  }

  return validateObj;
}


module.exports = Twilio