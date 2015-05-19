var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');
var plivo = require('plivo-node');

/*=============================================================================

Define Plivo Service Provider

=============================================================================*/
function Plivo(keys){
  if (!keys) return
	this.name = "plivo"
	this.keys = keys

  this.initialize = function() {
    this.client = plivo.RestAPI({
      authId: this.keys.auth_id,
      authToken: this.keys.auth_token
    });
  }

  this.send = function(data, callback) {
    var context = this;

    var from = data.from || this.keys.from_phone;

    var params = {
      src: from,
      dst: data.to,
      text: data.message,
      type: "sms" 
    }

    this.client.send_message(params, function(status, result) {
      if (status >= 200 && status < 300) {
        plivoStat = new PlivoServiceStatus(result, true);
        debug("-_-_ sent with plivo _-_-");
        result.service = context;
        result.status = plivoStat;
        debug(result);
        return callback(null, result);
      } else {
        plivoStat = new PlivoServiceStatus(err, false);
        debug("-_-_ FAILED with plivo _-_-");
        debug(plivoStat);
        return callback(plivoStat);
      }
    });
  }

  this.initialize()

}

Plivo.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Plivo Service Status Handler

=============================================================================*/
function PlivoServiceStatus(response, success) {
  MessagingServiceStatus.call(this, 'plivo');
  
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

PlivoServiceStatus.prototype = Object.create(MessagingServiceStatus.prototype);
PlivoServiceStatus.prototype.constructor = PlivoServiceStatus;


/*=============================================================================

Define Plivo User Status Handler

=============================================================================*/
function PlivoUserStatus(message, code) {
  MessagingUserStatus.call(this, 'plivo');

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

PlivoUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
PlivoUserStatus.prototype.constructor = PlivoUserStatus;



module.exports = Plivo