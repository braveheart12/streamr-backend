// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import Dropzone from 'react-dropzone'

import styles from './csvImportView.pcss'

type Props = {}

type State = {}

export class CSVImportView extends Component<Props, State> {
    render() {
        return (
            <div>
                <Dropzone
                    className={styles.dropzone}
                    activeClassName={styles.active}
                    rejectClassName={styles.reject}
                >
                    <p>Try dropping some files here, or click to select files to upload.</p>
                </Dropzone>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(CSVImportView)