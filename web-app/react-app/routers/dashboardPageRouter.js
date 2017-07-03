
import React from 'react'
import { Router, Route, Redirect, useRouterHistory } from 'react-router'
import uuid from 'uuid'
import { createHistory } from 'history'
import createLink from '../createLink'

import {getAndReplaceDashboards, getMyDashboardPermissions, newDashboard, openDashboard} from '../actions/dashboard'
import {getRunningCanvases} from '../actions/canvas'

import ListPage from '../components/DashboardPage/ListPage'
import EditorPage from '../components/DashboardPage/EditorPage'

import store from '../stores/dashboardPageStore.js'

const basename = createLink('/dashboard/editor').replace(window.location.origin, '')

const history = useRouterHistory(createHistory)({
    basename
})

export default (
    <Router history={history}>
        <Redirect from="/" to="/list"/>
        <Route path="/list" component={ListPage} onEnter={
            store.dispatch(getAndReplaceDashboards())
        }/>
        <Route path="/editor(:id)" component={EditorPage} onEnter={({params}) => {
            let id
            if (params.id !== undefined) {
                id = params.id
                store.dispatch(getDashboard(id))
                store.dispatch(getMyDashboardPermissions(id))
            } else {
                id = uuid.v4()
                store.dispatch(newDashboard(id))
            }
            store.dispatch(getRunningCanvases())
            store.dispatch(openDashboard(id))
        }}/>
    </Router>
)