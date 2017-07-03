// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import ResourceList from '../../ResourceList'
import {getAndReplaceDashboards} from '../../../actions/dashboard'

import type {Dashboard} from '../../../flowtype/dashboard-types'

export class DashboardListPage extends Component {
    
    props: {
        dashboards: Array<Dashboard>
    }
    
    render() {
        return (
            <ResourceList title="Dashboards" items={this.props.dashboards} fields={[{
                name: 'name',
                displayName: 'Dashboard name'
            }, {
                name: 'updated',
                displayName: 'Updated'
            }]}/>
        )
    }
}

const mapStateToProps = ({dashboard}) => ({
    dashboards: Object.values(dashboard.byId).map((db: Dashboard): any => ({
        ...db,
        href: 'moi'
    }))
})

export default connect(mapStateToProps)(DashboardListPage)