// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Panel, Table, Button, FormControl, Alert} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import {saveFields} from '../../../../actions/stream'
import {showError} from '../../../../actions/notification'

import type {Stream, State as ReducerState} from '../../../../flowtype/stream-types'

type Props = {
    stream: Stream,
    showError: (error: {title: string}) => void,
    saveFields: (id: Stream.id, fields: Stream.config.fields) => Promise<Stream.config.fields>
}

type State = {
    editing: boolean,
    fields: Stream.config.fields,
    savedFields: Stream.config.fields,
    newField: {
        name?: string,
        type?: string
    }
}

import styles from './fieldView.pcss'

export class FieldView extends Component<Props, State> {
    static defaultProps = {
        stream: {
            name: ''
        }
    }
    state = {
        editing: false,
        newField: {},
        fields: [],
        savedFields: []
    }
    
    componentWillReceiveProps(props: Props) {
        this.setState({
            fields: props.stream && props.stream.config && props.stream.config.fields && props.stream.config.fields || []
        })
    }
    
    startEditing = () => {
        this.setState({
            editing: true,
            savedFields: this.state.fields
        })
    }
    
    save = () => {
        this.props.saveFields(this.props.stream.id, this.state.fields)
            .then(() => {
                this.setState({
                    editing: false,
                    savedFields: this.state.fields
                })
            })
    }
    
    cancelEditing = () => {
        this.setState({
            editing: false,
            fields: this.state.savedFields
        })
    }
    
    addNewField = () => {
        this.setState({
            fields: [...this.state.fields, this.state.newField],
            newField: {}
        })
    }
    
    removeField = (i: number) => {
        const fields = [...this.state.fields]
        fields.splice(i, 1)
        this.setState({
            fields
        })
    }
    
    editField = (i: number, fieldOfField: string, newValue: string) => {
        const fields = [...this.state.fields]
        fields[i] = {
            ...fields[i],
            [fieldOfField]: newValue
        }
        this.setState({
            fields
        })
    }
    
    editNewField = (fieldOfField: string, value: string) => {
        this.setState({
            newField: {
                ...this.state.newField,
                [fieldOfField]: value
            }
        })
    }
    
    render() {
        return (
            <Panel className={styles.fieldView}>
                <Panel.Heading>
                    Fields
                    {this.state.editing ? (
                        <div className="panel-heading-controls">
                            <Button bsSize="sm" onClick={this.save} bsStyle="primary">Save</Button>
                            <Button bsSize="sm" onClick={this.cancelEditing}>Cancel</Button>
                        </div>
                    
                    ) : (
                        <div className="panel-heading-controls">
                            <Button bsSize="sm" onClick={this.startEditing}>Configure Fields</Button>
                        </div>
                    )}
                </Panel.Heading>
                <Panel.Body>
                    {(this.state.fields.length || this.state.editing) ? (
                        <Table striped condensed hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    {this.state.editing && <th/>}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.fields.map(({name, type}: {name: string, type: string}, i: number) => this.state.editing ? (
                                    <tr key={i}>
                                        <td>
                                            <FormControl
                                                bsSize="sm"
                                                value={name}
                                                onChange={(e) => {
                                                    this.editField(i, 'name', e.target.value)
                                                }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        this.addNewField()
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <FormControl
                                                componentClass="select"
                                                placeholder="select"
                                                bsSize="sm"
                                                value={type}
                                                onChange={(e) => {
                                                    this.editField(i, 'type', e.target.value)
                                                }}
                                            >
                                                <option value="number">number</option>
                                                <option value="string">string</option>
                                                <option value="boolean">boolean</option>
                                                <option value="map">map</option>
                                                <option value="list">list</option>
                                            </FormControl>
                                        </td>
                                        <td style={{
                                            width: 0
                                        }}>
                                            <Button bsSize="sm" bsStyle="danger" onClick={() => this.removeField(i)}>
                                                <FontAwesome name="minus"/>
                                            </Button>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={name}>
                                        <td>{name}</td>
                                        <td>{type}</td>
                                    </tr>
                                ))}
                                {this.state.editing && (
                                    <tr className={styles.newFieldRow}>
                                        <td>
                                            <FormControl
                                                value={this.state.newField.name || ''}
                                                bsSize="sm"
                                                onChange={(e) => {
                                                    this.editNewField('name', e.target.value)
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <FormControl
                                                componentClass="select"
                                                placeholder="select"
                                                bsSize="sm"
                                                value={this.state.newField.type || ''}
                                                onChange={(e) => {
                                                    this.editNewField('type', e.target.value)
                                                }}
                                            >
                                                <option value="number">number</option>
                                                <option value="string">string</option>
                                                <option value="boolean">boolean</option>
                                                <option value="map">map</option>
                                                <option value="list">list</option>
                                            </FormControl>
                                        </td>
                                        <td style={{
                                            width: 0
                                        }}>
                                            <Button bsSize="sm" bsStyle="success" onClick={this.addNewField}>
                                                <FontAwesome name="plus"/>
                                            </Button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert>
                            <FontAwesome name="exclamation-mark"/>
                            The fields for this stream are not yet configured. Click the button above to configure them.
                        </Alert>
                    )}
                </Panel.Body>
            </Panel>
        )
    }
}

const mapStateToProps = ({stream}: { stream: ReducerState }) => ({
    stream: stream.byId[stream.openStream.id]
})

const mapDispatchToProps = (dispatch) => ({
    showError(error: {title: string}) {
        dispatch(showError(error))
    },
    saveFields(id: Stream.id, fields: Stream.config.fields) {
        return dispatch(saveFields(id, fields))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(FieldView)