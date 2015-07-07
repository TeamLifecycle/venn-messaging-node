var debug = require('debug')('venn');
var Email = require("../lib/index")().Email;

Email.initialize()
var data = {
	from: "from@venn.com",
	to: "testy@venn.com",
	subject: "subject-1",
	message: "message-1"
}
Email.send(data, function(err, result){
	console.info("error:", err);
	console.info("sent with:", result);
})
