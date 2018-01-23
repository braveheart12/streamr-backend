// @flow

import {
    GET_STREAM_REQUEST,
    GET_STREAM_SUCCESS,
    GET_STREAM_FAILURE,
    CREATE_STREAM_REQUEST,
    CREATE_STREAM_SUCCESS,
    CREATE_STREAM_FAILURE,
    UPDATE_STREAM_REQUEST,
    UPDATE_STREAM_SUCCESS,
    UPDATE_STREAM_FAILURE,
    GET_MY_STREAM_PERMISSIONS_REQUEST,
    GET_MY_STREAM_PERMISSIONS_SUCCESS,
    GET_MY_STREAM_PERMISSIONS_FAILURE,
    OPEN_STREAM
} from '../actions/stream.js'

import type {State, Action} from '../flowtype/stream-types.js'

const initialState = {
    byId: {},
    openStream: {
        id: null
    },
    fetching: false,
    error: null
}

export default function(state: State = initialState, action: Action) : State {
    switch (action.type) {
        case GET_STREAM_REQUEST:
        case CREATE_STREAM_REQUEST:
        case UPDATE_STREAM_REQUEST:
        case GET_MY_STREAM_PERMISSIONS_REQUEST:
            return {
                ...state,
                fetching: true
            }
        case GET_STREAM_SUCCESS:
        case CREATE_STREAM_SUCCESS:
        case UPDATE_STREAM_SUCCESS:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.stream.id]: {
                        ...(state.byId[state.openStream.id] || {}),
                        ...action.stream
                    }
                },
                fetching: false,
                error: null
            }
        case GET_STREAM_FAILURE:
        case CREATE_STREAM_FAILURE:
        case UPDATE_STREAM_FAILURE:
        case GET_MY_STREAM_PERMISSIONS_FAILURE:
            return {
                ...state,
                fetching: false,
                error: action.error
            }
        case OPEN_STREAM:
            return {
                ...state,
                openStream: {
                    ...state.openStream,
                    id: action.id
                }
            }
        case GET_MY_STREAM_PERMISSIONS_SUCCESS:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.id]: {
                        ...state.byId[action.id],
                        ownPermissions: action.permissions || []
                    }
                },
                error: null,
                fetching: false
            }
        default:
            return state
    }
}