var SMS = require("../lib/index").SMS;

SMS.initialize()
var data = {
	// from: "13308463168",
	to: "15135057457",
	message: "hola !!"
}
SMS.send(data, function(err, result){
	console.info("error:", err);
	console.info("sent with:", result);
})
