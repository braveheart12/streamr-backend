// @flow

import axios from 'axios'
import parseError from './utils/parseError'
import createLink from '../createLink'
import _ from 'lodash'

import {showSuccess, showError} from './notification'

export const CREATE_DASHBOARD = 'CREATE_DASHBOARD'
export const OPEN_DASHBOARD = 'OPEN_DASHBOARD'
export const UPDATE_DASHBOARD = 'UPDATE_DASHBOARD'

export const UPDATE_AND_SAVE_DASHBOARD_REQUEST = 'UPDATE_AND_SAVE_DASHBOARD_REQUEST'
export const UPDATE_AND_SAVE_DASHBOARD_SUCCESS = 'UPDATE_AND_SAVE_DASHBOARD_SUCCESS'
export const UPDATE_AND_SAVE_DASHBOARD_FAILURE = 'UPDATE_AND_SAVE_DASHBOARD_FAILURE'

export const GET_AND_REPLACE_DASHBOARDS_REQUEST = 'GET_AND_REPLACE_DASHBOARDS_REQUEST'
export const GET_AND_REPLACE_DASHBOARDS_SUCCESS = 'GET_AND_REPLACE_DASHBOARDS_SUCCESS'
export const GET_AND_REPLACE_DASHBOARDS_FAILURE = 'GET_AND_REPLACE_DASHBOARDS_FAILURE'

export const GET_DASHBOARD_REQUEST = 'GET_DASHBOARD_REQUEST'
export const GET_DASHBOARD_SUCCESS = 'GET_DASHBOARD_SUCCESS'
export const GET_DASHBOARD_FAILURE = 'GET_DASHBOARD_FAILURE'

export const DELETE_DASHBOARD_REQUEST = 'DELETE_DASHBOARD_REQUEST'
export const DELETE_DASHBOARD_SUCCESS = 'DELETE_DASHBOARD_SUCCESS'
export const DELETE_DASHBOARD_FAILURE = 'DELETE_DASHBOARD_FAILURE'

export const GET_MY_PERMISSIONS_FOR_DASHBOARD_BY_ID_REQUEST = 'GET_MY_PERMISSIONS_FOR_DASHBOARD_BY_ID_REQUEST'
export const GET_MY_PERMISSIONS_FOR_DASHBOARD_BY_ID_SUCCESS = 'GET_MY_PERMISSIONS_FOR_DASHBOARD_BY_ID_SUCCESS'
export const GET_MY_PERMISSIONS_FOR_DASHBOARD_BY_ID_FAILURE = 'GET_MY_PERMISSIONS_FOR_DASHBOARD_BY_ID_FAILURE'

export const GET_MY_PERMISSIONS_FOR_ALL_MY_DASHBOARDS_REQUEST = 'GET_MY_PERMISSIONS_FOR_ALL_MY_DASHBOARDS_REQUEST'
export const GET_MY_PERMISSIONS_FOR_ALL_MY_DASHBOARDS_SUCCESS = 'GET_MY_PERMISSIONS_FOR_ALL_MY_DASHBOARDS_SUCCESS'
export const GET_MY_PERMISSIONS_FOR_ALL_MY_DASHBOARDS_FAILURE = 'GET_MY_PERMISSIONS_FOR_ALL_MY_DASHBOARDS_FAILURE'

export const LOCK_DASHBOARD_EDITING = 'LOCK_DASHBOARD_EDITING'
export const UNLOCK_DASHBOARD_EDITING = 'UNLOCK_DASHBOARD_EDITING'

const apiUrl = 'api/v1/dashboards'

import type { ApiError } from '../flowtype/common-types'
import type { Dashboard, DashboardItem } from '../flowtype/dashboard-types'

declare var Streamr: {
    user: string
}

export const getAndReplaceDashboards = () => (dispatch: Function) => {
    dispatch(getAndReplaceDashboardsRequest())
    return axios.get(createLink(apiUrl))
        .then(({data}) => {
            dispatch(getAndReplaceDashboardsSuccess(data))
        })
        .catch(res => {
            const e = parseError(res)
            dispatch(getAndReplaceDashboardsFailure(e))
            dispatch(showError({
                title: e.message
            }))
            throw e
        })
}

export const getDashboard = (id: Dashboard.id) => (dispatch: Function) => {
    dispatch(getDashboardRequest(id))
    return axios.get(createLink(`${apiUrl}/${id}`))
        .then(({data}) => dispatch(getDashboardSuccess({
            ...data,
            layout: data.layout && ((typeof data.layout === 'string') ? JSON.parse(data.layout) : data.layout)
        })))
        .catch(res => {
            const e = parseError(res)
            dispatch(getDashboardFailure(e))
            dispatch(showError({
                title: e.message
            }))
            throw e
        })
}

export const updateAndSaveDashboard = (dashboard: Dashboard) => (dispatch: Function) => {
    dispatch(updateAndSaveDashboardRequest())
    const createNew = dashboard.new
    return axios({
        method: createNew ? 'POST' : 'PUT',
        url: createLink(createNew ? apiUrl : `${apiUrl}/${dashboard.id}`),
        data: {
            ...dashboard,
            layout: JSON.stringify(dashboard.layout)
        }
    })
        .then(({data}) => {
            dispatch(showSuccess({
                title: 'Dashboard saved succesfully!'
            }))
            
            return dispatch(updateAndSaveDashboardSuccess({
                ...data,
                layout: (typeof data.layout === 'string') ? JSON.parse(data.layout) : data.layout
            }))
        })
        .catch(res => {
            const e = parseError(res)
            
            dispatch(showError({
                title: e.message
            }))
            dispatch(updateAndSaveDashboardFailure(e))
            
            throw e
        })
}

export const deleteDashboard = (id: Dashboard.id) => (dispatch: Function) => {
    dispatch(deleteDashboardRequest(id))
    return axios.delete(createLink(`${apiUrl}/${id}`))
        .then(() => dispatch(deleteDashboardSuccess(id)))
        .catch(res => {
            const e = parseError(res)
            dispatch(deleteDashboardFailure(e))
            dispatch(showError({
                title: e.message
            }))
            throw e
        })
}

export const getMyPermissionsForDashboardById = (id: Dashboard.id) => (dispatch: Function) => {
    dispatch(getMyPermissionsForDashboardByIdRequest(id))
    return axios.get(createLink(`${apiUrl}/${id}/permissions/me`))
        .then(res => dispatch(getMyPermissionsForDashboardByIdSuccess(id, res.data.filter(item => item.user === Streamr.user).map(item => item.operation))))
        .catch(res => {
            const e = parseError(res)
            dispatch(getMyPermissionsForDashboardByIdFailure(id, e))
            dispatch(showError({
                title: 'Error!',
                message: e.message
            }))
            throw e
        })
}

export const getMyPermissionsForAllMyDashboards = () => (dispatch: Function) => {
    dispatch(getMyPermissionsForAllMyDashboardsRequest())
    return axios.get(createLink(`${apiUrl}/permissions/me`))
        .then(res => {
            dispatch(getMyPermissionsForAllMyDashboardsSuccess())
            debugger
            const permissionsByResourceId = _.chain(res.data)
                .groupBy(item => item.resourceId)
                .mapValues(item => item.map(perm => perm.operation))
                .value()
            Object.keys(permissionsByResourceId).forEach(id => {
                dispatch(getMyPermissionsForDashboardByIdSuccess(id, permissionsByResourceId[id]))
            })
        })
        .catch(res => {
            const e = parseError(res)
            dispatch(getMyPermissionsForAllMyDashboardsFailure(e))
            dispatch(showError({
                title: 'Error!',
                message: e.message
            }))
            throw e
        })
}

export const updateDashboard = (dashboard: Dashboard) => ({
    type: UPDATE_DASHBOARD,
    dashboard
})

export const addDashboardItem = (dashboard: Dashboard, item: DashboardItem) => updateDashboard({
    ...dashboard,
    items: [
        ...dashboard.items,
        item
    ]
})

export const updateDashboardItem = (dashboard: Dashboard, item: DashboardItem) => updateDashboard({
    ...dashboard,
    items: [
        ...(dashboard.items.filter(it => it.canvas !== item.canvas || it.module !== item.module)),
        item
    ]
})

export const removeDashboardItem = (dashboard: Dashboard, item: DashboardItem) => updateDashboard({
    ...dashboard,
    items: dashboard.items.filter(it => it.canvas !== item.canvas || it.module !== item.module)
})

export const createDashboard = (dashboard: Dashboard) => ({
    type: CREATE_DASHBOARD,
    dashboard
})

export const newDashboard = (id: Dashboard.id) => createDashboard({
    id,
    name: 'Untitled Dashboard',
    items: [],
    layout: {},
    editingLocked: false
})

export const openDashboard = (id: Dashboard.id) => ({
    type: OPEN_DASHBOARD,
    id
})

export const lockDashboardEditing = (id: Dashboard.id) => ({
    type: LOCK_DASHBOARD_EDITING,
    id
})

export const unlockDashboardEditing = (id: Dashboard.id) => ({
    type: UNLOCK_DASHBOARD_EDITING,
    id
})

const getAndReplaceDashboardsRequest = () => ({
    type: GET_AND_REPLACE_DASHBOARDS_REQUEST,
})

const getDashboardRequest = (id: Dashboard.id) => ({
    type: GET_DASHBOARD_REQUEST,
    id
})

const updateAndSaveDashboardRequest = () => ({
    type: UPDATE_AND_SAVE_DASHBOARD_REQUEST,
})

const deleteDashboardRequest = (id: Dashboard.id) => ({
    type: DELETE_DASHBOARD_REQUEST,
    id
})

const getMyPermissionsForDashboardByIdRequest = (id: Dashboard.id) => ({
    type: GET_MY_PERMISSIONS_FOR_DASHBOARD_BY_ID_REQUEST,
    id
})

const getMyPermissionsForAllMyDashboardsRequest = (id: Dashboard.id) => ({
    type: GET_MY_PERMISSIONS_FOR_ALL_MY_DASHBOARDS_REQUEST,
    id
})

const getAndReplaceDashboardsSuccess = (dashboards: Array<Dashboard>) => ({
    type: GET_AND_REPLACE_DASHBOARDS_SUCCESS,
    dashboards
})

const getDashboardSuccess = (dashboard: Dashboard) => ({
    type: GET_DASHBOARD_SUCCESS,
    dashboard
})

const updateAndSaveDashboardSuccess = (dashboard: Dashboard) => ({
    type: UPDATE_AND_SAVE_DASHBOARD_SUCCESS,
    dashboard
})

const deleteDashboardSuccess = (id: Dashboard.id) => ({
    type: DELETE_DASHBOARD_SUCCESS,
    id
})

const getMyPermissionsForDashboardByIdSuccess = (id: Dashboard.id, permissions: Array<string>) => ({
    type: GET_MY_PERMISSIONS_FOR_DASHBOARD_BY_ID_SUCCESS,
    id,
    permissions
})

const getMyPermissionsForAllMyDashboardsSuccess = () => ({
    type: GET_MY_PERMISSIONS_FOR_ALL_MY_DASHBOARDS_SUCCESS,
})

const getAndReplaceDashboardsFailure = (error: ApiError) => ({
    type: GET_AND_REPLACE_DASHBOARDS_FAILURE,
    error
})

const getDashboardFailure = (error: ApiError) => ({
    type: GET_DASHBOARD_FAILURE,
    error
})

const updateAndSaveDashboardFailure = (error: ApiError) => ({
    type: UPDATE_AND_SAVE_DASHBOARD_FAILURE,
    error
})

const deleteDashboardFailure = (error: ApiError) => ({
    type: DELETE_DASHBOARD_FAILURE,
    error
})

const getMyPermissionsForAllMyDashboardsFailure = (id: Dashboard.id, error: ApiError) => ({
    type: GET_MY_PERMISSIONS_FOR_ALL_MY_DASHBOARDS_FAILURE,
    error
})

const getMyPermissionsForDashboardByIdFailure = (id: Dashboard.id, error: ApiError) => ({
    type: GET_MY_PERMISSIONS_FOR_DASHBOARD_BY_ID_FAILURE,
    id,
    error
})
