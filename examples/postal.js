var Postal = require("../lib/index")().Postal;

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

/*var TryPaper = require('../lib/models/providers/postal/trypaper');
var client = new TryPaper({'api_key': 'TPTESTB1294DA3E3710F695B489B7E30'});

client.initialize();
var letter = {
	to: {
		"Name": "John Smith",
	    "Organization": "ACME, Inc.",
	    "AddressLineOne": "123 Any Street",
	    "AddressLineTwo": "Suite 789",
	    "City": "Anytown",
	    "Province": "WA",
	    "PostalCode": "12345",
	    "Country": "US"
	},
	from: '123_Test_St_Fake',
	file: "http://i.trypaper.com/pub/MacroniAndCheeseReference.pdf",
	tags: ["duplex", "force_bw"],
	HIPAASensitive: false,
	batchId: "Feb 2013 Invoices",
	id: "random_id_string"
};
client.send(letter, function (err, result) {
	console.log('postal err: ', err);
	console.log('postal result: ', result);
})*/