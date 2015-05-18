var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');

/*=============================================================================

Define Pushwoosh Service Provider

=============================================================================*/
function Pushwoosh(keys){
  if (!keys) return
	this.name = "pushwoosh"
	this.keys = keys

  this.initialize = function() {
    var Pushwoosh = require('pushwoosh-client');
    this.client= new Pushwoosh(this.keys.app_code, this.keys.auth_token);
  }

  this.send = function(data, callback) {
    var context = this;
    this.client.sendMessage(data.message, [data.deviceToken], function(err, result) {
      var pushwooshStat;
      if (err) {
        pushwooshStat = new PushwooshErrorStatus(err);
        debug("-_-_ FAILED with pushwoosh _-_-");
        debug(pushwooshStat);
        return callback(pushwooshStat);
      }
      else {
        debug("-_-_ sent with pushwoosh _-_-");
        if(!result) result = {}
        pushwooshStat = new PushwooshSuccessStatus(result);
        result.service = context;
        result.status = pushwooshStat;
        debug(result);
        return callback(null, result);
      }
    });
  }

  this.initialize()
}

Pushwoosh.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Pushwoosh Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Pushwoosh service  
*/
function PushwooshSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'pushwoosh');

  // Put logic here for handling successful sends
}

PushwooshSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
PushwooshSuccessStatus.prototype.constructor = PushwooshSuccessStatus;

/*
Error Status

@param response     JSON response object from Pushwoosh service  
*/
function PushwooshErrorStatus(response) {
  MessagingServiceStatus.call(this, 'pushwoosh');

  // Put logic here for handling any possible service errors
}

PushwooshErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
PushwooshErrorStatus.prototype.constructor = PushwooshErrorStatus;


/*=============================================================================

Define Pushwoosh User Status Handler

=============================================================================*/
function PushwooshUserStatus(message, code) {
  MessagingUserStatus.call(this, 'pushwoosh');

  // Put logic here for handling any possible user errors
}

PushwooshUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
PushwooshUserStatus.prototype.constructor = PushwooshUserStatus;


/*=============================================================================

Define Pushwoosh Helper Functions

=============================================================================*/


module.exports = Pushwoosh