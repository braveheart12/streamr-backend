
import React from 'react'
import { createStore, applyMiddleware } from 'redux'
import {storiesOf} from '@storybook/react'
import rootReducer from '../reducers'
import {Provider} from 'react-redux'

import thunkMiddleware from 'redux-thunk'
import reduxLogger from 'redux-logger'

//import {action} from '@storybook/addon-actions'
//import {linkTo} from '@storybook/addon-links'
//import addonAPI from '@storybook/addons'
//import Welcome from './WelcomeStory'
//import ProfilePageStory from './ProfilePageStory'
import ShareDialogStory from './ShareDialogStory'

global.Streamr = {
    createLink: ({uri}) => uri,
    showSuccess: (title, message) => alert(`Success! ${title} ${message}`),
    showError: (title, message) => alert(`Error! ${title} ${message}`)
}
global.StreamrCredentialsControl = function() {}

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware, reduxLogger))

const reduxDecorator = getStory => (
    <Provider store={store}>
        { getStory() }
    </Provider>
)

//storiesOf('Welcome', module)
//    .add('to Storybook', () => <Welcome showApp={linkTo('Button')}/>)

//storiesOf('ProfilePage', module)
//    .add('Whole Page', () => (
//        <ProfilePageStory/>
//    ))

storiesOf('ShareDialog', module)
    .addDecorator(reduxDecorator)
    .add('all', () => (
        <ShareDialogStory />
    ))
