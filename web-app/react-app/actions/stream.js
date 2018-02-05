// @flow

declare var Streamr: any

import axios from 'axios'
import parseError from './utils/parseError'
import createLink from '../helpers/createLink'

import {success, error} from 'react-notification-system-redux'

import type {ApiError} from '../flowtype/common-types'
import type {Stream} from '../flowtype/stream-types'
import type {Permission} from '../flowtype/permission-types'

export const CREATE_STREAM_REQUEST = 'CREATE_STREAM_REQUEST'
export const CREATE_STREAM_SUCCESS = 'CREATE_STREAM_SUCCESS'
export const CREATE_STREAM_FAILURE = 'CREATE_STREAM_FAILURE'

export const GET_STREAM_REQUEST = 'GET_STREAM_REQUEST'
export const GET_STREAM_SUCCESS = 'GET_STREAM_SUCCESS'
export const GET_STREAM_FAILURE = 'GET_STREAM_FAILURE'

export const UPDATE_STREAM_REQUEST = 'UPDATE_STREAM_REQUEST'
export const UPDATE_STREAM_SUCCESS = 'UPDATE_STREAM_SUCCESS'
export const UPDATE_STREAM_FAILURE = 'UPDATE_STREAM_FAILURE'

export const DELETE_STREAM_REQUEST = 'DELETE_STREAM_REQUEST'
export const DELETE_STREAM_SUCCESS = 'DELETE_STREAM_SUCCESS'
export const DELETE_STREAM_FAILURE = 'DELETE_STREAM_FAILURE'

export const GET_MY_STREAM_PERMISSIONS_REQUEST = 'GET_MY_STREAM_PERMISSIONS_REQUEST'
export const GET_MY_STREAM_PERMISSIONS_SUCCESS = 'GET_MY_STREAM_PERMISSIONS_SUCCESS'
export const GET_MY_STREAM_PERMISSIONS_FAILURE = 'GET_MY_STREAM_PERMISSIONS_FAILURE'

export const SAVE_FIELDS_REQUEST = 'SAVE_FIELDS_REQUEST'
export const SAVE_FIELDS_SUCCESS = 'SAVE_FIELDS_SUCCESS'
export const SAVE_FIELDS_FAILURE = 'SAVE_FIELDS_FAILURE'

export const OPEN_STREAM = 'OPEN_STREAM'

const apiUrl = '/api/v1/streams'

export const createStream = (data: {name: string, description: string}) => (dispatch: Function): Promise<Stream> => {
    dispatch(createStreamRequest())
    return new Promise((resolve, reject) => {
        axios.post(createLink(apiUrl), data)
            .then(({data}: {data: Stream}) => {
                dispatch(success({
                    title: `Stream ${data.name} created successfully!`
                }))
                dispatch(createStreamSuccess(data))
                resolve(data)
            })
            .catch(res => {
                const e = parseError(res)
                dispatch(error({
                    title: 'Error!',
                    message: e.error
                }))
                dispatch(createStreamFailure(e))
                reject(e)
            })
    })
}

export const getStream = (id: $ElementType<Stream, 'id'>) => (dispatch: Function) => {
    dispatch(getStreamRequest())
    axios.get(createLink(`${apiUrl}/${id}`))
        .then(({data}: {data: Stream}) => dispatch(getStreamSuccess(data)))
        .catch(res => {
            const e = parseError(res)
            dispatch(error({
                title: 'Error!',
                message: e.error
            }))
            dispatch(getStreamFailure(e))
            throw e
        })
}

export const updateStream = (stream: Stream) => (dispatch: Function) => {
    dispatch(updateStreamRequest())
    return axios.put(createLink(`${apiUrl}/${stream.id}`), stream)
        .then(({data}) => {
            dispatch(updateStreamSuccess(data))
            dispatch(success({
                title: 'Success!',
                message: 'Stream saved successfully'
            }))
        })
        .catch(res => {
            const e = parseError(res)
            dispatch(error({
                title: 'Error!',
                message: e.error
            }))
            dispatch(updateStreamFailure(e))
            throw e
        })
}

export const deleteStream = (stream: Stream) => (dispatch: Function) => {
    dispatch(deleteStreamRequest())
    return axios.delete(createLink(`${apiUrl}/${stream.id}`))
        .then(() => {
            dispatch(deleteStreamSuccess(stream.id))
            dispatch(success({
                title: 'Success!',
                message: 'Stream deleted successfully'
            }))
        })
        .catch(res => {
            const e = parseError(res)
            dispatch(error({
                title: 'Error!',
                message: e.error
            }))
            dispatch(deleteStreamFailure(e))
            throw e
        })
}

export const getMyStreamPermissions = (id: $ElementType<Stream, 'id'>) => (dispatch: Function) => {
    dispatch(getMyStreamPermissionsRequest())
    return axios.get(createLink(`${apiUrl}/${id}/permissions/me`))
        .then(res => dispatch(getMyStreamPermissionsSuccess(id, res.data.filter(item => item.user === Streamr.user).map(item => item.operation))))
        .catch(res => {
            const e = parseError(res)
            dispatch(getMyStreamPermissionsFailure(e))
            dispatch(error({
                title: 'Error!',
                message: e.error
            }))
            throw e
        })
}

export const saveFields = (id: $ElementType<Stream, 'id'>, fields: $ElementType<$ElementType<Stream, 'config'>, 'fields'>) => (dispatch: Function) => {
    dispatch(saveFieldsRequest())
    return axios.post(createLink(`${apiUrl}/${id}/fields`), fields)
        .then(({data}) => {
            dispatch(saveFieldsSuccess(id, data))
            dispatch(success({
                title: 'Success!',
                message: 'Fields saved successfully'
            }))
        })
        .catch(res => {
            const e = parseError(res)
            dispatch(saveFieldsFailure(e))
            dispatch(error({
                title: 'Error!',
                message: e.error
            }))
            throw e
        })
}

export const openStream = (id: $ElementType<Stream, 'id'>) => ({
    type: OPEN_STREAM,
    id
})

const saveFieldsRequest = () => ({
    type: SAVE_FIELDS_REQUEST
})

const saveFieldsSuccess = (id: $ElementType<Stream, 'id'>, fields: $ElementType<$ElementType<Stream, 'config'>, 'fields'>) => ({
    type: SAVE_FIELDS_SUCCESS,
    id,
    fields
})

const saveFieldsFailure = (error: ApiError) => ({
    type: SAVE_FIELDS_FAILURE,
    error
})

const updateStreamRequest = () => ({
    type: UPDATE_STREAM_REQUEST
})

const updateStreamSuccess = (stream: Stream) => ({
    type: UPDATE_STREAM_SUCCESS,
    stream
})

const updateStreamFailure = (error: ApiError) => ({
    type: UPDATE_STREAM_FAILURE,
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

const deleteStreamRequest = () => ({
    type: DELETE_STREAM_REQUEST
})

const deleteStreamSuccess = (id: $ElementType<Stream, 'id'>) => ({
    type: DELETE_STREAM_SUCCESS,
    id
})

const deleteStreamFailure = (error: ApiError) => ({
    type: DELETE_STREAM_FAILURE,
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

const getMyStreamPermissionsRequest = () => ({
    type: GET_MY_STREAM_PERMISSIONS_REQUEST
})

const getMyStreamPermissionsSuccess = (id: $ElementType<Stream, 'id'>, permissions: Array<$ElementType<Permission, 'operation'>>) => ({
    type: GET_MY_STREAM_PERMISSIONS_SUCCESS,
    id,
    permissions
})

const getMyStreamPermissionsFailure = (error: ApiError) => ({
    type: GET_MY_STREAM_PERMISSIONS_FAILURE,
    error
})
