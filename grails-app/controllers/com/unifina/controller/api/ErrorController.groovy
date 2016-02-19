package com.unifina.controller.api

import com.unifina.api.ApiError
import com.unifina.api.ApiException
import com.unifina.api.InvalidStateException
import com.unifina.api.ValidationException
import com.unifina.exceptions.CanvasUnreachableException
import com.unifina.security.StreamrApi
import grails.converters.JSON
import groovy.transform.CompileStatic

class ErrorController {

	static final Map<String, Closure<ApiError>> errorMappings = [
		InvalidStateException: { InvalidStateException e -> new ApiError(500, "STATE_NOT_ALLOWED", e.message) },
		ValidationException: { ValidationException e -> new ApiError(422, "VALIDATION_ERROR", e.message) },
		CanvasUnreachableException: { CanvasUnreachableException e -> new ApiError(500, "CANVAS_UNREACHABLE", e.message) },
	]

	@StreamrApi(requiresAuthentication = false)
	def index() {
		Exception exception = request.exception.cause
		if (request.isApiAction) {
			renderAsJson(exception)
		} else {
			[exception: exception]
		}
	}

	@CompileStatic
	def renderAsJson(Exception exception) {
		def mapper = errorMappings[exception.class.simpleName]

		ApiError apiError
		if (mapper) {
			apiError = mapper.call(exception)
		} else if (exception instanceof ApiException) {
			apiError = ((ApiException) exception).asApiError()
		} else {
			apiError = new ApiError(500, exception.class.simpleName, exception.getMessage())
		}

		response.status = apiError.statusCode
		render(apiError.toMap() as JSON)
	}
}
