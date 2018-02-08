// @flow

import React from 'react'
import {render} from 'react-dom'
import path from 'path'
import {Provider} from 'react-redux'
import createLink from './helpers/createLink'
import { BrowserRouter, Route } from 'react-router-dom'
import StreamCreateView from './components/StreamPage/StreamCreateView'
import StreamPage from './components/StreamPage'
import StreamShowView from './components/StreamPage/StreamShowView'
import ConfirmCsvImportView from './components/StreamPage/StreamShowView/HistoryView/ConfirmCsvImportView'
import Notifier from './components/StreamrNotifierWrapper'

import store from './stores/streamPageStore.js'

const root = document.getElementById('streamPageRoot')

if (!root) {
    throw new Error('Couldn\'t find element with id streamPageRoot')
}

const basename = createLink('/stream').replace(window.location.origin, '')

render(
    <Provider store={store}>
        <BrowserRouter basename={basename}>
            <div style={{
                width: '100%',
                height: '100%'
            }}>
                <Notifier/>
                <Route path="/create" component={StreamCreateView}/>
                <Route path="/show/:id">
                    <StreamPage>
                        <Route exact path="/show/:id" component={StreamShowView}/>
                        <Route exact path="/show/:id/confirmCsvImport" component={ConfirmCsvImportView}/>
                    </StreamPage>
                </Route>
                {/* This is just a way to make a redirection out of react-router and the whole React app */}
                <Route exact path="/(index)?" component={() => {
                    window.location.assign(path.resolve(basename, 'list'))
                }}/>
            </div>
        </BrowserRouter>
    </Provider>,
    root
)
