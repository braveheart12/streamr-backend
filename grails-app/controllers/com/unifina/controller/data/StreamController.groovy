package com.unifina.controller.data

import com.unifina.domain.security.Key
import com.unifina.domain.security.Permission
import com.unifina.domain.security.Permission.Operation
import com.unifina.api.ApiException
import com.unifina.feed.DataRange
import com.unifina.feed.mongodb.MongoDbConfig
import com.unifina.feed.twitter.TwitterStreamConfig
import grails.converters.JSON
import grails.plugin.springsecurity.annotation.Secured
import groovy.transform.CompileStatic
import org.apache.commons.lang.exception.ExceptionUtils

import java.text.SimpleDateFormat

import org.springframework.web.multipart.MultipartFile

import com.unifina.domain.data.Feed
import com.unifina.domain.data.FeedFile
import com.unifina.domain.data.Stream
import com.unifina.domain.security.SecUser
import com.unifina.domain.signalpath.Module
import com.unifina.feed.DataRange
import com.unifina.feed.mongodb.MongoDbConfig
import com.unifina.utils.CSVImporter
import com.unifina.utils.CSVImporter.Schema
import grails.converters.JSON
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.web.multipart.MultipartFile

import java.text.SimpleDateFormat

@Secured(["ROLE_USER"])
class StreamController {

	def springSecurityService

	def permissionService
	def streamService

	def index() {
		[key: springSecurityService.currentUser?.keys?.iterator()?.next()]
	}

	def list() {
		SecUser user = springSecurityService.currentUser
		List<Stream> streams = permissionService.get(Stream, user, {
			eq("uiChannel", false) // filter out UI channel Streams
			order("lastUpdated", "desc")
		})
		Set<Stream> shareable = permissionService.get(Stream, user, Operation.SHARE).toSet()
		Set<Stream> writable = permissionService.get(Stream, user, Operation.WRITE).toSet()
		[streams:streams, shareable:shareable, writable:writable, user:user]
	}
}
