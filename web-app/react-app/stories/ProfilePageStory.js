import React from 'react'
import ProfilePage from '../components/ProfilePage'
import profilePageStore from '../stores/profilePageStore'
import {Provider} from 'react-redux'
import moxios from 'moxios'

export default class Welcome extends React.Component {
    componentWillMount() {
        moxios.install()
        moxios.stubRequest('/api/v1/integrationkeys', {
            status: 200
        })
    }
    render() {
        return (
            <Provider store={profilePageStore}>
                <ProfilePage />
            </Provider>
        )
    }
}
