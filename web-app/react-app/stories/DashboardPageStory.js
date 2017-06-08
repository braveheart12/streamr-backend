import React from 'react'
import DashboardPage from '../components/DashboardPage'
import moxios from 'moxios'

export default class DashboardPageStory extends React.Component {
    componentWillMount() {
        moxios.install()
        moxios.stubRequest('/api/v1/dashboard', {
            status: 200
        })
    }
    render() {
        return (
            <DashboardPage />
        )
    }
}
