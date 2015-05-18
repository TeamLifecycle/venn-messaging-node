var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider")
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');

/*=============================================================================

Define Postmark Service Provider

=============================================================================*/
function Postmark(keys){
  if (!keys) return
  this.name = "postmark"
  this.keys = keys

  this.initialize = function() {
    var postmark = require("postmark")
    this.client = new postmark.Client(this.keys.server_key);
  }

  this.send = function(data, callback) {
    var context = this;
    this.client.sendEmail({
        "From": data.from, 
        "To": data.to, 
        "Subject": data.subject, 
        "TextBody": data.message
    }, function(err, result) {
        var postmarkStat;
        if(err) {
          postmarkStat = new PostmarkErrorStatus(err);
          debug("-_-_ FAILED with postmark _-_-");
          debug(postmarkStat);
          return callback(postmarkStat);
        }
        else {
          postmarkStat = new PostmarkSuccessStatus(result);
          debug("-_-_ sent with postmark _-_-");
          result.service = context;
          result.status = postmarkStat;
          debug(result);
          return callback(null, result);
        }
    });
  }

  this.initialize()
}

Postmark.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Postmark Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Postmark service  
*/
function PostmarkSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'postmark');

  // Message successfully sent
  this.state.message = response.Message;
  this.state.code = this.StatusCodes.SUCCESS;
}

PostmarkSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
PostmarkSuccessStatus.prototype.constructor = PostmarkSuccessStatus;

/*
Error Status

@param response     JSON response object from Postmark service  
*/
function PostmarkErrorStatus(response) {
  MessagingServiceStatus.call(this, 'postmark');

  // There was an error when attempting to send message
  this.state.message = response.code + ': ' + response.message;

  // See http://developer.postmarkapp.com/developer-api-overview.html for status error codes
  if (response.code == 405) this.state.code = this.StatusCodes.LIMIT_EXCEEDED;
  else this.state.code = this.StatusCodes.DEFAULT;
}

PostmarkErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
PostmarkErrorStatus.prototype.constructor = PostmarkErrorStatus;


/*=============================================================================

Define Postmark User Status Handler

=============================================================================*/
function PostmarkUserStatus(message, code) {
  MessagingUserStatus.call(this, 'postmark');

  // Put logic here for handling any possible user errors
}

PostmarkUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
PostmarkUserStatus.prototype.constructor = PostmarkUserStatus;


/*=============================================================================

Define Postmark Helper Functions

=============================================================================*/


module.exports = Postmark