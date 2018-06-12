// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Row, Col} from 'react-bootstrap'
import {StreamrBreadcrumb, StreamrBreadcrumbItem} from '../../Breadcrumb'
import createLink from '../../../helpers/createLink'
import {getCurrentUser} from '../../../actions/user'
import {getMyStreamPermissions, getStream, openStream} from '../../../actions/stream'

import InfoView from './InfoView'
import KeyView from './KeyView'
import FieldView from './FieldView'
import PreviewView from './PreviewView'
import HistoryView from './HistoryView'

import type {Stream} from '../../../flowtype/stream-types'
import type {StreamState} from '../../../flowtype/states/stream-state'

type StateProps = {
    stream: ?Stream
}

type DispatchProps = {
    getStream: (id: $ElementType<Stream, 'id'>) => void,
    openStream: (id: $ElementType<Stream, 'id'>) => void,
    getMyStreamPermissions: (id: $ElementType<Stream, 'id'>) => void,
    getCurrentUser: () => void
}

type RouterProps = {
    match: {
        params: {
            id: string
        }
    }
}

type Props = StateProps & DispatchProps & RouterProps

import styles from './streamShowView.pcss'

export class StreamShowView extends Component<Props> {

    componentDidMount() {
        const id = this.props.match.params.id
        this.props.getCurrentUser()
        this.updateStream(id)
    }

    componentWillReceiveProps(newProps: Props) {
        const id = newProps.match.params.id
        if (!this.props.stream || id !== this.props.stream.id) {
            this.props.getCurrentUser()
            this.updateStream(id)
        }
    }

    updateStream = (id: $ElementType<Stream, 'id'>) => {
        this.props.getStream(id)
        this.props.openStream(id)
        this.props.getMyStreamPermissions(id)
    }

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

const mapDispatchToProps = (dispatch: Function): DispatchProps => ({
    getStream(id: $ElementType<Stream, 'id'>) {
        dispatch(getStream(id))
    },
    openStream(id: $ElementType<Stream, 'id'>) {
        dispatch(openStream(id))
    },
    getMyStreamPermissions(id: $ElementType<Stream, 'id'>) {
        dispatch(getMyStreamPermissions(id))
    },
    getCurrentUser() {
        dispatch(getCurrentUser())
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(StreamShowView)
