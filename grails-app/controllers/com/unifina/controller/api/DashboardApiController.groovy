package com.unifina.controller.api

import com.unifina.api.SaveDashboardCommand
import com.unifina.api.ValidationException
import com.unifina.domain.dashboard.Dashboard
import com.unifina.domain.security.Permission
import com.unifina.domain.security.SecUser
import com.unifina.security.AuthLevel
import com.unifina.security.StreamrApi
import com.unifina.service.ApiService
import com.unifina.service.DashboardService
import com.unifina.service.PermissionService
import com.unifina.service.SignalPathService
import grails.converters.JSON
import grails.plugin.springsecurity.annotation.Secured

@Secured(["IS_AUTHENTICATED_ANONYMOUSLY"])
class DashboardApiController {

	DashboardService dashboardService
	SignalPathService signalPathService
	PermissionService permissionService
	ApiService apiService

	@StreamrApi
	def index() {
		def searchCriteria = apiService.createSearchCriteria(params, ["name"])
		def joinCriteria = apiService.createJoinCriteria(params)
		def criteria = searchCriteria << joinCriteria
		def dashboards = permissionService.get(Dashboard, request.apiUser, Permission.Operation.READ, apiService.isPublicFlagOn(params), criteria, apiService.isIncludeOwnPermissionsFlagOn(params))
		render(dashboards as JSON)
	}

	@StreamrApi
	def show(Long id) {
		def dashboard = dashboardService.findById(id, (SecUser) request.apiUser)
		render(dashboard.toMap() as JSON)
	}

	@StreamrApi
	def save(SaveDashboardCommand command) {
		if (!command.validate()) {
			throw new ValidationException(command.errors)
		}
		def dashboard = dashboardService.createOrUpdate(command, request.apiUser)
		render(dashboard.toMap() as JSON)
	}

	@StreamrApi
	def update(SaveDashboardCommand command) {
		if (!command.validate()) {
			throw new ValidationException(command.errors)
		}
		def dashboard = dashboardService.createOrUpdate(command, request.apiUser)
		render(dashboard.toMap() as JSON)
	}

	@StreamrApi
	def delete(Long id) {
		dashboardService.deleteById(id, (SecUser) request.apiUser)
		render(status: 204)
	}

	/**
	 * Handles a runtime requests from dashboard view
	 */
	@StreamrApi(authenticationLevel = AuthLevel.NONE)
	def runtimeRequest(String path, Boolean local) {
		def msg = request.JSON
		Map response = signalPathService.runtimeRequest(dashboardService.buildRuntimeRequest(msg, "dashboards/$path", request.apiUser), local ? true : false)
		log.info("request: responding with $response")
		render response as JSON
	}
}
