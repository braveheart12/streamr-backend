// @flow

import React from 'react'
import ShareDialog from '../components/ShareDialog'
import moxios from 'moxios'
import axios from 'axios'

import type {Permission} from '../flowtype/permission-types'

export default class ShareDialogStory extends React.Component {
    save: Function
    state: {
        permissions: Array<Permission>
    }
    
    constructor() {
        super()
        this.state = {
            permissions: []
        }
        this.save = this.save.bind(this)
    }
    
    componentWillMount() {
        moxios.install(axios)
        moxios.stubRequest('/api/v1/dashboards/test/permissions', {
            status: 200,
            response: () => {
                debugger
                return [{
                    id: 1,
                    anonymous: true
                }, {
                    id: 2,
                    user: 'test@test.test',
                    operation: 'share'
                }]
            }
        })
        //moxios.stubRequest('/api/v1/dashboards/test/permissions', () => {
        //    debugger
        //    return {
        //        status: 200,
        //        response: []
        //    }
        //})
    }
    
    componentWillUnmount() {
        moxios.uninstall(axios)
    }
    
    save(permissions: Array<Permission>) {
        return new Promise(resolve => {
            this.setState({
                permissions
            })
            resolve()
        })
    }
    
    render() {
        return (
            <ShareDialog
                resourceType="DASHBOARD"
                resourceId="test"
                resourceTitle="Dashboard test"
                permissions={this.state.permissions}
                save={this.save}
            >
                <button>
                    Open
                </button>
            </ShareDialog>
        )
    }
}
