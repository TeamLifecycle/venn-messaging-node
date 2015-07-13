var debug 						= require('debug')('venn'),
	zeroPush 					= require("nzero-push"),
	MessagingServiceProvider 	= require("../../messaging_service_provider"),
	MessagingServiceStatus 		= require('../../messaging_service_status'),
	MessagingUserStatus 		= require('../../messaging_user_status');

/*=============================================================================

Define ZeroPush Service Provider

=============================================================================*/
function ZeroPush(keys){
  if (!keys) return
  this.name = "zeropush"
  this.keys = keys

  this.initialize = function() {
    this.client = new zeroPush(this.keys.server_token);
  }

  this.send = function(data, callback) {
    var context = this;
    var zeropushStat;
	var deviceType = getType(data.deviceType);
	var notification = getNotificationObject(deviceType, data.message);

	context.client.register([data.deviceToken], function(err, response) {

		if (err) {
			zeropushStat = new ZeroPushErrorStatus(err);
			debug("-_-_ FAILED with zeropush _-_-");
            debug(zeropushStat);
            return callback(zeropushStat);
		}

		context.client.notify(deviceType, [data.deviceToken], notification, function (err, result) {

	        if (err) {
	          zeropushStat = new ZeroPushErrorStatus(err);
	          debug("-_-_ FAILED with zeropush _-_-");
	          debug(zeropushStat);
	          return callback(zeropushStat);
	        }
	        else {
	          zeropushStat = new ZeroPushSuccessStatus(result);
	          debug("-_-_ sent with zeropush _-_-");
	          result.service = context;
	          result.status = zeropushStat;
	          debug(result);
	          return callback(null, result);
	        }
		});
    });
  }

  debug("zeropush initing")
  this.initialize()
}

ZeroPush.prototype = new MessagingServiceProvider()


/*=============================================================================

Define Zero Push Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from Zero Push service  
*/
function ZeroPushSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'zeropush');

  // Message successfully sent
  this.state.message = 'Sent: ' +  response.sent_count;
  this.state.code = this.StatusCodes.SUCCESS;
}

ZeroPushSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
ZeroPushSuccessStatus.prototype.constructor = ZeroPushSuccessStatus;

/*
Error Status

@param response     JSON response object from Zero Push service  
*/
function ZeroPushErrorStatus(response) {
  MessagingServiceStatus.call(this, 'zeropush');

  // There was an error when attempting to send message
  this.state.message = response.name + ': ' + response.message;

  if (response.name === 'InvalidPayloadError') this.state.code = this.StatusCodes.DATA_REJECTED;
  else this.state.code = this.StatusCodes.DEFAULT;
}

ZeroPushErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
ZeroPushErrorStatus.prototype.constructor = ZeroPushErrorStatus;


/*=============================================================================

Define ZeroPush User Status Handler

=============================================================================*/
function ZeroPushUserStatus(message, code) {
  MessagingUserStatus.call(this, 'zeropush');

  // Put logic here for handling any possible user errors
}

ZeroPushUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
ZeroPushUserStatus.prototype.constructor = ZeroPushUserStatus;


/*=============================================================================

Define ZeroPush Helper Functions

=============================================================================*/

getType = function (deviceTypeString) {
	var type = null;

	// See https://github.com/linitix/nzero-push/wiki/notify for options (look for platform)
	switch (deviceTypeString.toLowerCase()) {
		case 'ios':
			type = 'ios_macos';
			break;
		case 'safari':
			type = 'safari';
			break;
		case 'android':
			type = 'android';
			break;
		default:
			type = 'invalid_device_type';
			break;
	}

	return type;
}

getNotificationObject = function (deviceType, message) {
	var notification = {}

	// See https://github.com/linitix/nzero-push/wiki/notify for options
	switch (deviceType.toLowerCase()) {
		case 'ios_macos':
			notification.alert = message;
			break;
		case 'safari':
			notification.body = message;
			break;
		case 'android':
			notification.data = {};
			notification.data.message = message;
			break;
		default:
			// Nothing to do
			break;
	}

	return notification;
}


module.exports = ZeroPush