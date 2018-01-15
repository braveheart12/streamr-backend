// @flow

declare var keyId: string

import React, {Component} from 'react'
import {connect} from 'react-redux'
import StreamrClient from 'streamr-client'
import {Panel, Table} from 'react-bootstrap'

import type {Stream, State as ReducerState} from '../../../../flowtype/stream-types'

type Props = {
    stream: Stream
}

type State = {
    visibleData: Array<{}>,
    visibleDataLimit: number,
    savedData: Array<{}>,
    savedDataLimit: number,
    paused: boolean
}

export class PreviewView extends Component<Props, State> {
    client: StreamrClient
    state = {
        visibleData: [],
        visibleDataLimit: 10,
        savedData: [],
        savedDataLimit: 100,
        paused: false
    }
    
    constructor() {
        super()
        this.client = new StreamrClient({
            url: 'ws://127.0.0.1:8890/api/v1/ws',
            authKey: keyId,
            autoconnect: true,
            autoDisconnect: false
        })
    }
    
    componentWillMount() {
        this.client.subscribe(this.props.stream.id, this.onData)
    }
    
    onData = (data: {}) => {
        console.log(data)
    }
    
    render() {
        return (
            <Panel>
                <Panel.Heading>
                    Realtime Data Preview
                </Panel.Heading>
                <Panel.Body>
                    {/*<Table>*/}
                    {/*{this.state.visibleData.map()}*/}
                    {/*</Table>*/}
                </Panel.Body>
            </Panel>
        )
    }
}

const mapStateToProps = ({stream}: { stream: ReducerState }) => ({
    stream: stream.byId[stream.openStream.id]
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(PreviewView)