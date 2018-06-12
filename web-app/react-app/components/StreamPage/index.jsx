// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Helmet} from 'react-helmet'
import {withRouter} from 'react-router-dom'
import type {Stream} from '../../flowtype/stream-types'

import type {Node} from 'react'
import type {StreamState} from '../../flowtype/states/stream-state'

type GivenProps = {
    children: Node
}

type StateProps = {
    stream: ?Stream
}

type Props = GivenProps & StateProps

type State = {}

export class StreamPage extends Component<Props, State> {
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

export default withRouter(connect(mapStateToProps)(StreamPage))
