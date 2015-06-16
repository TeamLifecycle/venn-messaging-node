var Postal = require("../lib/index").Postal;

Postal.initialize()
var letter = {
	to: {
		name: 'Harry Zhang',
		address_line1: '123 Test Street',
        address_city: 'Mountain View',
        address_state: 'CA',
        address_zip: '94041',
        address_country: 'US'
	},
	from: {
		name: 'Ami Wang',
		address_line1: '123 Test Avenue',
        address_city: 'Mountain View',
        address_state: 'CA',
        address_zip: '94041',
        address_country: 'US'
	},
	file: "<html style='padding-top': 3in; 'margin': .5in;>HTML Letter for {{name}}</html>",
	variables: {
		name: 'Harry'
	}
};
Postal.send(letter, function(err, result){
	console.info("error:", err);
	console.info("sent with:", result);
})

/*var Lob = require('../lib/models/providers/postal/lob')
var client = new Lob({'api_key': 'test_450e97db60e3ad0af185783c4f26b575fa2'});

client.initialize();
var letter = {
	to: {
		name: 'Harry Zhang',
		address_line1: '123 Test Street',
        address_city: 'Mountain View',
        address_state: 'CA',
        address_zip: '94041',
        address_country: 'US'
	},
	from: {
		name: 'Ami Wang',
		address_line1: '123 Test Avenue',
        address_city: 'Mountain View',
        address_state: 'CA',
        address_zip: '94041',
        address_country: 'US'
	},
	file: "<html style='padding-top': 3in; 'margin': .5in;>HTML Letter for {{name}}</html>",
	variables: {
		name: 'Harry'
	},
	color: false,
	description: 'Zhang-Wang pudding tang',
	extra_service: 'certified',
	double_sided: true,
	template: true,
	metadata: {
		campaign: 'Hungry Hungry Hippo'
	}
};
client.send(letter, function (err, result) {
	console.log('postal err: ', err);
	console.log('postal result: ', result);
})*/