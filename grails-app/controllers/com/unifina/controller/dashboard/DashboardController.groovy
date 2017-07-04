package com.unifina.controller.dashboard

import grails.plugin.springsecurity.annotation.Secured

@Secured(["ROLE_USER"])
class DashboardController {

	def index() {
		return [:]
	}
}