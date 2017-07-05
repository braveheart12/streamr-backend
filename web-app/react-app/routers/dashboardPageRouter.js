import React from 'react'
import {Router, Route, Redirect, useRouterHistory, IndexRoute} from 'react-router'
import uuid from 'uuid'
import {createHistory} from 'history'
import createLink from '../createLink'

import {
    getAndReplaceDashboards,
    getMyPermissionsForDashboardById,
    newDashboard,
    openDashboard,
    getDashboard,
    getMyPermissionsForAllMyDashboards
} from '../actions/dashboard'
import {getRunningCanvases} from '../actions/canvas'

import ListPage from '../components/DashboardPage/ListPage'
import EditorPage from '../components/DashboardPage/EditorPage'

import store from '../stores/dashboardPageStore.js'

const basename = createLink('/dashboard').replace(window.location.origin, '')

const history = useRouterHistory(createHistory)({
    basename
})

export default function DashboardPageRouter() {
    return (
        <Router history={history}>
            <Route path="/editor" component={EditorPage} onEnter={() => {
                store.dispatch(getRunningCanvases())
            }}>
                <Route path=":id" onEnter={({params}) => {
                    const id = params.id
                    store.dispatch(getDashboard(id))
                    store.dispatch(getMyPermissionsForDashboardById(id))
                    store.dispatch(openDashboard(id))
                }}/>
                <IndexRoute onEnter={() => {
                    const id = uuid.v4()
                    store.dispatch(newDashboard(id))
                    store.dispatch(openDashboard(id))
                }}/>
            </Route>
            
            {/*Routes which show no side menu*/}
            <Route onEnter={() => {
                if (!document.body.classList.contains('no-main-menu')) {
                    document.body.classList.add('no-main-menu')
                }
            }} onLeave={() => {
                if (document.body.classList.contains('no-main-menu')) {
                    document.body.classList.remove('no-main-menu')
                }
            }}>
                <Route path="/list" component={ListPage} onEnter={() => {
                    store.dispatch(getAndReplaceDashboards())
                        .then(() => store.dispatch(getMyPermissionsForAllMyDashboards()))
                }}/>
            </Route>
            <Redirect from="/" to="/list"/>
        </Router>
    )
}