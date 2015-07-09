var debug                     = require('debug')('venn'),
    plivo                     = require('plivo-node'),
    MessagingServiceProvider  = require("../../messaging_service_provider"),
    MessagingServiceStatus    = require('../../messaging_service_status'),
    MessagingUserStatus       = require('../../messaging_user_status');

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
      var plivoStat;

      if (status >= 200 && status < 300) {
        plivoStat = new PlivoSuccessStatus(result);
        debug("-_-_ sent with plivo _-_-");
        result.service = context;
        result.status = plivoStat;
        debug(result);
        return callback(null, result);

      } else {
        plivoStat = new PlivoErrorStatus(status, result);
        debug("-_-_ FAILED with plivo _-_-");
        debug(status, result);
        debug(plivoStat);
        return callback(plivoStat);
      }
    });
  }

  this.initialize()

}

Plivo.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Plivo Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Plivo service  
*/
function PlivoSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'plivo');

  // Message sent successfully
  this.state.message = response.message;
  this.state.code = this.StatusCodes.SUCCESS;
}

PlivoSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
PlivoSuccessStatus.prototype.constructor = PlivoSuccessStatus;

/*
Error Status

@param response     JSON response object from Plivo service
*/
function PlivoErrorStatus(status, response) {
  MessagingServiceStatus.call(this, 'plivo');
  
  // There was an error when attempting to send message
  this.state.message = status.toString() + ': ' + response.error;

  // See https://www.plivo.com/docs/api/response/ for details
  if (status == 400) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (status == 401) this.state.code = this.StatusCodes.UNAUTHORIZED;
  else if (status == 404) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (status == 405) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (status == 500) this.state.code = this.StatusCodes.SERVICE_DOWN;
  else this.state.code = this.StatusCodes.DEFAULT;
}

PlivoErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
PlivoErrorStatus.prototype.constructor = PlivoErrorStatus;


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


/*=============================================================================

Define Plivo Helper Functions

=============================================================================*/


module.exports = Plivo