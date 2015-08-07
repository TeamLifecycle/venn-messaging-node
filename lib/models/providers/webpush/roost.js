var debug                 = require('debug')('venn');
MessagingServiceProvider  = require("../../messaging_service_provider");
MessagingServiceStatus    = require('../../messaging_service_status');
MessagingUserStatus       = require('../../messaging_user_status');

/*=============================================================================

Define Roost Service Provider

=============================================================================*/
function Roost(keys){
  if (!keys) return
  this.name = 'roost'
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
        serviceStat = new RoostErrorStatus(err);
        return callback(serviceStat);
      } else {
        // Handle result with our wrapper (defined below)
        // Make sure to attach the wrapped result as the status property of the original result object
        serviceStat = new RoostSuccessStatus(result);
        result.status = serviceStat;
        return callback(null, result);
      }
    })
    */
  }

  this.initialize()
}

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

  // Put logic here for handling successful send
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


module.exports = Roost