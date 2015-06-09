var Push = require("../lib/index").Push;

Push.initialize()
var data = {
	deviceToken: "APA91bElxLJqs9ZQQLtEDDiaqSuVMGxkzNPAg4n2vY3oyhtFsIWlLMALSi7kK3O5l7H9up3ScJZJM4nBxoNlSjw_2f9AyUR2tGWrBGkRR1H4aHxU2Wu5WZzKafMBQN9iq9V7ONWqLwX9",
	deviceType: "android",
	message: "! ! ! hola ! ! !"
}
Push.send(data, function(err, result){
	console.info("error:", err);
	console.info("sent with:", result);
})
