// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import Dropzone from 'react-dropzone'
import FontAwesome from 'react-fontawesome'
import {uploadCsvFile} from '../../../../../actions/stream'
import styles from './csvImport.pcss'

type StateProps = {
    stream: ?Stream,
    fileUrl: ?string,
    fetching: boolean
}

type DispatchProps = {
    uploadCsvFile: (streamId: $ElementType<Stream, 'id'>, file: File) => Promise<any>
}

type RouterProps = {
    history: {
        push: (location: string) => void
    }
}

type Props = StateProps & DispatchProps & RouterProps

type State = {}

import type {StreamState} from '../../../../../flowtype/states/stream-state'
import type {Stream} from '../../../../../flowtype/stream-types'

export class CsvImport extends Component<Props, State> {

    onDropAccepted = ([file]: [File]) => {
        this.props.stream && this.props.uploadCsvFile(this.props.stream.id, file)
            .then(() => {})
            .catch(() => {
                if (this.props.fileUrl) {
                    this.props.stream && this.props.history.push(`${this.props.stream.id}/confirmCsvImport`)
                }
            })
    }

    createContent = ({isDragReject}: {isDragReject: boolean}) => {
        return (
            <div className={styles.content}>
                <div className={styles.fileUploadIcon}>
                    {this.props.fetching ? (
                        <FontAwesome
                            name="spinner"
                            pulse
                        />
                    ) : (
                        <FontAwesome
                            name="cloud-upload"
                        />
                    )}
                </div>
                <div className={styles.text}>
                    {
                        (this.props.fetching && 'Uploading file') ||
                        (isDragReject && 'Only .csv files are accepted') ||
                        'Drop a .csv file here to load history'
                    }
                </div>
            </div>
        )
    }

    render() {
        return (
            <Dropzone
                accept="text/csv, text/txt"
                multiple={false}
                className={styles.dropzone}
                onDropAccepted={this.onDropAccepted}
                activeClassName={styles.active}
                acceptClassName={styles.accept}
                rejectClassName={styles.reject}
                disabledClassName={styles.disabled}
                disabled={this.props.fetching}
            >
                {this.createContent}
            </Dropzone>
        )
    }
}

const mapStateToProps = ({stream}: {stream: StreamState}): StateProps => ({
    stream: stream.openStream.id ? stream.byId[stream.openStream.id] : null,
    fetching: stream.csvUpload ? stream.csvUpload.fetching : false,
    fileUrl: stream.csvUpload && stream.csvUpload.fileUrl
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    uploadCsvFile(streamId: $ElementType<Stream, 'id'>, file: File) {
        return dispatch(uploadCsvFile(streamId, file))
    }
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CsvImport))
