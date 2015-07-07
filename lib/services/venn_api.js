vennApiService = {};
var debug = require('debug')('venn');
var request = require("request");
var url = process.env.VENN_API_URL || "https://api.getvenn.io/v1"
var _ = require("underscore");
var h = require('./helpers');
debug("VENN_API_URL", process.env.VENN_API_URL)

/*=============================================================================

  Variables

=============================================================================*/
var context = this;
this.db = null;
this.App = null;
this.IntegrationType = null;
this.OrgIntegration = null;
this.AppLog = null;


/*=============================================================================

  Exposed Functions

=============================================================================*/

vennApiService.init = function (db) {
  context.db = db;

  // Initialize database models
  if (context.db !== null && context.db !== undefined) {
    context.App = db.model('App');
    context.IntegrationType = db.model('IntegrationType');
    context.OrgIntegration = db.model('OrgIntegration');
    context.AppLog = db.model('AppLog');
  }
}

vennApiService.getKeys = function (apikey, type, callback) {
  if (context.db) {
    return getKeysFromDB(apikey, type, callback);
  } else {
    return getKeysFromRequest(apikey, type, callback);
  }
};

vennApiService.getPriority = function (apikey, type, callback) {
  if (context.db) {
    return getPriorityFromDB(apikey, type, callback);
  } else {
    return getPriorityFromRequest(apikey, type, callback);
  }
};

vennApiService.postLog = function (apikey, log, callback) {
  if (context.db) {
    return postLogFromDB(apikey, log, callback);
  } else {
    return postLogFromRequest(apikey, log, callback);
  }
}


/*=============================================================================

  Helper Functions

=============================================================================*/

getUserApp = function (apikey, callback) {
  context.App.findOne({"key": apikey}, function (err, app) {
    callback(err, app);
  })
}

getKeysFromRequest = function (apikey, type, callback) {
  request({
    url: url + "/keys/" + type,
    method: "GET",
    json: true,
    headers: {
      "venn-api-key": apikey
    }
  },
  function (error, response, body) {
    debug("getKeys:", body)
    callback(error, body);
  });  
}

getKeysFromDB = function (apikey, type, callback) {
  getUserApp(apikey, function (err, userapp) {
    if (err) callback(err, null);

    context.IntegrationType.findOne({slug: type}, function (err, integrationType) {
      if (err) callback(err, null);

      context.OrgIntegration.find({app: userapp._id, "integration.type._id": integrationType._id, "active": true}, function (err, appIntegrations) {
        if (err) callback(err, null);
        if (!appIntegrations.length) callback({message: "no active services for type: " + type.toString()}, null);

        keys = {};
        _.each(appIntegrations, function (appint) {
          if (appint.active) keys[appint.integration.slug] = appint.requiredFields;
        })

        callback(null, h.keysToObj(keys));
      })
    })
  })
}

getPriorityFromRequest = function (apikey, type, callback) {
  request({
    url: url + "/priority/" + type,
    method: "GET",
    json: true,
    headers: {
      "venn-api-key": apikey
    }
  },
  function (error, response, body) {
    debug("getPriority:", error)
    debug("getPriority:", body)
    callback(error, body);
  });

};

getPriorityFromDB = function (apikey, type, callback) {
  getUserApp(apikey, function (err, userapp) {
    if (err) callback(err, null);

    random = Math.random();
    service = type;

    if (service === "email") {

      if (random <= 0.2) {
        callback(null, [ "mandrill", "postmark", "sendgrid", "mailgun" ]);

      } else if (random <= 0.4) {
        callback(null, [ "mailgun", "sendgrid", "mandrill", "postmark" ]);

      } else if (random <= 0.6) {
        callback(null, [ "postmark", "mailgun", "sendgrid", "mandrill" ]);

      } else if (random <= 0.8) {
        callback(null, [ "sendgrid", "mandrill", "mailgun", "postmark" ]);

      } else {
        callback(null, [ "sendgrid", "mandrill", "mailgun", "postmark" ]);
      }

    } else if (service === "push") {
      callback(null, [  "pushbots", "zeropush", "onesignal", "parse" ]);

    } else if (service === "sms") {
      callback(null, [ "twilio", "nexmo", "plivo", "sinch" ]);

    } else if (service === "postal") {
      callback(null, [ "lob", "trypaper" ]);

    } else {
      callback({"error": "invalid service parameter"}, null);
    }
  })
}

postLogFromRequest = function(apikey, log, callback) {
  request({
    url: url + '/app/log',
    method: 'POST',
    json: true,
    headers: {
      'venn-api-key': apikey
    },
    body: log
  },
  function (error, response, body) {
    debug('postLog:', error);
    debug('postLog:', body);
    if(callback)callback(error, body);
  })
}

postLogFromDB = function (apikey, log, callback) {
  getUserApp(apikey, function (err, userapp) {
    if (err) callback(err, null);

    log.forEach(function (entry) {
      context.OrgIntegration.findOne({'organization': userapp.organization, 'integration.slug': entry.service}, function (err, orgIntegration) {
        if (orgIntegration) {
          context.AppLog.create({'organization': userapp.organization, 'orgIntegration': orgIntegration._id, 'code': entry.code, 'message': entry.message}, function (err, appLog) {
            if (callback) callback(err, appLog);
          })
        }
      })
    })
  })
}


module.exports = vennApiService;