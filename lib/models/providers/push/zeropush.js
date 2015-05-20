var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider");
MessagingServiceStatus = require('../../messaging_service_status');
MessagingUserStatus = require('../../messaging_user_status');
var zeroPush = require("nzero-push")

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

	context.client.register([data.deviceToken], [], function(err, response) {
		if (err) console.error(err);
		context.client.notify("ios_macos", [data.deviceToken], {alert: data.message}, function (err, result) {
	        if (err) {
	          zeropushStat = new ZeroPushServiceStatus(err, false);
	          debug("-_-_ FAILED with zeropush _-_-");
	          debug(zeropushStat);
	          return callback(zeropushStat);
	        }
	        else {
	          zeropushStat = new ZeroPushServiceStatus(result, true);
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

Define ZeroPush Service Status Handler

=============================================================================*/
function ZeroPushServiceStatus(response, success) {
  MessagingServiceStatus.call(this, 'zeropush');

  // Put logic here for handling any possible service errors
}

ZeroPushServiceStatus.prototype = Object.create(MessagingServiceStatus.prototype);
ZeroPushServiceStatus.prototype.constructor = ZeroPushServiceStatus;


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


module.exports = ZeroPush