var Push = require("../lib/index").Push;

Push.initialize()
var data = {
	deviceToken: "e8336a100222783ba6421026129d3b64f37d921aa186b649233fdb43f342774d",
	deviceType: "ios",
	message: "! ! ! hola ! ! !"
}
Push.send(data, function(err, result){
	console.info("error:", err);
	console.info("sent with:", result);
})
