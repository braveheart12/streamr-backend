// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import {Button, ButtonGroup} from 'react-bootstrap'
import {Link} from 'react-router'
import FontAwesome from 'react-fontawesome'

import ResourceList from '../../ResourceList'

import styles from './dashboardListPage.pcss'

import type {Dashboard} from '../../../flowtype/dashboard-types'

export class DashboardListPage extends Component {
    
    props: {
        dashboards: Array<Dashboard>
    }
    
    render() {
        return (
            <div id="content-wrapper" className="scrollable" style={{
                height: '100%'
            }}>
                <ButtonGroup className={styles.toolbarButtonGroup}>
                    <Button bsStyle="primary">
                        <Link to="editor">
                            <FontAwesome name="plus"/> Create new Dashboard
                        </Link>
                    </Button>
                </ButtonGroup>
                <ResourceList
                    title="Dashboards"
                    items={this.props.dashboards}
                    fields={[{
                        name: 'name',
                        displayName: 'Dashboard name'
                    }, {
                        name: 'lastUpdated',
                        displayName: 'Updated'
                    }]}
                    resourceType="DASHBOARD"
                />
            </div>
        )
    }
}

const mapStateToProps = ({dashboard}) => ({
    dashboards: Object.values(dashboard.dashboardsById).map((db: Dashboard): any => ({
        ...db,
        lastUpdated: moment(dashboard.lastUpdated).format('YYYY-MM-DD HH:mm:ss zz'),
        to: `editor/${db.id}`
    }))
})

export default connect(mapStateToProps)(DashboardListPage)