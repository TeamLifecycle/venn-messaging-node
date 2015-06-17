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

    handleTryPaperResponse( getTryPaperMailingOptions(this.keys.api_key, mailing), function (err, result) {

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

  this.state.message = response.message;
  this.state.code = this.StatusCodes.SUCCESS;
}

TryPaperSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
TryPaperSuccessStatus.prototype.constructor = TryPaperSuccessStatus;

/*
Error Status

@param response     JSON response object from TryPaper service  
*/
function TryPaperErrorStatus(response) {
  MessagingServiceStatus.call(this, 'trypaper');

  this.state.message = response.message;

  if (response.status_code == 400) this.state.code = this.StatusCodes.DATA_REJECTED;
  else if (response.status_code == 500) this.state.code = this.StatusCodes.SERVICE_DOWN;
  else this.state.code = this.StatusCodes.DEFAULT;
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
Parse the HTTP response from TryPaper servers

@param options      HTTP request options
@param callback     Function to call after parsing the response
*/
handleTryPaperResponse = function (options, callback) {

  request(options, function (err, result) {
    var response = {};

    // Something bad happened
    if (err) return callback(err, null);

    // Parse responses from TryPaper
    response.message = result.body;
    response.requestId = result.headers['x-requestid'];
    if (result.statusCode == 201) {
      // Success
      response.status_code = 201;
      return callback(null, response);

    } else if (result.statusCode == 400) {
      // Something wrong with options input
      response.status_code = 400;
      return callback(response, null);

    } else {
      // Something went wrong on TryPaper's end
      response.status_code = 500;
      return callback(response, null);
    }
  })
}

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
  if (typeof data.id != 'undefined') mailing.Id = data.id;
  if (typeof data.batchId != 'undefined') mailing.BatchId = data.batchId;
  if (typeof data.HIPAASensitive != 'undefined') mailing.HIPAASensitive = data.HIPAASensitive;
  if (typeof data.tags != 'undefined') mailing.Tags = data.tags;

  return mailing;
}


module.exports = TryPaper