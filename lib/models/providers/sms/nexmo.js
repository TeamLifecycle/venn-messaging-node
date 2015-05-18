var debug = require('debug')('venn');
EmailServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');

/*=============================================================================

Define Nexmo Service Provider

=============================================================================*/
function Nexmo(keys){
  if (!keys) return
	this.name = "nexmo"
	this.keys = keys

  this.initialize = function() {
    var API_PROTOCOL = "https"
    var DEBUG = false
    nexmo = require('easynexmo')
    nexmo.initialize(this.keys.api_key, this.keys.api_secret, API_PROTOCOL, DEBUG)
    this.client = nexmo
  }

  this.send = function(data, callback) {
    var context = this;
    this.client.sendTextMessage(this.keys.from_phone, data.to, data.message, {}, function(err, result){
      var nexmoStat;
      if (err) {
        nexmoStat = new NexmoErrorStatus(err);
        debug("-_-_ FAILED with nexmo _-_-");
        debug(nexmoStat);
        return callback(nexmoStat);
      } else {
        nexmoStat = new NexmoSuccessStatus(result);
        debug("-_-_ sent with nexmo _-_-");
        result.service = context;
        result.status = nexmoStat;
        debug(result);
        return callback(null, result);
      }
    })

  }

  this.initialize()
}

Nexmo.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Nexmo Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Nexmo service  
*/
function NexmoSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'nexmo');

  // Put logic here for handling successfull sends
}

NexmoSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
NexmoSuccessStatus.prototype.constructor = NexmoSuccessStatus;

/*
Error Status

@param response     JSON response object from Nexmo service  
*/
function NexmoErrorStatus(response) {
  MessagingServiceStatus.call(this, 'nexmo');

  // Put logic here for handling any possible service errors
}

NexmoErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
NexmoErrorStatus.prototype.constructor = NexmoErrorStatus;


/*=============================================================================

Define Nexmo User Status Handler

=============================================================================*/
function NexmoUserStatus(message, code) {
  MessagingUserStatus.call(this, 'nexmo');

  // Put logic here for handling any possible user errors
}

NexmoUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
NexmoUserStatus.prototype.constructor = NexmoUserStatus;


/*=============================================================================

Define Nexmo Helper Functions

=============================================================================*/


module.exports = Nexmo