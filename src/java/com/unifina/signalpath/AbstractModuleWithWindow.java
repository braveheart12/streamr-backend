package com.unifina.signalpath;

import com.unifina.datasource.ITimeListener;
import com.unifina.utils.window.AbstractWindow;
import com.unifina.utils.window.EventWindow;
import com.unifina.utils.window.TimeWindow;
import com.unifina.utils.window.WindowListener;

import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Abstraction of a module that collects values into sliding windows.
 * The sliding windows can have their length defined in either time or the
 * number of values. Windows can be created per key to support multidimensional (eg. x, y)
 * and dynamic (eg. window per key) windowing.
 * <p/>
 * The module can have a minSamples parameter that controls how many samples
 * the window must contain. Before this number is reached, sendCurrentValues() will
 * not be called. The variable minSamplesWindowKey controls which window will
 * be used to determine if the minSamples condition has been reached or not.
 * Set supportsMinSamples = false to disable the minSamples feature altogether.
 */
public abstract class AbstractModuleWithWindow<T> extends AbstractSignalPathModule implements ITimeListener {

	// The time-based enums should have the same name as the corresponding TimeUnit.XXXX
	public enum WindowLengthUnit {
		EVENTS,
		SECONDS,
		MINUTES,
		HOURS,
		DAYS
	}

	public enum WindowMode {
		CONTINUOUS,
		STEPWISE
	}

	protected IntegerParameter windowLength = new IntegerParameter(this, "windowLength", 0);
	protected EnumParameter<WindowLengthUnit> windowUnit = new EnumParameter<>(this, "windowUnit", WindowLengthUnit.values());
	protected EnumParameter<WindowMode> windowMode = new EnumParameter<>(this, "windowMode", WindowMode.values());

	@ExcludeInAutodetection
	protected IntegerParameter minSamples = new IntegerParameter(this, "minSamples", 0);

	protected LinkedHashMap<Object, AbstractWindow> windowByKey = new LinkedHashMap<>();
	private boolean iteratingWindowByKey = false;
	private Set<Object> keysPendingRemoval = new HashSet<>();

	private transient Integer cachedLength = null;

	// Subclass can set this to false in constructor to disable minSamples functionality
	protected boolean supportsMinSamples = true;
	protected Object minSamplesWindowKey = 0;

	protected boolean timeWindowChangedSinceLastOutput = false;

	@Override
	public void init() {
		addInput(windowLength);
		windowUnit.addAlias("windowType"); // Backwards compatibility
		addInput(windowUnit);
		addInput(windowMode);
		windowUnit.setCanConnect(false);
		windowMode.setCanConnect(false);
		windowMode.setUpdateOnChange(true);

		super.init();
	}

	/**
	 * Adds an item to the window (in multidimensional case, use addToWindow(item, key)).
	 *
	 * @param item
	 */
	protected void addToWindow(T item) {
		addToWindow(item, 0);
	}

	/**
	 * Adds an item to the window specified by key. A window will be created for
	 * this key if it does not exist.
	 *
	 * @param item
	 * @param key
	 */
	protected void addToWindow(T item, Object key) {
		if (windowUnit.getValue() == WindowLengthUnit.EVENTS) {
			getWindowForKey(key).add(item);
		} else {
			((TimeWindow) getWindowForKey(key)).add(item, getGlobals().time);
		}
	}

	protected AbstractWindow<T> getWindowForKey(Object key) {
		AbstractWindow window = windowByKey.get(key);
		if (window == null) {
			window = createWindow(key);
			windowByKey.put(key, window);
		}
		return window;
	}

	/**
	 * Get the window for one-dimensional case
	 */
	public AbstractWindow<T> get1DWindow() {
		return getWindowForKey(0);
	}

	@Override
	protected void onConfiguration(Map<String, Object> config) {
		if (supportsMinSamples && windowMode.getValue().equals(WindowMode.CONTINUOUS)) {
			addInput(minSamples);
		}
	}

	protected AbstractWindow createWindow(Object key) {
		AbstractWindow w;

		if (windowUnit.getValue() == WindowLengthUnit.EVENTS) {
			w = new EventWindow(windowLength.getValue(), createWindowListener(key));
		} else {
			// Expects the enum names between TimeUnit and WindowType to be equal
			TimeUnit timeUnit = TimeUnit.valueOf(windowUnit.getValue().toString());
			w = new TimeWindow(windowLength.getValue(), timeUnit, createWindowListener(key));
		}

		return w;
	}

	protected void deleteWindow(Object key) {
		// Mark window for removal instead of instantly removing it from windowByKey,
		// as this would cause a ConcurrentModificationException if currently iterating over it
		if (iteratingWindowByKey) {
			keysPendingRemoval.add(key);
		} else {
			windowByKey.remove(key);
		}
	}

	/**
	 * Should add input values to the windows by calling addToWindow().
	 */
	protected abstract void handleInputValues();

	/**
	 * Should send out the current values as calculated from the values in the windows.
	 *
	 * Note that the windows might be empty, in which case a default value should be sent
	 * (eg. 0 for Sum and Count). If no default value is defined (eg. moving average),
	 * do not send any output.
	 */
	protected abstract void sendCurrentValues();

	/**
	 * Should create a WindowListener for the given key. The WindowListener
	 * should be used to update the internal state of the module incrementally. For
	 * example, if the item 5 is added to a window, a module calculating the sum of
	 * values should update its internal variable sum += 5. Similarly, the listener
	 * is called when values drop out of the window, or when the window is cleared.
	 *
	 * @param key Identifies a particular window. A module can have as many windows as it likes, and each will have its own listener instance.
	 * @return
	 */
	protected abstract WindowListener<T> createWindowListener(Object key);

	@Override
	public void setTime(Date time) {
		// If we have time-based windows, all of them need to be updated on time events
		if (isTimeWindow()) {
			/**
			 * Calling TimeWindow#setTime() below might call deleteWindow() further down the stack.
			 * Directly modifying windowByKey would result in an ConcurrentModificationException,
			 * so let's set a flag to be checked in deleteWindow() to prevent that.
			 * The keys will be removed after the iteration is complete.
			 */
			iteratingWindowByKey = true;
			for (AbstractWindow<T> window : windowByKey.values()) {
				int initialSize = window.getSize();
				((TimeWindow) window).setTime(time);
				if (window.getSize() != initialSize) {
					timeWindowChangedSinceLastOutput = true;
				}
			}
			iteratingWindowByKey = false;

			// Clean up the windows that were deleted while iterating
			for (Object key : keysPendingRemoval) {
				deleteWindow(key);
			}
			keysPendingRemoval.clear();

			/**
			 * Output is sent on every tick for continuous windows if the window has changed,
			 * and for stepwise windows it is sent on every even
			 */
			if (checkSendOnTime()) {
				sendCurrentValues();
				timeWindowChangedSinceLastOutput = false;

				if (windowMode.getValue().equals(WindowMode.STEPWISE)) {
					clearState();
				}
			}
		}
	}

	protected boolean isTimeWindow() {
		return windowUnit.getValue() != WindowLengthUnit.EVENTS;
	}

	/**
	 * Determines if a window has enough values, controlled by minSamples, for the module
	 * to activate. If supportsMinSamples is false, this method always returns true.
	 * Otherwise the window indicated by minSamplesWindowKey is inspected for enough values.
	 */
	protected boolean continuousWindowHasEnoughValues() {
		if (windowMode.getValue() != WindowMode.CONTINUOUS) {
			throw new IllegalStateException("Do not call this method unless the window mode is continuous!");
		}

		if (!supportsMinSamples) {
			return true;
		} else {
			AbstractWindow<T> minSamplesWindow = windowByKey.get(minSamplesWindowKey);
			if (minSamplesWindow == null) {
				throw new NullPointerException("No window was found with key: " + minSamplesWindowKey + ", you need to set minSamplesWindowKey! Keys: " + windowByKey.keySet());
			} else {
				Integer samplesNeededToBeReady = minSamples.getValue();
				return minSamplesWindow.getSize() >= samplesNeededToBeReady;
			}
		}
	}

	protected boolean stepwiseWindowHasEnoughEvents() {
		if (windowUnit.getValue() != WindowLengthUnit.EVENTS) {
			throw new IllegalStateException("Window type is "+ windowUnit.getValue()+"! This method should only be called for event-based windows!");
		}

		AbstractWindow<T> minSamplesWindow = windowByKey.get(minSamplesWindowKey);
		return minSamplesWindow != null && minSamplesWindow.getSize() >= windowLength.getValue();
	}

	protected boolean isTimeStep() {
		// Continuous time windows can always send
		if (windowMode.getValue() != WindowMode.STEPWISE) {
			throw new IllegalStateException("Window mode is "+windowMode.getValue()+"! This method should only be called for stepwise windows!");
		} else {
			// Stepwise time windows only send on multiples on windowLength * windowType
			long timestamp = getGlobals().time.getTime();
			TimeUnit timeUnit = TimeUnit.valueOf(windowUnit.getValue().toString());
			return timestamp % timeUnit.toMillis(windowLength.getValue()) == 0;
		}
	}

	@Override
	public void sendOutput() {
		if (cachedLength == null || !windowLength.getValue().equals(cachedLength)) {
			cachedLength = windowLength.getValue();
			for (AbstractWindow<T> window : windowByKey.values()) {
				window.setLength(cachedLength);
			}
		}

		handleInputValues();

		// Values are output on incoming events if this is not a time-based window OR WindowMode is CONTINUOUS
		if (checkSendOnEvent()) {
			sendCurrentValues();

			if (windowMode.getValue().equals(WindowMode.STEPWISE)) {
				clearState();
			}
		}
	}

	private boolean checkSendOnEvent() {
		// Time-based windows don't send on event unless they are CONTINUOUS
		return (!isTimeWindow() || windowMode.getValue() == WindowMode.CONTINUOUS) &&
						(windowMode.getValue() == WindowMode.CONTINUOUS && continuousWindowHasEnoughValues() || 		// Continuous windows support minSamples
								(windowMode.getValue() == WindowMode.STEPWISE && stepwiseWindowHasEnoughEvents()));		// Stepwise event windows check if step is full
	}

	private boolean checkSendOnTime() {
		return (windowMode.getValue() == WindowMode.CONTINUOUS && continuousWindowHasEnoughValues() && timeWindowChangedSinceLastOutput ||
						windowMode.getValue() == WindowMode.STEPWISE && isTimeStep());
	}

	@Override
	public void clearState() {
		for (AbstractWindow<T> window : windowByKey.values()) {
			window.clear();
		}
		windowByKey.clear();
		cachedLength = null;
		timeWindowChangedSinceLastOutput = false;
	}

}
