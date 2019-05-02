package com.unifina.signalpath.remote

import com.unifina.data.Event
import com.unifina.datasource.DataSource
import com.unifina.domain.signalpath.Canvas
import com.unifina.signalpath.SignalPath
import com.unifina.utils.Globals
import com.unifina.utils.testutils.ModuleTestHelper
import grails.test.mixin.Mock
import groovy.json.JsonBuilder
import org.apache.http.Header
import org.apache.http.HttpResponse
import org.apache.http.StatusLine
import org.apache.http.client.methods.CloseableHttpResponse
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase
import org.apache.http.client.methods.HttpUriRequest
import org.apache.http.concurrent.FutureCallback
import org.apache.http.entity.StringEntity
import org.apache.http.nio.client.HttpAsyncClient
import spock.lang.Specification

@Mock(Canvas)
class HttpSpec extends Specification {
	Http module
	boolean isAsync = true
	String dummyHeaderName = "x-unit-test"
	String dummyHeaderValue = "testing123"
	def dummyHeader = [(dummyHeaderName): dummyHeaderValue]

	/**
	 * Module input name -> List of values for each iteration
	 */
	Map<String, List> inputs = [
		params: [[:], [:], [:]],
		headers: [[:], [:], [:]],
		body: [[:], [:], [:]]
	]

	/**
	 * Override "response" to provide the mock server implementation
	 * If closure, will be executed (argument is HttpUriRequest)
	 * If constant, will be returned
	 * If array, elements will be returned in sequence (closures executed, cyclically repeated if too short)
	 * If you want to return an array,
	 *   use closure that returns an array (see default below)
	 *   or array of arrays
	 */
	def response = { request -> [] }

	Map<String, List> outputs = [
		data: [[], [], []],
		errors: [null, null, null],
		statusCode: [200d, 200d, 200d],
		//ping: [0, 0, 0],
		headers: [dummyHeader, dummyHeader, dummyHeader]
	]

	def setup() {
		module = new TestableHttp()
		module.init()
		module.configure([
			params : [
				[name: "URL", value: "localhost"],
				[name: "verb", value: "GET"],
			]
		])
		def signalPath = new SignalPath(true)
		signalPath.setCanvas(new Canvas())
		module.setParentSignalPath(signalPath)
	}

	private boolean test(boolean localAddressesAreAllowed = true) {
		// TestableHttp is Http module wrapped so that we can inject our own mock HttpClient
		// Separate class is needed in same path as Http.java; anonymous class won't work with de-serializer
		TestableHttp.httpClient = mockClient
		TestableHttp.localAddressesAreAllowed = localAddressesAreAllowed
		return new ModuleTestHelper.Builder(module, inputs, outputs)
			.overrideGlobals { mockGlobals }
			.onModuleInstanceChange { newInstance -> module = newInstance }
			.test()
	}

	/** Mocked event queue. Works manually in tests, please call module.receive(queuedEvent) */
	def mockGlobals = Stub(Globals) {
		getDataSource() >> Stub(DataSource) {
			accept(_ as Event<AbstractHttpModule.HttpTransaction>) >> { Event<AbstractHttpModule.HttpTransaction> event ->
				transaction = event.content
			}
		}
		isRealtime() >> true
	}

	// temporary storage for async transaction generated by AbstractHttpModule, passing from globals to mockClient
	AbstractHttpModule.HttpTransaction transaction

	/** HttpClient that generates mock responses to HttpUriRequests according to this.response */
	def mockClient = Stub(HttpAsyncClient) {
		def responseI = [].iterator()
		execute(_, _) >> { HttpUriRequest request, FutureCallback<HttpResponse> future ->
			def mockHttpResponse = Stub(CloseableHttpResponse) {
				getEntity() >> {
					def ret = response
					// array => iterate
					if (ret instanceof Iterable) {
						// end of array -> restart from beginning
						if (!responseI.hasNext()) {
							responseI = response.iterator()
						}
						ret = responseI.hasNext() ? responseI.next() : []
					}
					// closure => execute
					if (ret instanceof Closure) {
						ret = ret(request)
					}
					// convert into JSON if not String
					ret = ret instanceof String ? ret : new JsonBuilder(ret).toString()
					return new StringEntity(ret)
				}
				getStatusLine() >> Stub(StatusLine) {
					getStatusCode() >> 200
				}
				getAllHeaders() >> [Stub(Header) {
					getName() >> dummyHeaderName
					getValue() >> dummyHeaderValue
				}]
			}
			// synchronized requests sendOutput here already
			future.completed(mockHttpResponse)

			// simulate AbstractHttpModule.receive, but without propagation
			// TODO: would be better to actually make the call (can getPropagator be replaced?), to check the whole path
			if (isAsync) {
				module.sendOutput(transaction)
			}
		}
	}

	void "no input, varying response, async"() {
		response = [[test: 1], [test: 2], [test: 3]]
		outputs.data = response
		expect:
		test()
	}

	void "no input, varying response, blocking"() {
		isAsync = false
		module.configure([
			options: [syncMode: [value: "sync"]]
		])
		response = [[test: 1], [test: 2], [test: 3]]
		outputs.data = response
		expect:
		test()
	}

	void "query parameters appear correctly in URL"() {
		inputs.params = [[cake: 1, is: true, or: "lie"]] * 3
		response = { HttpUriRequest request ->
			return request.URI.toString().equals("localhost?cake=1&is=true&or=lie")
		}
		outputs.data = [true, true, true]
		expect:
		test()
	}

	void "headers are added correctly to request"() {
		Map headers = [header1: "head", header2: true, header3: 3]
		inputs.headers = [headers] * 3
		response = { HttpUriRequest request ->
			int found = 0
			request.allHeaders.each { Header h ->
				if (headers.containsKey(h.name)) {
					assert headers[h.name].toString() == h.value
					found++
				}
			}
			return found
		}
		outputs.data = [3, 3, 3]
		expect:
		test()
	}

	void "timeout is sent to errors"() {
		mockClient = Stub(HttpAsyncClient) {
			execute(_, _) >> { HttpUriRequest request, FutureCallback<HttpResponse> future ->
				future.failed(new java.net.SocketTimeoutException())
				module.sendOutput(transaction)
			}
		}
		outputs.data = [null, null, null]
		outputs.statusCode = [null, null, null]
		outputs.headers = [null, null, null]
		outputs.errors = [["Sending HTTP Request failed", "java.net.SocketTimeoutException"]] * 3
		expect:
		test()
	}

	void "nested Maps/Lists are correctly encoded into nested JSON objects/arrays"() {
		module.configure([
			params : [
				[name: "URL", value: "localhost"],
				[name: "verb", value: "POST"],
			]
		])

		// set module input to groovy objects
		inputs.body = [
			"testing", [[1, 2], 3], [testing: [1, [2, 3]], 3: [true, [true: false]]]
		]

		// assert properly encoded JSON must arrive to server ("response generator closure" in test harness)
		def jsonInputs = [
			'"testing"', "[[1,2],3]", '{"testing":[1,[2,3]],"3":[true,{"true":false}]}'
		]
		response = { HttpUriRequest request ->
			HttpEntityEnclosingRequestBase r = (HttpEntityEnclosingRequestBase)request;
			ByteArrayOutputStream baos = new ByteArrayOutputStream()
			r.entity.writeTo(baos)
			String bodyJson = baos.toString()
			assert jsonInputs.contains(bodyJson)
			return []
		}
		expect:
		test()
	}

	void "nested JSON objects/arrays are correctly decoded into nested Maps/Lists"() {
		// server sends JSON
		response = [
			"testing", "[[1,2],3]", '{"testing":[1,[2,3]],"3":[true,{"true":false}]}'
		]
		outputs.data = [
			"testing", [[1, 2], 3], [testing: [1, [2, 3]], "3": [true, [true: false]]]
		]
		expect:
		test()
	}

	void "bodyless response outputs other things except data"() {
		mockClient = Stub(HttpAsyncClient) {
			execute(_, _) >> { HttpUriRequest request, FutureCallback<HttpResponse> future ->
				def mockHttpResponse = Stub(CloseableHttpResponse) {
					getEntity() >> null
					getStatusLine() >> Stub(StatusLine) {
						getStatusCode() >> 204
					}
					getAllHeaders() >> [Stub(Header) {
						getName() >> dummyHeaderName
						getValue() >> dummyHeaderValue
					}]
				}
				future.completed(mockHttpResponse)
				module.sendOutput(transaction)
			}
		}
		outputs.data = [null, null, null]
		outputs.statusCode = [204d, 204d, 204d]
		expect:
		test()
	}

	void "outputs errors and not data nor status nor headers if local addresses are not allowed"() {
		outputs.errors = [
			["Bad target address: Local HTTP calls not allowed"],
			["Bad target address: Local HTTP calls not allowed"],
			["Bad target address: Local HTTP calls not allowed"]
		]
		outputs.statusCode = [
			null,
			null,
			null
		]
		outputs.data = [
			null,
			null,
			null
		]
		outputs.headers = [
			null,
			null,
			null
		]
		expect:
		test(false)
	}
}
