// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Panel, FormGroup, ControlLabel} from 'react-bootstrap'
import {DropdownButton, MenuItem, Button, FormControl} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import serialize from 'form-serialize'

import {updateStream} from '../../../../actions/stream'

import type {Stream, State as ReducerState} from '../../../../flowtype/stream-types'

type Props = {
    stream: Stream,
    updateStream: (stream: Stream) => Promise<Stream>
}

type State = {
    editing: boolean
}

import styles from './infoView.pcss'

export class InfoView extends Component<Props, State> {
    static defaultProps = {
        stream: {
            name: ''
        }
    }
    
    state = {
        editing: false
    }
    
    startEdit = () => {
        this.setState({
            editing: true
        })
    }
    
    stopEdit = () => {
        this.setState({
            editing: false
        })
    }
    
    save = () => {
        this.props.updateStream()
    }
    
    onSubmit = (e: Event) => {
        e.preventDefault()
        const form = serialize(e.target, {
            hash: true
        })
        this.props.updateStream({
            ...this.props.stream,
            ...form
        })
            .then(this.stopEdit)
    }
    
    render() {
        const id = `form${Date.now()}`
        return (
            <Panel>
                <Panel.Heading>
                    Stream: {this.props.stream.name}
                    {this.state.editing ? (
                        <div className="panel-heading-controls">
                            <Button bsSize="sm" form={id} bsStyle="primary" type="submit">Save</Button>
                            <Button bsSize="sm" onClick={this.stopEdit}>Cancel</Button>
                        </div>
                    ) : (
                        <div className="panel-heading-controls">
                            <DropdownButton
                                bsSize="sm"
                                onClick={this.startEdit}
                                title={<FontAwesome name="bars"/>}
                                id="edit-dropdown"
                                noCaret
                            >
                                <MenuItem>
                                    <FontAwesome name="pencil"/>{' '}Edit
                                </MenuItem>
                                <MenuItem>
                                    <FontAwesome name="user"/>{' '}Share
                                </MenuItem>
                                <MenuItem>
                                    <FontAwesome name="trash-o"/>{' '}Delete
                                </MenuItem>
                            </DropdownButton>
                        </div>
                    )}
                </Panel.Heading>
                <Panel.Body>
                    {this.state.editing ? (
                        <form onSubmit={this.onSubmit} id={id}>
                            <FormGroup>
                                <ControlLabel>Name</ControlLabel>
                                <FormControl
                                    name="name"
                                    defaultValue={this.props.stream.name}
                                />
                            </FormGroup>
                            <FormGroup>
                                <ControlLabel>Description</ControlLabel>
                                <FormControl
                                    className={styles.descriptionTextarea}
                                    name="description"
                                    defaultValue={this.props.stream.description}
                                    componentClass="textarea"
                                />
                            </FormGroup>
                        </form>
                    ) : (
                        <form>
                            <FormGroup>
                                <ControlLabel>Name</ControlLabel>
                                <div>{this.props.stream.name}</div>
                            </FormGroup>
                            <FormGroup>
                                <ControlLabel>Description</ControlLabel>
                                <div>{this.props.stream.description}</div>
                            </FormGroup>
                        </form>
                    )}
                </Panel.Body>
            </Panel>
        )
    }
}

const mapStateToProps = ({stream}: {stream: ReducerState}) => ({
    stream: stream.byId[stream.openStream.id]
})

const mapDispatchToProps = (dispatch) => ({
    updateStream(stream: Stream) {
        return dispatch(updateStream(stream))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(InfoView)