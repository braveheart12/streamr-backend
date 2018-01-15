// @flow

import createStore from './basicStore'

import streamReducer from '../reducers/stream.js'
import permissionReducer from '../reducers/permission.js'

export default createStore({
    stream: streamReducer,
    permission: permissionReducer
})