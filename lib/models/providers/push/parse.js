var debug                     = require('debug')('venn'),
    MessagingServiceProvider  = require("../../messaging_service_provider"),
    MessagingServiceStatus    = require('../../messaging_service_status'),
    MessagingUserStatus       = require('../../messaging_user_status');

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
    var parseStat;

    // TODO: should query to make sure installation hasn't been created yet
    context.client.insertInstallationData(data.deviceType, data.deviceToken, function(err, result){

      if (err) {
        parseStat = new ParseErrorStatus(err);
        debug("-_-_ FAILED with parse _-_-");
        debug("insertInstallationData err", err);
        debug(parseStat);
        return callback(parseStat);

      } else { debug("insertInstallationData result", result); }

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

      context.client.sendPush(notification, function(err, result){
        
        if (err) {
          parseStat = new ParseErrorStatus(err);
          debug("-_-_ FAILED with parse _-_-");
          debug(err);
          debug(parseStat);
          return callback(parseStat);

        } else {
          parseStat = new ParseSuccessStatus(result);
          debug("-_-_ sent with parse _-_-");
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

  // Message successfully sent
  this.state.message = response.result;
  this.state.code = this.StatusCodes.SUCCESS;
}

ParseSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
ParseSuccessStatus.prototype.constructor = ParseSuccessStatus;

/*
Error Status

@param response     JSON response object from Parse service  
*/
function ParseErrorStatus(response) {
  MessagingServiceStatus.call(this, 'parse');

  // There was an error when attempting to send message
  this.state.message = response.error;

  if (response.code == 115) this.state.code = this.StatusCodes.DATA_REJECTED;
  else this.state.code = this.StatusCodes.DEFAULT;
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