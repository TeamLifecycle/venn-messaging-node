module.exports = function (db) {
	exports = {};

	// Pass database configuration to Venn API Services
	require('./services/venn_api').init(db);

	var MessagingClient = require("./models/messaging_client")
	exports.Email = new MessagingClient("email")
	exports.SMS = new MessagingClient("sms")
	exports.Push = new MessagingClient("push")

	return exports;	
};