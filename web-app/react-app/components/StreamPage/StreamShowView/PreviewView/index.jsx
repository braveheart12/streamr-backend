// @flow

declare var keyId: string

import React, {Component} from 'react'
import {connect} from 'react-redux'
import StreamrClient from 'streamr-client'
import {Panel, Table, Modal} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import moment from 'moment-timezone'
import {default as stringifyObject} from 'stringify-object'

import type {Stream, State as ReducerState} from '../../../../flowtype/stream-types'
import type {User, State as UserReducerState} from '../../../../flowtype/user-types'

import styles from './previewView.pcss'

type DataPoint = {
    data: {},
    metadata: {
        timestamp: number
    }
}
type Props = {
    stream: Stream,
    currentUser: User
}

type State = {
    visibleData: Array<DataPoint>,
    visibleDataLimit: number,
    paused: boolean,
    infoScreenMessage: ?DataPoint
}

export class PreviewView extends Component<Props, State> {
    client: StreamrClient
    subscription: any
    state = {
        visibleData: [],
        visibleDataLimit: 10,
        paused: false,
        infoScreenMessage: null
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
    
    componentWillReceiveProps(newProps: Props) {
        if (newProps.stream && newProps.stream.id && !this.subscription) {
            this.subscription = this.client.subscribe({
                stream: newProps.stream.id,
                resend_last: this.state.visibleDataLimit
            }, (data, metadata) => this.onData({
                data,
                metadata
            }))
        }
    }
    
    onData = (dataPoint: DataPoint) => {
        this.setState({
            visibleData: [
                dataPoint,
                ...this.state.visibleData
            ].slice(0, this.state.visibleDataLimit)
        })
    }
    
    openInfoScreen = (d: DataPoint) => {
        this.setState({
            infoScreenMessage: d
        })
    }
    
    closeInfoScreen = () => {
        this.setState({
            infoScreenMessage: null
        })
    }
    
    static prettyPrintData = (data: ?{}) => {
        return stringifyObject(data, {
            indent: '  ',
            inlineCharacterLimit: 1
        })
    }
    
    static prettyPrintDate = (timestamp: ?number, timezone: ?string) => timestamp && moment.tz(timestamp, timezone).format()
    
    render() {
        const tz = this.props.currentUser.timezone || moment.tz.guess()
        return (
            <Panel>
                <Panel.Heading>
                    Realtime Data Preview
                </Panel.Heading>
                <Panel.Body>
                    <Table className={styles.dataTable} striped condensed hover>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Message JSON</th>
                                <th/>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.visibleData.map(d => (
                                <tr key={JSON.stringify(d.metadata)}>
                                    <td>
                                        {PreviewView.prettyPrintDate(d.metadata && d.metadata.timestamp, tz)}
                                    </td>
                                    <td className={styles.messageColumn}>
                                        {JSON.stringify(d.data)}
                                    </td>
                                    <td>
                                        <a href="#" onClick={() => this.openInfoScreen(d)}>
                                            <FontAwesome name="question-circle"/>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Panel.Body>
                <Modal
                    show={this.state.infoScreenMessage != null}
                    onHide={this.closeInfoScreen}
                >
                    <Modal.Header>
                        Info about data point
                    </Modal.Header>
                    <Modal.Body>
                        <Table className={styles.infoScreenModalTable}>
                            <tbody>
                                <tr>
                                    <th>Stream id</th>
                                    <td>{this.props.stream && this.props.stream.id}</td>
                                </tr>
                                <tr>
                                    <th>Message Timestamp</th>
                                    <td>{PreviewView.prettyPrintDate(this.state.infoScreenMessage && this.state.infoScreenMessage.metadata && this.state.infoScreenMessage.metadata.timestamp, tz)}</td>
                                </tr>
                                <tr>
                                    <th>
                                        Data
                                    </th>
                                    <td className={styles.dataColumn}>
                                        <code>
                                            {PreviewView.prettyPrintData(this.state.infoScreenMessage && this.state.infoScreenMessage.data)}
                                        </code>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>
            </Panel>
        )
    }
}

const mapStateToProps = ({stream, user}: {stream: ReducerState, user: UserReducerState}) => ({
    stream: stream.byId[stream.openStream.id],
    currentUser: user.currentUser
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(PreviewView)