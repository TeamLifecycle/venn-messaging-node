# Venn Email

[ ![Codeship Status for VennHQ/venn-email-node](https://codeship.com/projects/40a5efb0-c00d-0132-200e-021ec7688aff/status?branch=master)](https://codeship.com/projects/73117)

Build in a redundant messaging service seamlessly. If your email, sms or push notification provider goes down, we'll fall back to a secondary service.


## Installation
``` bash
npm install venn-messaging
```

## Email

#### initialize(api_key)
|params  |type   |description  |example                  |
|--------|-------|-------------|-------------------------|
|api_key |String |Venn API Key |64d2fa24h3f6f7cc61asp3e8 |

#### send(data, callback)
|params       |type   |description        |example        |
|-------------|-------|-------------------|---------------|
|data.from    |String |from email address |from@email.com |
|data.to      |String |to email address   |to@email.com   |
|data.subject |String |email subject      |Subject 123    |
|data.message |String |email message      |How you doin?  |

#### Example
``` javascript
vennEmail = require("venn-messaging").Email;

// initialize and send an email
vennEmail.initialize(VENN_API_KEY);

var data = {
	from: "from@email.com",
	to: "to@email.com",
	subject: "Subject 123",
	message: "How you doin?"
};

vennEmail.send(data, function(err, result){
	// email successfully sent if no error
});
```

## SMS

#### initialize(api_key)
|params  |type   |description  |example                  |
|--------|-------|-------------|-------------------------|
|api_key |String |Venn API Key |64d2fa24h3f6f7cc61asp3e8 |

#### send(data, callback)
|params       |type   |description       |example       |
|-------------|-------|------------------|--------------|
|data.from    |String |from phone number |+14354402246  |
|data.to      |String |to phone number   |+1633050227   |
|data.message |String |text message      |How you doin? |

#### Example
``` javascript
vennSms = require("venn-messaging").SMS;

// initialize and send an SMS
vennSms.initialize(VENN_API_KEY);

var data = {
	from: "+14356650499",
	to: "+14503350029",
	message: "How you doin?"
};

vennSms.send(data, function (err, result) {
	// text successfully sent if no error
});
```

## Push Notification

#### initialize(api_key)
|params  |type   |description  |example                  |
|--------|-------|-------------|-------------------------|
|api_key |String |Venn API Key |64d2fa24h3f6f7cc61asp3e8 |

#### send(data, callback)
|params           |type   |description           |example                      |
|-----------------|-------|----------------------|-----------------------------|
|data.deviceToken |String |id of target device   |FE66489F304DC75B8D6E8200DFF8 |
|data.deviceType  |String |type of target device |ios                          |
|data.message     |String |notification message  |How you doin?                |

#### Example
``` javascript
vennPush = require("venn-messaging").Push;

// initialize and send a push notification
vennPush.initialize(VENN_API_KEY);

var data = {
	deviceToken: "FE66489F304DC75B8D6E8200DFF8",
    deviceType: "ios",
    message: "How you doin?"
};

vennPush.send(data, function (err, result) {
	// push notification successfully sent if no error
});
```

## Development

### Install Dependencies
``` bash
npm install
```

### Export Environment Variables
``` bash
VENN_API_KEY="h41fa6602663b30c78b9c339"
VENN_API_URL="http://localhost:3400/v1"
```

### Run Examples
``` bash
node examples/example.js 
```

### Run Examples with Debugging
``` bash
VENN_API_KEY=5f6abf85d1947ce29ce7332f
VENN_API_URL=http://localhost:3400/v1
DEBUG="venn"
node examples/example.js
```

### Run Tests
``` bash
mocha
```

### Adding a New Service Provider
1. Write Failing Tests
  1. Create a new test file of the form `test/service_type/service_name/error.js`
  2. Copy `test/template/test_service_template.js` into this new file
  3. Follow instructions in the template file to create tests for the new service
2. Create the New Service Provider
  1. Install the service provider's npm package as a dependency
  2. Create a new file of the form `lib/models/providers/service_type/service_name.js`
  3. Copy `lib/models/providers/template/service_template.js` into this new file
  4. Follow instructions in the template file to create the new service
3. Edit `lib/models/messaging_client.js`
  1. Require the newly created service provider
  ``` javascript
  var ServiceName = require('./providers/service_type/service_name');
  ```
  2. Add the newly created service provider to `initServices`
  ``` javascript
  else if (property === "service_name" && keys[property]) {
  	messagingProvider = new ServiceName(keys[property]);
  }
  ```
4. Add api key validator to Venn API
