# unifina-core

Grails plugin providing core platform functionality


# StreamrClient

StreamrClient is a javascript library for subscribing to UI updates sent by the core via Kafka. It is used behind the scenes by the SignalPath modules that show a realtime UI. You can use it directly like this:

```javascript
client = new StreamrClient({ 
	// Connection options 
})
client.subscribe(
	"channel-id", 
	function(message) {
		// Do something with the message, which is an object
	},
	{ 
		// Subscription options 
	}
)
client.connect()
```

## Requirements

* socket.io

## Connection options:

Option | Default value | Description
------ | ------------- | -----------
socketIoUrl | http://localhost:8090 | Address of the `socketio-server` to connect to.

## Subscription options

Note that only one of the resend options can be used for a particular subscription. The default functionality is to resend nothing, only subscribe to messages from the subscription moment onwards.

Option | Default value | Description
------ | ------------- | -----------
resend_all | false | Set to `true` if you want all the messages for the channel resent from the earliest available message.
resend_last | 0 | Resend the previous `N` messages.
resend_from | null | Resend from a specific message number.

