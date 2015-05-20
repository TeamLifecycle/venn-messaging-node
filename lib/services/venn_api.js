var debug = require('debug')('venn');
vennApiService = {};
var request = require("request");
var url = process.env.VENN_API_URL || "https://api.getvenn.io/v1"
debug("VENN_API_URL", process.env.VENN_API_URL)

vennApiService.getKeys = function(apikey, type, callback) {
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

};

vennApiService.getPriority = function(apikey, type, callback) {
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

vennApiService.postLog = function(apikey, log, callback) {
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

module.exports = vennApiService;