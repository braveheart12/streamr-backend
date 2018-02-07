// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {StreamrBreadcrumb, StreamrBreadcrumbItem} from '../../Breadcrumb'
import createLink from '../../../helpers/createLink'
import {Row, Col} from 'react-bootstrap'
import InfoView from './InfoView'
import KeyView from './KeyView'
import FieldView from './FieldView'
import PreviewView from './PreviewView'
import HistoryView from './HistoryView'

import {getStream, openStream, getMyStreamPermissions} from '../../../actions/stream'
import {getCurrentUser} from '../../../actions/user'

import type {Stream} from '../../../flowtype/stream-types'
import type {StreamState} from '../../../flowtype/states/stream-state'

type StateProps = {
    stream: ?Stream
}

type Props = StateProps

import styles from './streamShowView.pcss'

export class StreamShowView extends Component<Props> {

    render() {
        return (
            <div className={styles.streamShowView}>
                <StreamrBreadcrumb style={{
                    margin: '-18px -18px 18px'
                }}>
                    <StreamrBreadcrumbItem href={createLink('stream/list')}>
                        Streams
                    </StreamrBreadcrumbItem>
                    <StreamrBreadcrumbItem active={true}>
                        {this.props.stream ? this.props.stream.name : ''}
                    </StreamrBreadcrumbItem>
                </StreamrBreadcrumb>
                <Row>
                    <Col sm={6} md={4}>
                        <InfoView/>
                    </Col>
                    <Col sm={6} md={4}>
                        <KeyView/>
                    </Col>
                    <Col sm={6} md={4}>
                        <FieldView/>
                    </Col>
                </Row>
                <Row>
                    <Col sm={6}>
                        <PreviewView/>
                    </Col>
                    <Col sm={6}>
                        <HistoryView/>
                    </Col>
                </Row>
            </div>
        )
    }
}

const mapStateToProps = ({stream}: {stream: StreamState}): StateProps => ({
    stream: stream.openStream.id ? stream.byId[stream.openStream.id] : null
})

export default connect(mapStateToProps)(StreamShowView)
