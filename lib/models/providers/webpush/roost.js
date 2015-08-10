var debug                     = require('debug')('venn'),
    request                   = require('request'),
    MessagingServiceProvider  = require("../../messaging_service_provider"),
    MessagingServiceStatus    = require('../../messaging_service_status'),
    MessagingUserStatus       = require('../../messaging_user_status');

/*=============================================================================

Define Roost Service Provider

=============================================================================*/
function Roost(keys) {
  if (!keys) return;
  this.name = 'roost';
  this.keys = keys;

  this.send = function (data, callback) {
    var context = this;

    // Format and validate sending data
    var body = getRoostSendBody(data);

    // Make the request to Roost endpoint
    request( getRoostSendOptions(this.keys.api_key, this.keys.api_secret, body), function (err, result) {
      var roostStat;

      if (err) {
        roostStat = new RoostErrorStatus(err);
        debug("-_-_ FAILED with roost _-_-");
        debug(err);
        debug(roostStat);
        return callback(roostStat);

      } else if (result.statusCode != 200) {
        result.body.statusCode = result.statusCode;
        roostStat = new RoostErrorStatus(result.body);
        debug("-_-_ FAILED with roost _-_-");
        debug(roostStat);
        return callback(roostStat);

      } else {
        roostStat = new RoostSuccessStatus(result.body);
        result.service = context;
        result.status = roostStat;
        debug("-_-_ sent with roost _-_-");
        debug(result);
        return callback(null, result);
      }
    });
  };
};

Roost.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Roost Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Roost service  
*/
function RoostSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'roost');

  // Message successfully sent
  this.state.message = 'Notification Id: ' + response.notification_id + '. ' + response.message;
  this.state.code = this.StatusCodes.SUCCESS;
}

RoostSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
RoostSuccessStatus.prototype.constructor = RoostSuccessStatus;

/*
Error Status

@param response     JSON response object from Roost service  
*/
function RoostErrorStatus(response) {
  MessagingServiceStatus.call(this, 'roost');

  // Put logic here for handling any possible service errors
}

RoostErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
RoostErrorStatus.prototype.constructor = RoostErrorStatus;


/*=============================================================================

Define Roost User Status Handler

=============================================================================*/
function RoostUserStatus(message, code) {
  MessagingUserStatus.call(this, 'roost');

  // Put logic here for handling any possible user errors
}

RoostUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
RoostUserStatus.prototype.constructor = RoostUserStatus;


/*=============================================================================

Define Roost Helper Functions

=============================================================================*/

/*
Format incoming data to Roost specification

@param data             The incoming, unformatted data
@return                 The formatted JSON object
*/
getRoostSendBody = function (data) {

  // See http://docs.goroost.com/docs/specification for details.
  var sendBody = {
    alert:          data.message,
    url:            data.url,
    segments:       data.groups,
    aliases:        data.aliases,
    device_tokens:  data.devices,
    exclude_tokens: data.excludes,
    test_type:      data.type,
    schedule_for:   data.schedule
  };

  return sendBody;
};

/*
Format request options to Roost specification

@param apiKey           The HTTP basic-auth username for the request
@param apiSecret        The HTTP basic-auth password for the request
@param sendBody         The data to send formatted to Roost specification
@return                 The formatted JSON object
*/
getRoostSendOptions = function (apiKey, apiSecret, sendBody) {
  var buffer = apiKey + ':' + apiSecret;
  var auth = new Buffer(buffer).toString('base64');

  // See http://docs.goroost.com/docs/specification for details.
  var options = {
    url: 'https://api.goroost.com/api/push',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json'
    },
    json: true,
    body: sendBody
  };

  return options;
};


module.exports = Roost