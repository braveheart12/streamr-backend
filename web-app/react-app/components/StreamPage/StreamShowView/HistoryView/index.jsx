// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Col, Panel} from 'react-bootstrap'
import {CSVImportView} from './CSVImportView'

type Props = {}

type State = {}

export class HistoryView extends Component<Props, State> {
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
                        <CSVImportView/>
                    </Col>
                </Panel.Body>
            </Panel>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(HistoryView)