// @flow

import React, {Component} from 'react'
import DashboardPage from '../DashboardPage'
import {BrowserRouter, Route} from 'react-router-dom'
import ShortcutHandler from '../DashboardPage/ShortcutHandler'
import ProfilePage from '../ProfilePage'
import Notifier from '../StreamrNotifierWrapper'

declare var Streamr: {
    projectWebroot: string
}

const basename = Streamr.projectWebroot.replace(window.location.origin, '')

export default class StreamrApp extends Component<{}> {
    render() {
        return (
            <BrowserRouter basename={basename}>
                <ShortcutHandler>
                    <Notifier/>
                    <Route path="/dashboard/editor/:id?" component={DashboardPage}/>
                    <Route path="/profile/edit" component={ProfilePage}/>
                </ShortcutHandler>
            </BrowserRouter>
        )
    }
}
