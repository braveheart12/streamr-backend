package com.unifina.domain.dashboard

import com.unifina.domain.security.Permission
import com.unifina.domain.security.SecUser
import groovy.transform.CompileStatic

class Dashboard {

	SecUser user

	String name

	Date dateCreated
	Date lastUpdated

	SortedSet<DashboardItem> items

	String layout = "{}" // JSON

	ArrayList<Permission> ownPermissions

	static transients = ['ownPermissions']

	static hasMany = [items: DashboardItem]

	static constraints = {
		name(nullable:true)
	}

	static mapping = {
		items cascade: 'all-delete-orphan'
	}

	@CompileStatic
	Map toSummaryMap() {
		DateFormat df = new SimpleDateFormat("YYYY-MM-dd HH:mm:ss zzz")
		def perm = ownPermissions*.toMap()
		return (perm != null && perm.size()) ? [
				id         : id,
				name       : name,
				numOfItems : items == null ? 0 : items.size(),
				lastUpdated: df.format(lastUpdated),
				user       : user.username,
				ownPermissions: perm
		] : [
				id         : id,
				name       : name,
				numOfItems : items == null ? 0 : items.size(),
				lastUpdated: df.format(lastUpdated),
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
