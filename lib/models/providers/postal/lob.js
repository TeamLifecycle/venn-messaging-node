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
      // Required fields
      to: data.to,
      from: data.from,
      file: data.file,
      color: data.color || false // Default to no color mail
    };

    // Optional fields
    if (typeof data.description != 'undefined') sendingData.description = data.description;
    if (typeof data.variables != 'undefined') sendingData.data = data.variables;
    if (typeof data.extra_service != 'undefined') sendingData.extra_service = data.extra_service;
    if (typeof data.double_sided != 'undefined') sendingData.double_sided = data.double_sided;
    if (typeof data.template != 'undefined') sendingData.template = data.template;
    if (typeof data.metadata != 'undefined') sendingData.metadata = data.metadata;

    this.client.letters.create(sendingData, function (err, result) {

      var lobStat;
      if (err || result.status_code != 200) {

        lobStat = new LobErrorStatus(err || result);
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

  this.state.message = response;
  this.state.code = this.StatusCodes.SUCCESS;
}

LobSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
LobSuccessStatus.prototype.constructor = LobSuccessStatus;

/*
Error Status

@param response     JSON response object from Lob service  
*/
function LobErrorStatus(response) {
  MessagingServiceStatus.call(this, 'lob');

  this.state.message = response.message;

  // See https://lob.com/docs/node#errors for details
  if (response.status_code == 404) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.status_code == 422) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.status_code == 500) this.state.code = this.StatusCodes.SERVICE_DOWN;
  else this.state.code = this.StatusCodes.DEFAULT;
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