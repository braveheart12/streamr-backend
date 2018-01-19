// @flow

declare var Streamr: any

import axios from 'axios'
import parseError from './utils/parseError'
import createLink from '../helpers/createLink'

import {showSuccess, showError} from './notification'

import type {ApiError} from '../flowtype/common-types'
import type {Stream} from '../flowtype/stream-types'

export const CREATE_STREAM_REQUEST = 'CREATE_STREAM_REQUEST'
export const CREATE_STREAM_SUCCESS = 'CREATE_STREAM_SUCCESS'
export const CREATE_STREAM_FAILURE = 'CREATE_STREAM_FAILURE'

export const GET_STREAM_REQUEST = 'GET_STREAM_REQUEST'
export const GET_STREAM_SUCCESS = 'GET_STREAM_SUCCESS'
export const GET_STREAM_FAILURE = 'GET_STREAM_FAILURE'

export const GET_MY_STREAM_PERMISSIONS_REQUEST = 'GET_MY_STREAM_PERMISSIONS_REQUEST'
export const GET_MY_STREAM_PERMISSIONS_SUCCESS = 'GET_MY_STREAM_PERMISSIONS_SUCCESS'
export const GET_MY_STREAM_PERMISSIONS_FAILURE = 'GET_MY_STREAM_PERMISSIONS_FAILURE'

export const SAVE_FIELDS_REQUEST = 'SAVE_FIELDS_REQUEST'
export const SAVE_FIELDS_SUCCESS = 'SAVE_FIELDS_SUCCESS'
export const SAVE_FIELDS_FAILURE = 'SAVE_FIELDS_FAILURE'

export const OPEN_STREAM = 'OPEN_STREAM'

const apiUrl = '/api/v1/streams'

export const createStream = (data: {name: string, description: string}) => (dispatch: Function) => {
    dispatch(createStreamRequest())
    axios.post(createLink(apiUrl), data)
        .then(({data}: {data: Stream}) => {
            dispatch(showSuccess({
                title: `Stream ${data.name} created successfully!`
            }))
            dispatch(createStreamSuccess(data))
        })
        .catch(res => {
            const e = parseError(res)
            dispatch(showError({
                title: e.message
            }))
            dispatch(createStreamFailure(e))
            throw e
        })
}

export const getStream = (id: Stream.id) => (dispatch: Function) => {
    dispatch(getStreamRequest())
    axios.get(createLink(`${apiUrl}/${id}`))
        .then(({data}: {data: Stream}) => dispatch(getStreamSuccess(data)))
        .catch(res => {
            const e = parseError(res)
            dispatch(showError({
                title: e.message
            }))
            dispatch(getStreamFailure(e))
            throw e
        })
}

export const getMyStreamPermissions = (id: Stream.id) => (dispatch: Function) => {
    dispatch(getMyStreamPermissionsRequest())
    return axios.get(createLink(`${apiUrl}/${id}/permissions/me`))
        .then(res => dispatch(getMyStreamPermissionsSuccess(id, res.data.filter(item => item.user === Streamr.user).map(item => item.operation))))
        .catch(res => {
            const e = parseError(res)
            dispatch(getMyStreamPermissionsFailure(e))
            dispatch(showError({
                title: 'Error!',
                message: e.message
            }))
            throw e
        })
}

export const saveFields = (id: Stream.id, fields: Stream.config.fields) => (dispatch: Function) => {
    dispatch(saveFieldsRequest())
    return axios.post(createLink(`${apiUrl}/${id}/fields`), fields)
        .then(({data}) => {
            dispatch(saveFieldsSuccess(id, data))
            dispatch(showSuccess({
                title: 'Success!',
                message: 'Fields saved successfully'
            }))
        })
        .catch(res => {
            const e = parseError(res)
            dispatch(saveFieldsFailure(e))
            dispatch(showError({
                title: 'Error!',
                message: e.message
            }))
            throw e
        })
}

export const openStream = (id: Stream.id) => ({
    type: OPEN_STREAM,
    id
})

const saveFieldsRequest = () => ({
    type: SAVE_FIELDS_REQUEST
})

const saveFieldsSuccess = (id: Stream.id, fields: Stream.config.fields) => ({
    type: SAVE_FIELDS_SUCCESS,
    id,
    fields
})

const saveFieldsFailure = (error: ApiError) => ({
    type: SAVE_FIELDS_FAILURE,
    error
})

const createStreamRequest = () => ({
    type: CREATE_STREAM_REQUEST
})

const createStreamSuccess = (stream: Stream) => ({
    type: CREATE_STREAM_SUCCESS,
    stream
})

const createStreamFailure = (error: ApiError) => ({
    type: CREATE_STREAM_FAILURE,
    error
})

const getStreamRequest = () => ({
    type: GET_STREAM_REQUEST
})

const getStreamSuccess = (stream: Stream) => ({
    type: GET_STREAM_SUCCESS,
    stream
})

const getStreamFailure = (error: ApiError) => ({
    type: GET_STREAM_FAILURE,
    error
})

const getMyStreamPermissionsRequest = () => ({
    type: GET_MY_STREAM_PERMISSIONS_REQUEST
})

const getMyStreamPermissionsSuccess = (id: Stream.id, permissions: Array<string>) => ({
    type: GET_MY_STREAM_PERMISSIONS_SUCCESS,
    id,
    permissions
})

const getMyStreamPermissionsFailure = (error: ApiError) => ({
    type: GET_MY_STREAM_PERMISSIONS_FAILURE,
    error
})
