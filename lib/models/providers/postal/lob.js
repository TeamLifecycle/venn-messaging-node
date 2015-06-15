var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');

/*=============================================================================

Define Lob Service Provider

=============================================================================*/
function Lob(keys){
  if (!keys) return
  this.name = 'lob'
  this.keys = keys

  this.initialize = function() {
    this.client = require('lob')(this.keys.api_key);
  }

  // Currently only supporting sending letters
  // See https://lob.com/docs/node#letters_create for details
  this.send = function(data, callback) {
    var context = this;

    var sendingData = {

    };

    this.client.create(sendingData, function (err, result) {

      var lobStat;
      if (err) {

        lobStat = new LobErrorStatus(err);
        debug("-_-_ FAILED with lob _-_-");
        debug(lobStat);
        return callback(lobStat);

      } else {

        lobStat = new LobSuccessStatus(result);
        debug("-_-_ sent with lob _-_-");
        result.service = context;
        result.status = lobStat;
        debug(result);
        return callback(null, result);
      }
    })
  }

  this.initialize()
}

Lob.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Lob Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Lob service  
*/
function LobSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'lob');

  // Put logic here for handling successful send
}

LobSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
LobSuccessStatus.prototype.constructor = LobSuccessStatus;

/*
Error Status

@param response     JSON response object from Lob service  
*/
function LobErrorStatus(response) {
  MessagingServiceStatus.call(this, 'lob');

  // Put logic here for handling any possible service errors
  // See https://lob.com/docs/node#errors for details
}

LobErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
LobErrorStatus.prototype.constructor = LobErrorStatus;


/*=============================================================================

Define Lob User Status Handler

=============================================================================*/
function LobUserStatus(message, code) {
  MessagingUserStatus.call(this, 'lob');

  // Put logic here for handling any possible user errors
}

LobUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
LobUserStatus.prototype.constructor = LobUserStatus;


/*=============================================================================

Define Lob Helper Functions

=============================================================================*/


module.exports = Lob