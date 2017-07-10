package com.unifina.domain.dashboard

import com.unifina.domain.security.Permission
import com.unifina.domain.security.SecUser
import groovy.transform.CompileStatic

import java.text.DateFormat
import java.text.SimpleDateFormat

class Dashboard {

	SecUser user

	String name

	Date dateCreated
	Date lastUpdated

	ArrayList<Permission> permissions

	static transients = ['permissions']

	static hasMany = [
	        items: DashboardItem
	]

	static constraints = {
		name(nullable:true)
	}

	static mapping = {
		items cascade: 'all-delete-orphan', fetch: 'join'
	}

	@CompileStatic
	Map toSummaryMap() {
		// TODO: get away of repeat
		DateFormat df = new SimpleDateFormat("YYYY-MM-dd HH:mm:ss zzz")
		def lu = lastUpdated ? df.format(lastUpdated) : null
		def perm = permissions*.toMap()
		return (perm != null && perm.size()) ? [
				id         : id,
				name       : name,
				numOfItems : items == null ? 0 : items.size(),
				lastUpdated: lu,
				user       : user.username,
				ownPermissions: perm
		] : [
				id         : id,
				name       : name,
				numOfItems : items == null ? 0 : items.size(),
				lastUpdated: lu,
				user       : user.username
		]
	}

	@CompileStatic
	Map toMap() {
		[
			id: id,
			name: name,
			items: items == null ? [] : items.collect { DashboardItem it -> it.toMap() },
		]
	}

}
