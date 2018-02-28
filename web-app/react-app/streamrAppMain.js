// @flow

import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import StreamrApp from './components/StreamrApp'

import store from './stores/profilePageStore.js'

const id = 'streamrAppRoot'

const root = document.getElementById(id)

if (!root) {
    throw new Error(`Couldn't find element with id ${id}`)
}

render(
    <Provider store={store}>
        <StreamrApp/>
    </Provider>,
    root
)
