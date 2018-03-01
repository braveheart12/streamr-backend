package com.unifina.signalpath.remote;

import com.unifina.data.FeedEvent;
import com.unifina.data.IEventRecipient;
import com.unifina.datasource.IStartListener;
import com.unifina.datasource.IStopListener;
import com.unifina.feed.ITimestamped;
import com.unifina.signalpath.*;

import org.apache.log4j.Logger;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import org.springframework.messaging.converter.StringMessageConverter;

import javax.websocket.ContainerProvider;
import javax.websocket.WebSocketContainer;
import java.lang.reflect.Type;
import java.util.*;
import java.util.concurrent.ExecutionException;

/**
 * Eclipse Websocket wrapper
 */
public class Websocket extends AbstractSignalPathModule implements StompSessionHandler, IEventRecipient, IStartListener, IStopListener {

	private static final Logger log = Logger.getLogger(WebSocketClient.class);

	private StringParameter URL = new StringParameter(this, "URL", "");
	private StringParameter topic = new StringParameter(this, "topic", "");
	private StringOutput message = new StringOutput(this, "message");

	private transient Propagator asyncPropagator;

	private transient StompSession session;

	@Override
	public void init() {
		super.init();
		URL.setCanConnect(false);
		topic.setCanConnect(false);

		// sends output when messages arrive (though shouldn't receive inputs anyway...)
		setPropagationSink(true);
	}

	@Override
	public void initialize() {
		super.initialize();
		// copied from ModuleWithUI
		if (getGlobals().isRunContext()) {
			getGlobals().getDataSource().addStartListener(this);
			getGlobals().getDataSource().addStopListener(this);
		}
	}

	@Override
	public void onStart() {
		try {
			session = createAndStartSession();
		} catch (Exception e) {
			throw new RuntimeException("Starting Websocket session failed", e);
		}
	}

	@Override
	public void onStop() {
		try {
			stopSession();
		} catch (Exception e) {
			throw new RuntimeException("Stopping Websocket session failed", e);
		}
	}

	private StompSession createAndStartSession() throws InterruptedException, ExecutionException {
		stopSession();

		WebSocketContainer container = ContainerProvider.getWebSocketContainer();
		container.setDefaultMaxBinaryMessageBufferSize(1024 * 1024);
		container.setDefaultMaxTextMessageBufferSize(1024 * 1024);
		WebSocketClient simpleWebSocketClient = new StandardWebSocketClient(container);

		List<Transport> transports = new ArrayList<>(1);
		transports.add(new WebSocketTransport(simpleWebSocketClient));
		SockJsClient sockJsClient = new SockJsClient(transports);
		WebSocketStompClient stompClient = new WebSocketStompClient(sockJsClient);
		stompClient.setMessageConverter(new StringMessageConverter());
		stompClient.setInboundMessageSizeLimit(Integer.MAX_VALUE);

		return stompClient.connect(URL.getValue(), this).get();
	}

	private void stopSession() {
		if(session != null) {
			session.disconnect();
			session = null;
		}
	}

	@Override
	public void receive(FeedEvent event) {
		if (event.content instanceof WebsocketEvent) {
			sendOutput(((WebsocketEvent) event.content).message);
			getPropagator().propagate();
		} else {
			super.receive(event);
		}
	}

	private Propagator getPropagator() {
		if (asyncPropagator == null) {
			asyncPropagator = new Propagator(this);
		}
		return asyncPropagator;
	}

	public void sendOutput(String msg) {
		message.send(msg);
	}

	@Override
	public void sendOutput() {
		// "normal" activation time does nothing; only received MQTT messages cause propagation
		// TODO: maybe allow topic input and change subscribed topic if topic input is activated?
	}

	@Override
	public void clearState() {

	}

	@Override
	public void afterConnected(StompSession stompSession, StompHeaders stompHeaders) {
		session.subscribe(topic.getValue(), this);
	}

	@Override
	public void handleException(StompSession stompSession, StompCommand stompCommand, StompHeaders stompHeaders, byte[] bytes, Throwable throwable) {

	}

	@Override
	public void handleTransportError(StompSession stompSession, Throwable throwable) {

	}

	@Override
	public Type getPayloadType(StompHeaders stompHeaders) {
		return String.class;
	}

	@Override
	public void handleFrame(StompHeaders stompHeaders, Object o) {
		final WebsocketEvent event = new WebsocketEvent(getGlobals().time);
		event.message = (String)o;
		// push websocket message into FeedEvent queue; it will later call this.receive
		getGlobals().getDataSource().getEventQueue().enqueue(new FeedEvent<>(event, event.timestamp, this));
	}

	private static class WebsocketEvent implements ITimestamped {
		public Date timestamp;
		public String message;

		public WebsocketEvent(Date timestamp) {
			this.timestamp = timestamp;
		}

		@Override
		public Date getTimestamp() {
			return timestamp;
		}
	}
}
