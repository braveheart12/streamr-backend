
import React from 'react'
import {storiesOf} from '@storybook/react'
import {action} from '@storybook/addon-actions'
import {linkTo} from '@storybook/addon-links'
import addonAPI from '@storybook/addons'
import Welcome from './WelcomeStory'
import ProfilePageStory from './ProfilePageStory'

global.Streamr = {
    createLink: ({uri}) => uri,
    showSuccess: (title, message) => alert(`Success! ${title} ${message}`),
    showError: (title, message) => alert(`Error! ${title} ${message}`)
}
global.StreamrCredentialsControl = function() {}

storiesOf('Welcome', module)
    .add('to Storybook', () => <Welcome showApp={linkTo('Button')}/>)

storiesOf('ProfilePage', module)
    .add('Whole Page', () => (
        <ProfilePageStory/>
    ))
