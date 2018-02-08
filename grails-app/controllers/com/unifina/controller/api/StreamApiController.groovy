package com.unifina.controller.api

import com.unifina.api.ApiException
import com.unifina.api.NotFoundException
import com.unifina.api.NotPermittedException
import com.unifina.api.StreamrApiHelper
import com.unifina.api.ValidationException
import com.unifina.domain.data.Stream
import com.unifina.domain.security.Permission.Operation
import com.unifina.feed.DataRange
import com.unifina.security.AuthLevel
import com.unifina.security.StreamrApi
import com.unifina.utils.CSVImporter
import grails.converters.JSON
import grails.plugin.springsecurity.annotation.Secured
import org.apache.commons.lang.exception.ExceptionUtils
import org.springframework.web.multipart.MultipartFile

@Secured(["IS_AUTHENTICATED_ANONYMOUSLY"])
class StreamApiController {

	def streamService
	def permissionService
	def apiService

	@StreamrApi
	def index() {
		def criteria = apiService.createListCriteria(params, ["name", "description"], {
			// Filter by exact name
			if (params.name) {
				eq("name", params.name)
			}
			// Filter by UI channel
			if (params.uiChannel) {
				eq("uiChannel", params.boolean("uiChannel"))
			}
		})
		def streams = permissionService.get(Stream, request.apiUser, Operation.READ, apiService.isPublicFlagOn(params), criteria)
		render(streams*.toMap() as JSON)
	}

	@StreamrApi
	def save() {
		Stream stream = streamService.createStream(request.JSON, request.apiUser)
		render(stream.toMap() as JSON)
	}


	@StreamrApi(authenticationLevel = AuthLevel.NONE)
	def show(String id) {
		streamService.getReadAuthorizedStream(id, request.apiUser, request.apiKey) { Stream stream ->
			render(stream.toMap() as JSON)
		}
	}

	@StreamrApi
	def update(String id) {
		getAuthorizedStream(id, Operation.WRITE) { Stream stream ->
			Stream newStream = new Stream(request.JSON)
			stream.name = newStream.name
			stream.description = newStream.description
			stream.config = readConfig()
			if (stream.validate()) {
				stream.save(failOnError: true)
				render(stream.toMap() as JSON)
			} else {
				throw new ValidationException(stream.errors)
			}
		}
	}

	@StreamrApi
	def detectFields(String id) {
		getAuthorizedStream(id, Operation.READ) { Stream stream ->
			if (streamService.autodetectFields(stream, params.boolean("flatten", false))) {
				render(stream.toMap() as JSON)
			} else {
				throw new ApiException(500, "NO_FIELDS_FOUND", "No fields found for Stream (id=$stream.id)")
			}
		}
	}

	@StreamrApi
	def setFields(String id) {
		getAuthorizedStream(id, Operation.WRITE) { stream ->
			def fields = request.JSON
			Map config = stream.config ? JSON.parse(stream.config) : [:]
			config.fields = fields
			stream.config = (config as JSON)

			Map result = [success: true, id: stream.id]
			render result as JSON
		}
	}

	@StreamrApi
	def uploadCsvFile(String id) {
		getAuthorizedStream(id, Operation.WRITE) { Stream stream ->
			File temp
			boolean deleteFile = true
			try {
				MultipartFile file = request.getFile("file")
				temp = File.createTempFile("csv_upload_", ".csv")
				file.transferTo(temp)

				Map config = (stream.config ? JSON.parse(stream.config) : [:])
				List fields = config.fields ? config.fields : []
				CSVImporter csv = new CSVImporter(temp, fields, null, null, request.apiUser.timezone)
				if (csv.getSchema().timestampColumnIndex == null) {
					deleteFile = false
					def e = new ApiException(500, 'CSV_PARSE_EXCEPTION', 'fsaklfjlasdkfjsdfadflkj')
					response.setStatus(e.statusCode)
					render([code: e.code, message: e.message, fileUrl: temp.getCanonicalPath(), schema: csv.getSchema().toMap()] as JSON)
				} else {
					Map updatedConfig = streamService.importCsv(csv, stream)
					stream.config = (updatedConfig as JSON)
					stream.save()
					render([success: true] as JSON)
				}
			} catch (Exception e) {
				Exception rootCause = ExceptionUtils.getRootCause(e)
				if(rootCause != null)
					e = rootCause
				log.error("Failed to import file", e)
				response.status = 500
				render([success: false, error: e.message] as JSON)
			} finally {
				if (deleteFile && temp != null && temp.exists()) {
					temp.delete()
				}
			}
		}
	}

	@StreamrApi
	def confirmCsvFileUpload(String id) {
		getAuthorizedStream(id, Operation.WRITE) { stream ->
			File file = new File(request.JSON.fileUrl)
			List fields = stream.config ? JSON.parse(stream.config).fields : []
			def index = Integer.parseInt(request.JSON.timestampColumnIndex)
			def format = request.JSON.dateFormat
			try {
				CSVImporter csv = new CSVImporter(file, fields, index, format)
				Map config = streamService.importCsv(csv, stream)
				stream.config = (config as JSON)
				stream.save()
				render([stream: stream] as JSON)
			} catch (Throwable e) {
				e = ExceptionUtils.getRootCause(e)
				throw e
			}
		}
	}

	private String readConfig() {
		Map config = request.JSON.config
		return config
	}

	@StreamrApi
	def delete(String id) {
		getAuthorizedStream(id, Operation.WRITE) { Stream stream ->
			streamService.deleteStream(stream)
			render(status: 204)
		}
	}

	@StreamrApi
	def range(String id) {
		getAuthorizedStream(id, Operation.READ) { Stream stream ->
			DataRange dataRange = streamService.getDataRange(stream)
			Map dataRangeMap = [beginDate: dataRange?.beginDate, endDate: dataRange?.endDate]
			render dataRangeMap as JSON
		}
	}

	private def getAuthorizedStream(String id, Operation op, Closure action) {
		def stream = Stream.get(id)
		if (stream == null) {
			throw new NotFoundException("Stream", id)
		} else if (!permissionService.check(request.apiUser, stream, op)) {
			throw new NotPermittedException(request.apiUser?.username, "Stream", id, op.id)
		} else {
			action.call(stream)
		}
	}
}
