'use strict';

var kafka = require('kafka-node');
var io = require('socket.io')(8090);
var argv = require('optimist')
	.usage('Usage: $0 --zookeeper conn_string')
	.demand(['zookeeper'])
	.argv;

var client = new kafka.Client(argv.zookeeper);
var kafkaOptions = { 
	autoCommit: false, 
	fromOffset: true
}

var consumer = new kafka.Consumer(client, [], kafkaOptions);
var offset = new kafka.Offset(client);

// KAFKA HELPER FUNCTIONS

function kafkaGetOffset(topic, earliest, cb, retryCount) {
	offset.fetch([{topic:topic, time: (earliest ? -2 : -1)}], function (err, offsets) {
		// If the topic does not exist, the fetch request may fail with LeaderNotAvailable
		// or UnknownTopicOrPartition. It may also succeed but return an empty partition list.
		// Retry up to 10 times with 500ms intervals
		
		if (err=="LeaderNotAvailable" || err=="UnknownTopicOrPartition" || offsets[topic]["0"]==null || !offsets[topic]["0"].length) {
			retryCount = retryCount || 1
			
			if (retryCount <= 10) {
				console.log("Got LeaderNotAvailable for "+topic+", retry "+retryCount+" in 500ms...")
				setTimeout(function() {
					kafkaGetOffset(topic, earliest, cb, retryCount+1)
				}, 500)
			}
			else {
				console.log("ERROR max retries reached, unable to fetch offset for "+topic)
			}
		}
		else if (err) {
			console.log("ERROR kafkaGetOffsets: "+err)
		}
		else {	
			console.log((earliest ? "Earliest offset: " : "Latest offset: ")+JSON.stringify(offsets))
			var offset = offsets[topic]["0"][0]
			cb(offset, earliest)
		}
	});
} 

function kafkaSubscribe(topic, fromOffset) {
	var sub = function(offset) {
		consumer.addTopics([{topic:topic, offset:offset}], function (err, added) {
			if (err)
				console.log("ERROR kafkaSubscribe: "+err)
			else 
				console.log("Subscribed to Kafka topic: "+topic+" from offset "+offset)
		}, true)
	}

	// Subscribe from latest offset if not explicitly given
	if (fromOffset==null)
		kafkaGetOffset(topic, false, sub)
	else 
		sub(fromOffset)
}

function kafkaUnsubscribe(topic) {
	consumer.removeTopics([topic], function (err, removed) {
		if (err)
			console.log("ERROR kafkaUnsubscribe: "+err)
		else
			console.log("Unsubscribed from topic: "+topic)
	});
}

// TODO: support multiple-topic resend requests to save client/consumer resources
function kafkaResend(topic, fromOffset, toOffset, handler, cb) {
	if (toOffset<0 || toOffset < fromOffset) {
		console.log("Nothing to resend for topic "+topic)
		cb()
	}
	else {
		// Create a local client and consumer for each resend request
		var client = new kafka.Client(argv.zookeeper);
		var consumer = new kafka.Consumer(client, [], kafkaOptions);
	
		consumer.on('message', function(message) {
			if (message.offset >= fromOffset && message.offset <= toOffset) {
				handler(message.value)
	
				if (message.offset === toOffset) {
					console.log("Resend ready, closing consumer...")
					consumer.close()
					client.close()
					cb()
				}
			}
			else {
				console.log("Received extra message during resend")
			}
		})
	
		var req = {
			topic: topic,
			offset: fromOffset
		}
	
		consumer.addTopics([req], function (err, added) {
			if (err)
				console.log("ERROR kafkaSubscribe: "+err)
			else 
				console.log("Resending topic: "+req.topic+" from offset "+fromOffset +" to "+toOffset)
		}, true);
	}
}

function handleResendRequest(socket, req) {
	// Resend on subcribe functionality
	var from = null
	var	to = null
	var handler = function(message) {
		// Emit to client private channel
		emitUiMessage(message, socket.id)
	}
	var callback = function() {
		console.log("Resend complete! Emitting resent event")
		
		// The nothing-to-resend response does not contain from and to fields
		if (to<0) 
			socket.emit('resent', {channel: req.channel})
		else 
			socket.emit('resent', {channel: req.channel, from:from, to:to})
	}
	var tryStartResend = function() {
		if (from!=null && to!=null) {
			socket.emit('expect', {channel: req.channel, from:from})
			kafkaResend(req.channel, from, to, handler, callback)
		}
	}

	// Subscribe from beginning
	if (req.resend_all===true) {
		console.log("Requested resend for all messages on channel "+req.channel)
		kafkaGetOffset(req.channel, true, function(minOffset) {
			from = minOffset
			tryStartResend()
		})
		kafkaGetOffset(req.channel, false, function(maxOffset) {
			to = maxOffset - 1
			tryStartResend()
		})
	}
	// Subscribe from a given offset 
	else if (req.resend_from!=null) {
		console.log("Requested resend from "+req.resend_from+" on channel "+req.channel)

		kafkaGetOffset(req.channel, false, function(maxOffset) {
			to = maxOffset - 1
			
			kafkaGetOffset(req.channel, true, function(minOffset) {
				from = Math.min(maxOffset, Math.max(minOffset, req.resend_from))
				tryStartResend()
			})
		})
	}
	// Subscribe from last N messages
	else if (req.resend_last) {
		console.log("Requested the last "+req.resend_last+" messages in channel "+req.channel)
		kafkaGetOffset(req.channel, false, function(maxOffset) {
			to = maxOffset - 1

			// Now check the earliest offset
			kafkaGetOffset(req.channel, true, function(minOffset) {
				from = Math.max(offset - req.options.resend_last, minOffset)
				tryStartResend()
			})
		})
	}
}

function emitUiMessage(data, channel) {
	// Try to parse channel from message if not specified
	if (!channel) {
		if (typeof data == 'string' || data instanceof String) {
			var idx = data.indexOf("\"channel\":")
			channel = data.substring(idx+11, data.indexOf("\"",idx+11))
		}
		else channel = data.channel
	}
	
	io.sockets.in(channel).emit('ui', data);
}

// KAFKA CLIENT EVENT HANDLERS

client.on('error', function(err) {
	console.log("kafka client error: "+err)
})

// KAFKA MSG HANDLERS

consumer.on('message', function (message) {
	emitUiMessage(message.value, message.topic)
});
consumer.on('error', function (err) {
    console.log('error', err);
});
consumer.on('offsetOutOfRange', function (topic) {
	console.log("Offset out of range for topic: "+JSON.stringify(topic))
})

// SOCKET.IO EVENT HANDLERS

io.on('connection', function (socket) {
	console.log("Client connected: "+socket.id)

	var channels = []
	
	socket.on('subscribe', function(subscriptions) {
		var subCount = 0
		console.log("Client "+socket.id+" subscriptions: "+JSON.stringify(subscriptions))
		
		subscriptions.forEach(function(sub) {
			socket.join(sub.channel, function(err) {
				console.log("Socket "+socket.id+" is now in rooms: "+socket.rooms)
				subCount++
				
				if (subCount===subscriptions.length) {
					// Ack subscription
					socket.emit('subscribed', {channels:channels, error:err})						
				}
				
				var resendReq = sub.options
				resendReq.channel = sub.channel
				handleResendRequest(socket, resendReq)
			})

			channels.push(sub.channel)
			kafkaSubscribe(sub.channel)
		})
	})

	socket.on('unsubscribe', function(data) {
		if (data.channels) {
			data.channels.forEach(function(channel) {
				console.log("Client "+socket.id+" unsubscribed from channel "+channel)
				socket.leave(channel, function(err) {
					socket.emit('unsubscribe', {channel:channel, error:err})
					console.log("Socket "+socket.id+" is now in rooms: "+socket.rooms)
				})
			})
		}
	})

	socket.on('resend', function(req) {
		handleResendRequest(socket, req)
	})

	socket.on('ui', emitUiMessage)
	
	socket.on('disconnect', function () {
		console.log("Client disconnected: "+socket.id+", was on channels: "+channels)
		channels.forEach(function(channel) {
			io.sockets.in(channel).emit('client-disconnect', socket.id);
			
			var room = io.sockets.adapter.rooms[channel]
			if (room) {
				var count = Object.keys(room).length
				console.log("Clients remaining on channel "+channel+": "+count)
			}
			else {
				console.log("Channel "+channel+" has no clients remaining, unsubscribing Kafka...")
				kafkaUnsubscribe(channel)
			}
		})
	})
})

console.log("Server started.")
