var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');

/*=============================================================================

Define Parse Service Provider

=============================================================================*/
function Parse(keys){
  if (!keys) return
	this.name = "parse"
	this.keys = keys

  this.initialize = function() {
    Parse = require('node-parse-api').Parse;
    var options = {
        app_id: this.keys.app_id,
        api_key: this.keys.api_key
    }
    debug("initing parse client", options)
    this.client = new Parse(options);
  }

  this.send = function(data, callback) {
    var context = this;

    // TODO: should query to make sure installation hasn't been created yet
    context.client.insertInstallationData(data.deviceType, data.deviceToken, function(err, result){
      if (err) { debug("insertInstallationData err", err); }
      else { debug("insertInstallationData result", result); }
      var notification = {
        where : {
           "deviceToken": { 
              "$in": [ data.deviceToken ] 
            }
        },
        data: {
          alert: data.message
        }
      };
      console.log(JSON.stringify(notification))
      context.client.sendPush(notification, function(err, result){
        var parseStat;
        debug(err, result)
        if (err) {
          parseStat = new ParseErrorStatus(err);
          debug("-_-_ FAILED with parse _-_-");
          debug(err);
          debug(parseStat);
          return callback(parseStat);
        }
        else {
          parseStat = new ParseSuccessStatus(result);
          debug("-_-_ sent with parse _-_-");
          debug(result);
          result.service = context;
          result.status = parseStat;
          debug(result);
          return callback(null, result);
        }
      });
    });

  }

  this.initialize()
}

Parse.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Parse Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Parse service  
*/
function ParseSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'parse');

  // Put logic here for handling successful sends
}

ParseSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
ParseSuccessStatus.prototype.constructor = ParseSuccessStatus;

/*
Error Status

@param response     JSON response object from Parse service  
*/
function ParseErrorStatus(response) {
  MessagingServiceStatus.call(this, 'parse');

  // Put logic here for handling any possible service errors
}

ParseErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
ParseErrorStatus.prototype.constructor = ParseErrorStatus;


/*=============================================================================

Define Parse User Status Handler

=============================================================================*/
function ParseUserStatus(message, code) {
  MessagingUserStatus.call(this, 'parse');

  // Put logic here for handling any possible user errors
}

ParseUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
ParseUserStatus.prototype.constructor = ParseUserStatus;


/*=============================================================================

Define Parse Helper Functions

=============================================================================*/


module.exports = Parse