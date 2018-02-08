// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {Col, Panel} from 'react-bootstrap'
import Dropzone from 'react-dropzone'
import FontAwesome from 'react-fontawesome'
import {uploadCsvFile} from '../../../../actions/stream'

type StateProps = {
    stream: ?Stream
}

type DispatchProps = {
    uploadCsvFile: (streamId: $ElementType<Stream, 'id'>, file: File) => Promise<any>
}

type RouterProps = {
    history: {
        push: (location: string, data: {}) => void
    }
}

type Props = StateProps & DispatchProps & RouterProps

type State = {}

import styles from './historyView.pcss'
import type {StreamState} from '../../../../flowtype/states/stream-state'
import type {Stream} from '../../../../flowtype/stream-types'
import type {ErrorInUi} from '../../../../flowtype/common-types'

export class HistoryView extends Component<Props, State> {

    onDropAccepted = ([file]: [File]) => {
        if (this.props.stream) {
            this.props.uploadCsvFile(this.props.stream.id, file)
                .then(() => {})
                .catch((e: ErrorInUi) => {
                    this.props.stream && this.props.history.push(`/show/${this.props.stream.id}/confirmCsvImport`, e.data || {})
                })
        }
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
            <Panel>
                <Panel.Heading>
                    History
                </Panel.Heading>
                <Panel.Body>
                    <Col md={6}>
                        This stream has data....
                        <input/>faslfjsadöf
                        fsalfkjasödflk
                        fajldfkjölkdfdfjl
                    </Col>
                    <Col md={6}>
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
                    </Col>
                </Panel.Body>
            </Panel>
        )
    }
}

const mapStateToProps = ({stream}: {stream: StreamState}): StateProps => ({
    stream: stream.openStream.id ? stream.byId[stream.openStream.id] : null,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    uploadCsvFile(streamId: $ElementType<Stream, 'id'>, file: File) {
        return dispatch(uploadCsvFile(streamId, file))
    }
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HistoryView))
