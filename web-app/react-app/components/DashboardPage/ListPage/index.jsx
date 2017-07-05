// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Button, ButtonGroup} from 'react-bootstrap'
import {Link} from 'react-router'
import FontAwesome from 'react-fontawesome'

import {getAndReplaceDashboards} from '../../../actions/dashboard'

import ResourceList from '../../ResourceList'

import styles from './dashboardListPage.pcss'

import type {Dashboard} from '../../../flowtype/dashboard-types'
import type {ResourceSearchQuery} from '../../../flowtype/resource-types'

export class DashboardListPage extends Component {
    getItems: Function
    props: {
        dashboards: Array<Dashboard>,
        getDashboards: (search: ResourceSearchQuery) => void
    }
    
    constructor() {
        super()
        this.getItems = this.getItems.bind(this)
    }
    
    getItems(search: ResourceSearchQuery) {
        this.props.getDashboards(search)
    }
    
    static mapResourceToItem(resource: Dashboard) {
        return {
            ...resource,
            to: `editor/${resource.id}`
        }
    }
    
    render() {
        return (
            <div id="content-wrapper" className="scrollable" style={{
                height: '100%'
            }}>
                <div className="container">
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
                        searchEnabled={true}
                        getItems={this.getItems}
                        mapResourceToItem={DashboardListPage.mapResourceToItem}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({dashboard}) => ({
    dashboards: Object.values(dashboard.dashboardsById).map((db: Dashboard): any => ({
        ...db,
        to: `editor/${db.id}`
    }))
})

const mapDispatchToProps = (dispatch) => ({
    getDashboards(search) {
        dispatch(getAndReplaceDashboards(search))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(DashboardListPage)