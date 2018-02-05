// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {StreamrBreadcrumb, StreamrBreadcrumbItem} from '../../Breadcrumb'
import createLink from '../../../helpers/createLink'
import {Helmet} from 'react-helmet'
import {Row, Col} from 'react-bootstrap'
import InfoView from './InfoView'
import KeyView from './KeyView'
import FieldView from './FieldView'
import PreviewView from './PreviewView'

import {getStream, openStream, getMyStreamPermissions} from '../../../actions/stream'
import {getCurrentUser} from '../../../actions/user'

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
    
    componentWillMount() {
        const id = this.props.match.params.id
        this.props.getStream(id)
        this.props.openStream(id)
        this.props.getMyStreamPermissions(id)
        this.props.getCurrentUser()
    }
    
    render() {
        return (
            <div className={styles.streamShowView}>
                <Helmet>
                    <title>{this.props.stream ? this.props.stream.name : ' '}</title>
                </Helmet>
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
                    <Col sm={6}>
                        <PreviewView/>
                    </Col>
                    <Col sm={6}>
                    
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
