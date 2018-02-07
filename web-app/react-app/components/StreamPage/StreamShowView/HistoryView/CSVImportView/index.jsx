// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import Dropzone from 'react-dropzone'
import Papa from 'papaparse'
import {Checkbox, ControlLabel, Form, FormControl, FormGroup, Table} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import Select from 'react-select'
import {StreamrBreadcrumb, StreamrBreadcrumbItem} from '../../../../Breadcrumb'

import styles from './csvImportView.pcss'
import createLink from '../../../../../helpers/createLink'

import type {Stream} from '../../../../../flowtype/stream-types'
import type {StreamState} from '../../../../../flowtype/states/stream-state'

const config = require('../../../streamConfig')

type CSVSchema = {
    timestampField: ?number,
    timestampFormat: ?string,
    fields: Array<{
        name: string,
        type: ?typeof config.fieldTypes
    }>
}

type StateProps = {
    stream: ?Stream
}

type Props = StateProps & {}

type State = {
    file: ?File,
    parsedFile: ?Array<{}>,
    parsedRowsAmount: number,
    schema: CSVSchema
}

export class CSVImportView extends Component<Props, State> {

    state = {
        file: null,
        parsedFile: null,
        parsedRowsAmount: 30,
        schema: {
            timestampField: null,
            timestampFormat: null,
            fields: []
        }
    }

    onDropAccepted = ([file]: [File]) => {
        Papa.parse(file, {
            header: true,
            preview: this.state.parsedRowsAmount,
            complete: (results, file) => {
                this.setState({
                    file,
                    parsedFile: results.data,
                    schema: this.readSchema(results)
                })
            }
        })
    }

    guessType = (field: string, rows: Array<{}>) => {
        const possibleFieldTypes = {}
    }

    readSchema = ({data, meta}: {data: Array<{}>, meta: {fields: Array<string>}}) => {
        const fields = meta.fields.map(f => ({
            name: f,
            type: this.guessType(f, data)
        }))
    }

    createContent = ({isDragReject}: {isDragReject: boolean}) => {
        return (
            <div className={styles.content}>
                <div className={styles.fileUploadIcon}>
                    <FontAwesome
                        name="cloud-upload"
                    />
                </div>
                <div className={styles.text}>
                    {(isDragReject && 'Only .csv and .txt files are accepted') || 'Drop a .csv file here to load history'}
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className={styles.csvImportView}>
                <StreamrBreadcrumb style={{
                    margin: '-18px -18px 18px'
                }}>
                    <StreamrBreadcrumbItem href={createLink('stream/list')}>
                        Streams
                    </StreamrBreadcrumbItem>
                    <StreamrBreadcrumbItem to={createLink(`stream/${this.props.stream ? this.props.stream.id : ' '}`)}>
                        {this.props.stream ? this.props.stream.name : ''}
                    </StreamrBreadcrumbItem>
                    <StreamrBreadcrumbItem active>
                        Import CSV Data
                    </StreamrBreadcrumbItem>
                </StreamrBreadcrumb>
                {this.state.parsedFile ? (
                    <div>
                        <Form inline>
                            <Checkbox inline name="headerRow">
                                Header Row
                            </Checkbox>
                        </Form>
                        <Table>
                            {this.state.fields.length && (
                                <thead>
                                    <tr>
                                        {this.state.fields.map((f, i) => (
                                            <th key={i}>
                                                {f.name}
                                                <Select
                                                    value={f.type || config.fieldTypes[0]}
                                                    options={config.fieldTypes.map(ft => ({
                                                        value: ft,
                                                        label: ft
                                                    }))}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                            )}
                            <tbody>
                                {this.state.parsedFile && this.state.parsedFile.map((row, i) => (
                                    <tr key={i}>
                                        {this.state.fields.map((f, j) => (
                                            <td key={j}>
                                                {row[f.name]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <Dropzone
                        accept="text/csv, text/txt"
                        multiple={false}
                        className={styles.dropzone}
                        onDropAccepted={this.onDropAccepted}
                        activeClassName={styles.active}
                        acceptClassName={styles.accept}
                        rejectClassName={styles.reject}
                    >
                        {this.createContent}
                    </Dropzone>
                )}
            </div>
        )
    }
}

const mapStateToProps = ({stream}: {stream: StreamState}): StateProps => ({
    stream: stream.openStream.id ? stream.byId[stream.openStream.id] : null
})

export default connect(mapStateToProps)(CSVImportView)