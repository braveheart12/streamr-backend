// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Panel, FormGroup, ControlLabel} from 'react-bootstrap'

import type {Stream, State as ReducerState} from '../../../../flowtype/stream-types'

type Props = {
    stream: Stream
}

export class InfoView extends Component<Props> {
    static defaultProps = {
        stream: {
            name: ''
        }
    }
    
    render() {
        return (
            <Panel>
                <Panel.Heading>
                    Stream: {this.props.stream.name}
                </Panel.Heading>
                <Panel.Body>
                    <FormGroup>
                        <ControlLabel>Name</ControlLabel>
                        <div>{this.props.stream.name}</div>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Description</ControlLabel>
                        <div>{this.props.stream.description}</div>
                    </FormGroup>
                </Panel.Body>
            </Panel>
        )
    }
}

const mapStateToProps = ({stream}: {stream: ReducerState}) => ({
    stream: stream.byId[stream.openStream.id]
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(InfoView)