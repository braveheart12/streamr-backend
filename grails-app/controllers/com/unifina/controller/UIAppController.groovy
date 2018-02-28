package com.unifina.controller

import com.unifina.domain.security.SecUser
import grails.plugin.springsecurity.annotation.Secured

@Secured(["ROLE_USER"])
class UIAppController {
	def springSecurityService

    def index() {
		def currentUser = SecUser.get(springSecurityService.currentUser.id)
		[
				key: springSecurityService.currentUser?.keys?.iterator()?.next(),
				user: currentUser
		]
	}
}
