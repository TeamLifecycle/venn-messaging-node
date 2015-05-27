/*
Template Instructions

- Follow the general guidlines under each function and object
- Rename all instances of ServiceName to the appropriate name of the service being created
- Rename all instances of 'service_name' to the slug (all lowercase name) of the service being created
- Delete all templating comments after creating the new service
*/

var debug = require('debug')('venn');
MessagingServiceProvider = require("../../messaging_service_provider"); //
MessagingServiceStatus = require('../../messaging_service_status');     // Paths may change depending on location of new file
MessagingUserStatus = require('../../messaging_user_status');           //

/*=============================================================================

Define ServiceName Service Provider

=============================================================================*/
function ServiceName(keys){
  if (!keys) return
  this.name = 'service_name'
  this.keys = keys

  this.initialize = function() {
    // Require npm package and pass any api keys or login credentials here
    //this.client = require('npm package here');
  }

  this.send = function(data, callback) {
    var context = this;

    /*
    Define data to be sent here

    var sendingData = {
      // Data parameters go here
      // Setup incoming data to match the format for this specific service
    };
    */

    /*
    Send the formatted data via the service-specific sending function

    this.client.sendingFunction(sendingData, function (err, result) {
      // Handle errors and results here by wrapping them in our status handlers

      var serviceStat;
      if (err) {
        // Handle error with our wrapper (defined below)
        serviceStat = new ServiceNameErrorStatus(err);
        return callback(serviceStat);
      } else {
        // Handle result with our wrapper (defined below)
        // Make sure to attach the wrapped result as the status property of the original result object
        serviceStat = new ServiceNameSuccessStatus(result);
        result.status = serviceStat;
        return callback(null, result);
      }
    })
    */
  }

  this.initialize()
}

ServiceName.prototype = new MessagingServiceProvider()


/*=============================================================================

Define ServiceName Service Status Handlers

=============================================================================*/

/*
Success Status

@param response     JSON response object from ServiceName service  
*/
function ServiceNameSuccessStatus(response) {
  MessagingServiceStatus.call(this, 'service_name');

  // Put logic here for handling successful send
}

ServiceNameSuccessStatus.prototype = Object.create(MessagingServiceStatus.prototype);
ServiceNameSuccessStatus.prototype.constructor = ServiceNameSuccessStatus;

/*
Error Status

@param response     JSON response object from ServiceName service  
*/
function ServiceNameErrorStatus(response) {
  MessagingServiceStatus.call(this, 'service_name');

  // Put logic here for handling any possible service errors
}

ServiceNameErrorStatus.prototype = Object.create(MessagingServiceStatus.prototype);
ServiceNameErrorStatus.prototype.constructor = ServiceNameErrorStatus;


/*=============================================================================

Define ServiceName User Status Handler

=============================================================================*/
function ServiceNameUserStatus(message, code) {
  MessagingUserStatus.call(this, 'service_name');

  // Put logic here for handling any possible user errors
}

ServiceNameUserStatus.prototype = Object.create(MessagingUserStatus.prototype);
ServiceNameUserStatus.prototype.constructor = ServiceNameUserStatus;


/*=============================================================================

Define ServiceName Helper Functions

=============================================================================*/


module.exports = ServiceName