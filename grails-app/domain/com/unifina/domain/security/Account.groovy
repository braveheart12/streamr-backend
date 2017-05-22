package com.unifina.domain.security

import com.unifina.utils.IdGenerator
import grails.converters.JSON
import groovy.transform.CompileStatic
import org.codehaus.groovy.grails.web.json.JSONObject

class Account {

	String id
	SecUser user
	String name
	Type type
	String json

	Date dateCreated
	Date lastUpdated

	static mapping = {
		id generator: IdGenerator.name // Note: doesn't apply in unit tests
		json type: 'text'
	}

	static constraints = {
	}

	enum Type {
		ETHEREUM("ETHEREUM")
		String id

		Type(String id) {
			this.id = id
		}

		static fromString(String operationId) {
			return Type.enumConstants.find { it.id == operationId }
		}
	}

	@CompileStatic
	Map toMap() {
		return [
				id  : id,
				user: user.id,
				name: name,
				type: type.id,
				json: (JSONObject) JSON.parse(json)
		]
	}
}

