package com.unifina.signalpath

import com.unifina.utils.GlobalsFactory
import com.unifina.utils.window.WindowListener
import grails.test.mixin.TestMixin
import grails.test.mixin.support.GrailsUnitTestMixin
import spock.lang.Specification

@TestMixin(GrailsUnitTestMixin) // provides grailsApplication
class AbstractModuleWithWindowSpec extends Specification {

	private WindowingModule makeModule(boolean minSamples = true, Map config = [:], int dimensions = 1) {
		Map<Object, WindowListener<Double>> windowListeners = [:]
		for (int i=0; i<dimensions; i++) {
			windowListeners.put(i, Mock(WindowListener))
		}

		WindowingModule m = new WindowingModule(minSamples, dimensions, windowListeners, Mock(AbstractModuleWithWindow))
		m.globals = GlobalsFactory.createInstance([:], grailsApplication)
		m.globals.time = new Date(0)
		m.init()
		m.configure(config)
		m.connectionsReady()
		return m
	}

	def "the windowLength, windowUnit, windowMode and minSamples inputs are the first parameters, the rest are autodetected"() {
		WindowingModule m = makeModule()

		expect:
		m.getInputs().length == 5
		m.getInputs()[0].name == "windowLength"
		m.getInputs()[1].name == "windowUnit"
		m.getInputs()[2].name == "windowMode"
		m.getInputs()[3].name == "test"
		m.getInputs()[4].name == "minSamples"
	}

	def "minSamples can be suppressed"() {
		WindowingModule m = makeModule(false)

		expect:
		m.getInputs().length == 4
		m.getInputs()[0].name == "windowLength"
		m.getInputs()[1].name == "windowUnit"
		m.getInputs()[2].name == "windowMode"
		m.getInputs()[3].name == "test"
	}

	def "if windowMode is stepwise, minSamples input is not added even if supported"() {
		WindowingModule m = makeModule(true, [inputs: [
				[name: "windowLength", value: "5"],
				[name: "windowUnit", value: AbstractModuleWithWindow.WindowLengthUnit.EVENTS.toString()],
				[name: "windowMode", value: AbstractModuleWithWindow.WindowMode.STEPWISE.toString()],
		]])

		expect:
		m.getInputs().length == 4
		m.getInputs()[0].name == "windowLength"
		m.getInputs()[1].name == "windowUnit"
		m.getInputs()[2].name == "windowMode"
		m.getInputs()[3].name == "test"
	}

	def "event listeners get correct calls for EVENTS window"() {
		WindowingModule m = makeModule(true, [inputs: [
				[name: "windowLength", value: "5"],
				[name: "windowUnit", value: AbstractModuleWithWindow.WindowLengthUnit.EVENTS.toString()],
				[name: "windowMode", value: AbstractModuleWithWindow.WindowMode.CONTINUOUS.toString()],
		]])

		when:
		(1..10).each { m.addTestValue(it) }

		then:
		10 * m.windowListeners[0].onAdd(_)
		5 * m.windowListeners[0].onRemove(_)
	}

	def "event listeners get correct calls for SECONDS window"() {
		WindowingModule m = makeModule(true, [inputs: [
				[name: "windowLength", value: "5"],
				[name: "windowUnit", value: AbstractModuleWithWindow.WindowLengthUnit.SECONDS.toString()],
				[name: "windowMode", value: AbstractModuleWithWindow.WindowMode.CONTINUOUS.toString()],
		]])

		when:
		(1..5).each { m.addTestValue(it) }

		then:
		5 * m.windowListeners[0].onAdd(_)
		0 * m.windowListeners[0].onRemove(_)

		when:
		m.globals.time = new Date(4999)
		m.setTime(m.globals.time)
		(1..3).each { m.addTestValue(it) }

		then:
		3 * m.windowListeners[0].onAdd(_)
		0 * m.windowListeners[0].onRemove(_)

		when:
		m.globals.time = new Date(5001)
		m.setTime(m.globals.time)

		then:
		5 * m.windowListeners[0].onRemove(_)
	}

	def "event listeners get correct calls for MINUTES window"() {
		WindowingModule m = makeModule(true, [inputs: [
				[name: "windowLength", value: "5"],
				[name: "windowUnit", value: AbstractModuleWithWindow.WindowLengthUnit.MINUTES.toString()],
				[name: "windowMode", value: AbstractModuleWithWindow.WindowMode.CONTINUOUS.toString()]
		]])

		when:
		(1..5).each { m.addTestValue(it) }

		then:
		5 * m.windowListeners[0].onAdd(_)
		0 * m.windowListeners[0].onRemove(_)

		when:
		m.globals.time = new Date(4*60*1000 + 59*1000)
		m.setTime(m.globals.time)
		(1..3).each { m.addTestValue(it) }

		then:
		3 * m.windowListeners[0].onAdd(_)
		0 * m.windowListeners[0].onRemove(_)

		when:
		m.globals.time = new Date(5*60*1000)
		m.setTime(m.globals.time)

		then:
		5 * m.windowListeners[0].onRemove(_)
	}

	def "listeners for two-dimensional window"() {
		WindowingModule m = makeModule(
				true,
				[inputs: [
						[name: "windowLength", value: "5"],
						[name: "windowUnit", value: AbstractModuleWithWindow.WindowLengthUnit.EVENTS.toString()],
						[name: "windowMode", value: AbstractModuleWithWindow.WindowMode.CONTINUOUS.toString()]
				]],
				2)

		when:
		(1..10).each { m.addTestValue(it, 0) }
		(1..5).each { m.addTestValue(it, 1) }

		then:
		10 * m.windowListeners[0].onAdd(_)
		5 * m.windowListeners[0].onRemove(_)
		5 * m.windowListeners[1].onAdd(_)
		0 * m.windowListeners[1].onRemove(_)
	}

	def "sendOutput must call handleInputValues() and doSendOutput()"() {
		WindowingModule m = makeModule(true, [inputs: [
				[name: "windowLength", value: "5"],
				[name: "windowUnit", value: AbstractModuleWithWindow.WindowLengthUnit.MINUTES.toString()],
				[name: "windowMode", value: AbstractModuleWithWindow.WindowMode.CONTINUOUS.toString()],
				[name: "minSamples", value: "1"]
		]])

		when:
		(1..5).each {
			m.addTestValue(it)
			m.sendOutput()
		}


		then:
		5 * m.mock.handleInputValues()
		5 * m.mock.sendCurrentValues()
	}

	def "must not call doSendOutput before minSamples is reached"() {
		WindowingModule m = makeModule(true, [inputs: [
				[name: "windowLength", value: "5"],
				[name: "windowUnit", value: AbstractModuleWithWindow.WindowLengthUnit.MINUTES.toString()],
				[name: "windowMode", value: AbstractModuleWithWindow.WindowMode.CONTINUOUS.toString()],
				[name: "minSamples", value: "5"]
		]])

		when:
		(1..4).each {
			m.addTestValue(it)
			m.sendOutput()
		}

		then:
		4 * m.mock.handleInputValues()
		0 * m.mock.sendCurrentValues()

		when:
		(5..7).each {
			m.addTestValue(it)
			m.sendOutput()
		}

		then:
		3 * m.mock.handleInputValues()
		3 * m.mock.sendCurrentValues()
	}

	def "STEPWISE EVENTS window must send out values when window is full"() {
		WindowingModule m = makeModule(true, [inputs: [
				[name: "windowLength", value: "5"],
				[name: "windowUnit", value: AbstractModuleWithWindow.WindowLengthUnit.EVENTS.toString()],
				[name: "windowMode", value: AbstractModuleWithWindow.WindowMode.STEPWISE.toString()]
		]])

		when:
		(1..4).each {
			m.addTestValue(it)
			m.sendOutput()
		}

		then:
		4 * m.mock.handleInputValues()
		0 * m.mock.sendCurrentValues()

		when:
		(5..5).each {
			m.addTestValue(it)
			m.sendOutput()
		}

		then:
		1 * m.mock.handleInputValues()
		1 * m.mock.sendCurrentValues()

		when:
		(6..9).each {
			m.addTestValue(it)
			m.sendOutput()
		}

		then:
		4 * m.mock.handleInputValues()
		0 * m.mock.sendCurrentValues()

		when:
		(10..10).each {
			m.addTestValue(it)
			m.sendOutput()
		}

		then:
		1 * m.mock.handleInputValues()
		1 * m.mock.sendCurrentValues()
	}

	def "empty STEPWISE time window sends on tick"() {
		WindowingModule m = makeModule(true, [inputs: [
				[name: "windowLength", value: "5"],
				[name: "windowUnit", value: AbstractModuleWithWindow.WindowLengthUnit.SECONDS.toString()],
				[name: "windowMode", value: AbstractModuleWithWindow.WindowMode.STEPWISE.toString()]
		]])

		when: "time ticks but window is empty"
		m.globals.time = new Date(0)
		m.setTime(m.globals.time)

		then:
		1 * m.mock.sendCurrentValues()
	}

	def "STEPWISE time window must send out values when the appropriate time has passed"() {
		WindowingModule m = makeModule(true, [inputs: [
				[name: "windowLength", value: "5"],
				[name: "windowUnit", value: AbstractModuleWithWindow.WindowLengthUnit.SECONDS.toString()],
				[name: "windowMode", value: AbstractModuleWithWindow.WindowMode.STEPWISE.toString()]
		]])

		when: "values are added during first four seconds"
		(1..4).each {
			m.globals.time = new Date(it*1000)
			m.setTime(m.globals.time)
			m.addTestValue(it)
			m.sendOutput()
		}

		then: "input values are handled but output is not sent"
		4 * m.mock.handleInputValues()
		0 * m.mock.sendCurrentValues()

		when: "the fifth second ticks"
		(5..5).each {
			m.globals.time = new Date(it*1000)
			m.setTime(m.globals.time)
			m.addTestValue(it)
			m.sendOutput()
		}

		then: "values are sent"
		1 * m.mock.sendCurrentValues()
		then: "the new value is added"
		1 * m.mock.handleInputValues()

		when: "the next four seconds pass, with two events added per second"
		(6..9).each {
			m.globals.time = new Date(it*1000)
			m.setTime(m.globals.time)
			// Try adding multiple test values per second
			m.addTestValue(it)
			m.sendOutput()
			m.addTestValue(it)
			m.sendOutput()
		}

		then: "all input values are handled, but output is not sent"
		8 * m.mock.handleInputValues()
		0 * m.mock.sendCurrentValues()

		when: "the tenth second ticks"
		(10..10).each {
			m.globals.time = new Date(it*1000)
			m.setTime(m.globals.time)
		}

		then: "output is sent"
		1 * m.mock.sendCurrentValues()

		when: "window becomes empty after time has passed"
		m.globals.time = new Date(15*1000)
		m.setTime(m.globals.time)

		then: "a value is still sent"
		1 * m.mock.sendCurrentValues()

		when: "the window remains empty after time passes"
		m.globals.time = new Date(20*1000)
		m.setTime(m.globals.time)

		then: "a value is still sent"
		1 * m.mock.sendCurrentValues()
	}

	class WindowingModule extends AbstractModuleWithWindow<Double> {

		StringParameter test = new StringParameter(this, "test", "value")
		Map<Object, WindowListener<Double>> windowListeners
		AbstractModuleWithWindow<Double> mock
		Integer dimensions

		public WindowingModule(boolean supportsMinSamples, int dimensions, Map<Object, WindowListener<Double>> windowListeners, AbstractModuleWithWindow<Double> mock) {
			this.windowListeners = windowListeners
			this.mock = mock
			this.supportsMinSamples = supportsMinSamples
			this.dimensions = dimensions
		}

		@Override
		protected WindowListener<Double> createWindowListener(Object key) {
			return windowListeners[key]
		}

		public void addTestValue(Double d) {
			addToWindow(d)
		}

		public void addTestValue(Double d, int dimension) {
			addToWindow(d, dimension)
		}

		@Override
		protected void handleInputValues() {
			mock.handleInputValues()
		}

		@Override
		protected void sendCurrentValues() {
			mock.sendCurrentValues()
		}
	}

}
