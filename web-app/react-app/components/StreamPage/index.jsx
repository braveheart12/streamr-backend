// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Helmet} from 'react-helmet'
import {withRouter} from 'react-router-dom'
import type {Stream} from '../../flowtype/stream-types'
import {getCurrentUser} from '../../actions/user'
import {getMyStreamPermissions, getStream, openStream} from '../../actions/stream'

import type {Node} from 'react'
import type {StreamState} from '../../flowtype/states/stream-state'

type GivenProps = {
    children: Node
}

type StateProps = {
    stream: ?Stream
}

type DispatchProps = {
    getStream: (id: $ElementType<Stream, 'id'>) => void,
    openStream: (id: $ElementType<Stream, 'id'>) => void,
    getMyStreamPermissions: (id: $ElementType<Stream, 'id'>) => void,
    getCurrentUser: () => void
}

type RouterProps = {
    match: {
        params: {
            id: string
        }
    }
}

type Props = GivenProps & StateProps & DispatchProps & RouterProps

type State = {}

export class StreamPage extends Component<Props, State> {

    componentWillReceiveProps(newProps: Props) {
        const id = newProps.match.params.id
        if (!this.props.stream || id !== this.props.stream.id) {
            this.props.getStream(id)
            this.props.openStream(id)
            this.props.getMyStreamPermissions(id)
            this.props.getCurrentUser()
        }
    }

    render() {
        return (
            <div style={{
                width: '100%',
                height: '100%'
            }}>
                <Helmet>
                    <title>{this.props.stream ? this.props.stream.name : ' '}</title>
                </Helmet>
                {this.props.children}
            </div>
        )
    }
}

const mapStateToProps = ({stream}: {stream: StreamState}): StateProps => ({
    stream: stream.openStream.id ? stream.byId[stream.openStream.id] : null
})

const mapDispatchToProps = (dispatch: Function): DispatchProps => ({
    getStream(id: $ElementType<Stream, 'id'>) {
        dispatch(getStream(id))
    },
    openStream(id: $ElementType<Stream, 'id'>) {
        dispatch(openStream(id))
    },
    getMyStreamPermissions(id: $ElementType<Stream, 'id'>) {
        dispatch(getMyStreamPermissions(id))
    },
    getCurrentUser() {
        dispatch(getCurrentUser())
    }
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StreamPage))
