package com.unifina.signalpath.charts;

import com.unifina.datasource.ITimeListener;
import com.unifina.signalpath.*;
import com.unifina.utils.StreamrColor;

import java.io.Serializable;
import java.util.*;

abstract class MapModule extends ModuleWithUI implements ITimeListener {
	private static final String DEFAULT_MARKER_ICON = "fa fa-4x fa-long-arrow-up";

	private final Input<Object> id = new Input<>(this, "id", "Object");
	private final Input<Object> label = new Input<>(this, "label", "Object");

	private final TimeSeriesInput yInput = new TimeSeriesInput(this, getYInputName());
	private final TimeSeriesInput xInput = new TimeSeriesInput(this, getXInputName());

	private final TimeSeriesInput heading = new TimeSeriesInput(this, "heading");		// degrees clockwise ("right-handed down")
	private final ColorParameter color = new ColorParameter(this, "traceColor", new StreamrColor(233, 87, 15));

	private double centerY;
	private double centerX;
	private int minZoom;
	private int maxZoom;
	private int zoom;
	private boolean autoZoom;
	private boolean drawTrace = false;
	private int traceWidth = 2;
	private boolean customMarkerLabel = false;

	private boolean directionalMarkers = false;
	private String markerIcon = DEFAULT_MARKER_ICON;

	private int expiringTimeOfMarkerInSecs = 0;
	private final Set<ExpiringItem> expiringMarkers = new LinkedHashSet<>();

	private int expiringTimeOfTraceInSecs = 0;
	private final List<ExpiringItem> expiringTracePoints = new LinkedList<>();

	MapModule(double centerY, double centerX, int minZoom, int maxZoom, int zoom, boolean autoZoom) {
		this.centerY = centerY;
		this.centerX = centerX;
		this.minZoom = minZoom;
		this.maxZoom = maxZoom;
		this.zoom = zoom;
		this.autoZoom = autoZoom;
	}

	@Override
	public void init() {
		addInput(id);
		addInput(yInput);
		addInput(xInput);
		this.resendAll = false;
		this.resendLast = 0;
		yInput.setDrivingInput(true);
		yInput.canHaveInitialValue = false;
		yInput.canBeFeedback = false;
		xInput.setDrivingInput(true);
		xInput.canHaveInitialValue = false;
		xInput.canBeFeedback = false;
		id.setDrivingInput(true);
		id.canBeFeedback = false;
		id.requiresConnection = false;
		label.setDrivingInput(false);
		label.canBeFeedback = false;
		heading.requiresConnection = false;
		heading.canBeFeedback = false;
	}

	@Override
	public void initialize() {
		super.initialize();
		if (!id.isConnected()) {
			id.receive("id");
		}
	}

	@Override
	public void sendOutput() {
		Marker marker = new Marker(
			id.getValue(),
			yInput.getValue(),
			xInput.getValue(),
			color.getValue()
		);

		if (expiringTimeOfMarkerInSecs > 0) {
			long expireTime = getGlobals().getTime().getTime() + (expiringTimeOfMarkerInSecs * 1000);
			ExpiringItem expiringMarker = new ExpiringItem(id.getValue(), expireTime);
			expiringMarkers.remove(expiringMarker);
			expiringMarkers.add(expiringMarker);
		}

		if (drawTrace) {
			String tracePointId = getGlobals().generateId();
			marker.put("tracePointId", tracePointId);
			if (expiringTimeOfTraceInSecs > 0) {
				long expireTime = getGlobals().getTime().getTime() + (expiringTimeOfTraceInSecs * 1000);
				expiringTracePoints.add(new ExpiringItem(tracePointId, expireTime));
			}
		}

		if (customMarkerLabel) {
			marker.put("label", label.getValue());
		}
		if (directionalMarkers) {
			marker.put("dir", heading.getValue());
		}
		pushToUiChannel(marker);
	}

	@Override
	public void clearState() {
		expiringMarkers.clear();
		expiringTracePoints.clear();
	}

	@Override
	public Map<String, Object> getConfiguration() {
		Map<String, Object> config = super.getConfiguration();

		ModuleOptions options = ModuleOptions.get(config);
		options.addIfMissing(ModuleOption.createDouble(getCenterYOptionName(), centerY));
		options.addIfMissing(ModuleOption.createDouble(getCenterXOptionName(), centerX));
		options.addIfMissing(ModuleOption.createInt("minZoom", minZoom));
		options.addIfMissing(ModuleOption.createInt("maxZoom", maxZoom));
		options.addIfMissing(ModuleOption.createInt("zoom", zoom));
		options.addIfMissing(ModuleOption.createBoolean("autoZoom", autoZoom));
		options.addIfMissing(ModuleOption.createBoolean("drawTrace", drawTrace));
		options.addIfMissing(ModuleOption.createInt("traceWidth", traceWidth));
		options.addIfMissing(ModuleOption.createBoolean("markerLabel", customMarkerLabel));
		options.addIfMissing(ModuleOption.createBoolean("directionalMarkers", directionalMarkers));
		options.addIfMissing(ModuleOption.createInt("expiringTimeOfMarkerInSecs", expiringTimeOfMarkerInSecs));
		options.addIfMissing(ModuleOption.createInt("expiringTimeOfTraceInSecs", expiringTimeOfTraceInSecs));
		options.addIfMissing(ModuleOption.createString("markerIcon", markerIcon)
			.addPossibleValue("Default", DEFAULT_MARKER_ICON)
			.addPossibleValue("Long arrow", "fa fa-4x fa-long-arrow-up")
			.addPossibleValue("Short arrow", "fa fa-2x fa-arrow-up")
			.addPossibleValue("Circled arrow", "fa fa-2x fa-arrow-circle-o-up")
			.addPossibleValue("Wedge", "fa fa-3x fa-chevron-up")
			.addPossibleValue("Double wedge", "fa fa-4x fa-angle-double-up")
			.addPossibleValue("Circled wedge", "fa fa-2x fa-chevron-circle-up")
			.addPossibleValue("Triangle", "fa fa-4x fa-caret-up")
			.addPossibleValue("Triangle box", "fa fa-2x fa-caret-square-o-up")
// 			TODO: Implement rotation logic for these markers (default is 45 deg too much)
//			.addPossibleValue("Airplane", "fa fa-4x fa-plane")
//			.addPossibleValue("Rocket", "fa fa-4x fa-rocket")
		);

		return config;
	}

	@Override
	protected void onConfiguration(java.util.Map<String, Object> config) {
		super.onConfiguration(config);
		ModuleOptions options = ModuleOptions.get(config);

		if (options.containsKey("centerY")) {
			centerY = options.getOption("centerY").getDouble();
		}

		if (options.containsKey("centerX")) {
			centerX = options.getOption("centerX").getDouble();
		}

		if (options.containsKey("minZoom")) {
			minZoom = options.getOption("minZoom").getInt();
		}

		if (options.containsKey("maxZoom")) {
			maxZoom = options.getOption("maxZoom").getInt();
		}

		if (options.containsKey("zoom")) {
			zoom = options.getOption("zoom").getInt();
		}

		if (options.containsKey("autoZoom")) {
			autoZoom = options.getOption("autoZoom").getBoolean();
		}

		if (options.containsKey("drawTrace")) {
			drawTrace = options.getOption("drawTrace").getBoolean();
		}

		if (options.containsKey("traceWidth")) {
			traceWidth = options.getOption("traceWidth").getInt();
		}

		if (options.containsKey("markerLabel")) {
			customMarkerLabel = options.getOption("markerLabel").getBoolean();
		}

		if (options.containsKey("directionalMarkers")) {
			directionalMarkers = options.getOption("directionalMarkers").getBoolean();
		}

		if (options.containsKey("expiringTimeOfMarkerInSecs")) {
			expiringTimeOfMarkerInSecs = options.getOption("expiringTimeOfMarkerInSecs").getInt();
		}

		if (options.containsKey("expiringTimeOfTraceInSecs")) {
			expiringTimeOfTraceInSecs = options.getOption("expiringTimeOfTraceInSecs").getInt();
		}

		if (options.containsKey("markerIcon")) {
			markerIcon = options.getOption("markerIcon").getString();
		}

		if (drawTrace) {
			addInput(color);
		}

		if (customMarkerLabel) {
			addInput(label);
		}

		if (directionalMarkers) {
			addInput(heading);
		}
	}

	@Override
	public void setTime(Date time) {
		List<Object> expiredMapPointIds = new ArrayList<>();
		List<Object> expiredTracePoints = new ArrayList<>();

		if (expiringTimeOfMarkerInSecs > 0) {
			Iterator<ExpiringItem> iterator = expiringMarkers.iterator();
			ExpiringItem marker;

			while (iterator.hasNext() && (marker = iterator.next()).isExpired(time)) {
				iterator.remove();
				expiredMapPointIds.add(marker.getId());
			}
		}
		if (expiringTimeOfTraceInSecs > 0) {
			Iterator<ExpiringItem> iterator = expiringTracePoints.iterator();
			ExpiringItem tracePoint;

			while (iterator.hasNext() && (tracePoint = iterator.next()).isExpired(time)) {
				expiredTracePoints.add(tracePoint.getId());
				iterator.remove();
			}
		}
		if (!expiredMapPointIds.isEmpty() || !expiredTracePoints.isEmpty()) {
			pushToUiChannel(new ExpirementList(expiredMapPointIds, expiredTracePoints));
		}
	}

	/**
	 * Marker point
	 */
	private static class Marker extends LinkedHashMap<String, Object> {
		private Marker(Object id, Double y, Double x, StreamrColor color) {
			put("t", "p");	// type: MapPoint
			put("id", id.toString());
			put("y", y);
			put("x", x);
			put("color", color.toString());
		}
	}

	private static class ExpiringItem implements Serializable {
		private final Object id;
		private final long expirationTime;

		private ExpiringItem(Object id, long expirationTime) {
			this.id = id;
			this.expirationTime = expirationTime;
		}

		private Object getId() {
			return id;
		}

		private boolean isExpired(Date currentTime) {
			return expirationTime <= currentTime.getTime();
		}

		@Override
		public boolean equals(Object o) {
			return o != null && o instanceof ExpiringItem && getId().equals(((ExpiringItem) o).getId());
		}

		@Override
		public int hashCode() {
			return getId().hashCode();
		}
	}

	private static class ExpirementList extends LinkedHashMap<String, Object> {
		private ExpirementList(List<Object> markerIdList, List<Object> pointIdList) {
			put("t", "d");
			put("markerList", markerIdList);
			put("pointList", pointIdList);
		}
	}

	abstract String getYInputName();
	abstract String getXInputName();
	abstract String getCenterYOptionName();
	abstract String getCenterXOptionName();
}
