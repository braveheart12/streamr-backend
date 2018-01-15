// @flow

declare var Streamr: any
declare var StreamrCredentialsControl: any

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Panel} from 'react-bootstrap'

import type {Stream, State as ReducerState} from '../../../../flowtype/stream-types'

type Props = {
    streamId: Stream.id
}

export class KeyView extends Component<Props> {
    
    apiHandlerEl: ?HTMLDivElement // Typechecking may not work correctly but without this line it does not work at all
    
    componentDidMount() {
        new StreamrCredentialsControl({
            el: this.apiHandlerEl,
            url: Streamr.createLink({
                uri: `api/v1/streams/${this.props.streamId}/keys`
            }),
            streamId: this.props.streamId,
            showPermissions: true
        })
    }
    
    render() {
        return (
            <Panel>
                <Panel.Heading>
                    API Credentials
                </Panel.Heading>
                <Panel.Body>
                    <div ref={item => this.apiHandlerEl = item} className="credentials-control row"/>
                </Panel.Body>
            </Panel>
        )
    }
}

export const mapStateToProps = ({stream}: {stream: ReducerState}) => ({
    streamId: stream.openStream.id
})

export default connect(mapStateToProps)(KeyView)