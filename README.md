# Venn Email
[ ![Codeship Status for VennHQ/venn-email-node](https://codeship.com/projects/40a5efb0-c00d-0132-200e-021ec7688aff/status?branch=master)](https://codeship.com/projects/73117)

Build in a redundant messaging service seamlessly. If your email, sms or push notification provider goes down, we'll fall back to a secondary service.

# Use

### Install
```bash
npm install venn-messaging
```

## Functions
##### initialize(api_key)
|params         | type   |    description      | example                    |
|---------------| ----   |   --------------------------- | ------------     |
|api_key        | String |   Venn API Key    | 64d2fa24h3f6f7cc61asp3e8         |
#### Email Send
##### send(data, callback)
|params         | type   |    description      | example                    |
|---------------| ----   |   --------------------------- | ------------     |
|data.from           | String |   from email address    | from@email.com         |
|data.to             | String |   to email address      | to@email.com           |
|data.subject        | String |   email subject         | Subject 123            |
|data.message        | String |   email message         | How you doin?          |
#### SMS Send
##### send(data, callback)
|params         | type   |    description      | example                    |
|---------------| ----   |   --------------------------- | ------------     |
|data.from           | String |   from phone number    | +14354402246         |
|data.to             | String |   to phone number      | +1633050227           |
|data.message        | String |   text message         | How you doin?           |

### Email Example
```js
vennEmail = require("venn-messaging").Email;

// initialize and send an email
vennEmail.initialize(VENN_API_KEY)
var data = {
	from: "from@email.com",
	to: "to@email.com",
	subject: "Subject 123",
	message: "How you doin"
}
vennEmail.send(data, function(err, result){
	// email successfully sent if !err
})
```

### SMS Example
```js
vennSms = require("venn-messaging").SMS;

// initialize and send an SMS
vennSms.initialize(VENN_API_KEY)
var data = {
	from: "+14356650499",
	to: "+14503350029",
	message: "How you doin"
}
vennSms.send(data, function(err, result){
	// email successfully sent if !err
})
```




#Development

##### adding a new email provider
* write failing tests
* add service to lib/models/providers (copy an existing provider)
	* change initialize and send functions to service specific way of initializing client/sending message
* edit email_client.js and require lib/models/providers/[newservice].js
	* then add it in the configureServices
* add api key validator to Venn API

##### install dependencies
```
npm install
```

##### Run Example (need Venn login and email services turned on)
```
VENN_API_KEY="h41fa6602663b30c78b9c339" node examples/example.js
```

##### Run Example (with debug logging)
```
VENN_API_KEY=5f6abf85d1947ce29ce7332f VENN_API_URL=http://localhost:3400/v1 DEBUG=venn node examples/sms.js
```

##### Run Tests
###### Export api keys
```bash
mocha
```



