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
    }
    
    componentWillMount() {
        moxios.install(axios)
        moxios.stubRequest(/.*/, {
            status: 200,
            response: [{
                id: 1,
                anonymous: true
            }, {
                id: 2,
                user: 'test@test.test',
                operation: 'share'
            }]
        })
    }
    
    componentWillUnmount() {
        moxios.uninstall(axios)
    }
    
    render() {
        return (
            <ShareDialog
                resourceType="DASHBOARD"
                resourceId="resourceId"
                resourceTitle="resourceTitle"
            >
                <button>
                    Open
                </button>
            </ShareDialog>
        )
    }
}
