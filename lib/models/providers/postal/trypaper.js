var debug = require('debug')('venn');
var request = require('request');
MessagingServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');

/*=============================================================================

Define TryPaper Service Provider

=============================================================================*/
function TryPaper(keys){
  if (!keys) return
  this.name = 'trypaper'
  this.keys = keys

  this.initialize = function() {
    // No packages to require, so nothing to do here...
  }

  this.send = function(data, callback) {
    var context = this;
    var mailing = getTryPaperMailingObject(data);

    request( getTryPaperMailingOptions(this.keys.api_key, mailing), function (err, result) {

      var tryPaperStat;
      if (err) {

        tryPaperStat = new TryPaperErrorStatus(err);
        debug("-_-_ FAILED with trypaper _-_-");
        debug(tryPaperStat);
        return callback(tryPaperStat);

      } else {

        tryPaperStat = new TryPaperSuccessStatus(result);
        debug("-_-_ sent with trypaper _-_-");
        result.service = context;
        result.status = tryPaperStat;
        debug(result);
        return callback(null, result);
      }
    })
  }

  this.initialize()
}

TryPaper.prototype = new MessagingServiceProvider()


/*=============================================================================

Define TryPaper Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from TryPaper service  
*/
function TryPaperSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'trypaper');

  // Put logic here for handling successful send
}

TryPaperSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
TryPaperSuccessStatus.prototype.constructor = TryPaperSuccessStatus;

/*
Error Status

@param response     JSON response object from TryPaper service  
*/
function TryPaperErrorStatus(response) {
  MessagingServiceStatus.call(this, 'trypaper');

  // Put logic here for handling any possible service errors
}

TryPaperErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
TryPaperErrorStatus.prototype.constructor = TryPaperErrorStatus;


/*=============================================================================

Define TryPaper User Status Handler

=============================================================================*/
function TryPaperUserStatus(message, code) {
  MessagingUserStatus.call(this, 'trypaper');

  // Put logic here for handling any possible user errors
}

TryPaperUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
TryPaperUserStatus.prototype.constructor = TryPaperUserStatus;


/*=============================================================================

Define TryPaper Helper Functions

=============================================================================*/

/*
Get request options for hitting TryPaper Mailing endpoint

@param apiKey       User api key for TryPaper api
@param mailingData  Formatted JSON object containing fields conforming to TryPaper documentation
@return             Request options object
*/
getTryPaperMailingOptions = function (apiKey, mailingData) {

  var options = {
    url: 'https://api.trypaper.com/Mailing',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    },
    json: true,
    body: mailingData
  };

  return options;
}

/*
Format incoming data to conform to TryPaper Mailing format
- See http://docs.trypaper.com/article/12-mailing for details

@param data         Incoming data to be formatted
@return             Formatted TryPaper mailing object
*/
getTryPaperMailingObject = function (data) {
  var mailing = {};

  // Required fields
  mailing.ReturnAddressId = data.from;
  mailing.Recipient = data.to;
  mailing.Content = data.file;
  mailing.ReplyEnvelopeAddressId = data.reply || data.from;

  // Optional fields
  if (typeof data.id != 'undefined') mailing.id = data.id;
  if (typeof data.batchId != 'undefined') mailing.batchId = data.batchId;
  if (typeof data.HIPAASensitive != 'undefined') mailing.HIPAASensitive = data.HIPAASensitive;

  return mailing;
}


module.exports = TryPaper