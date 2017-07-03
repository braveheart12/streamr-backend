// @flow

import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'

import Router from './routers/dashboardPageRouter'
import store from './stores/dashboardPageStore.js'

render(
    <Provider store={store}>
        <Router/>
    </Provider>,
    document.getElementById('dashboardPageRoot')
)