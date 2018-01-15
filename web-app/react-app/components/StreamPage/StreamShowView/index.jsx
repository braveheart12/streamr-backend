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

import type {Stream, State as ReducerState} from '../../../flowtype/stream-types'

type Props = {
    stream: Stream | {
        name: string
    },
    getStream: (id: Stream.id) => void,
    openStream: (id: Stream.id) => void,
    getMyStreamPermissions: (id: Stream.id) => void,
    match: {
        params: {
            id?: string
        }
    }
}

type State = {}

import styles from './streamShowView.pcss'

export class StreamShowView extends Component<Props, State> {
    static defaultProps = {
        stream: {
            name: ''
        }
    }
    componentWillMount() {
        let id = this.props.match.params.id
        this.props.getStream(id)
        this.props.openStream(id)
        this.props.getMyStreamPermissions(id)
    }
    
    render() {
        return (
            <div className={styles.streamShowView}>
                <Helmet>
                    <title>{this.props.stream.name || ' '}</title>
                </Helmet>
                <StreamrBreadcrumb style={{
                    margin: '-18px -18px 18px'
                }}>
                    <StreamrBreadcrumbItem href={createLink('stream/list')}>
                        Streams
                    </StreamrBreadcrumbItem>
                    <StreamrBreadcrumbItem active={true}>
                        {this.props.stream.name}
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

const mapStateToProps = ({stream}: {stream: ReducerState}) => ({
    stream: stream.byId[stream.openStream.id]
})

const mapDispatchToProps = (dispatch: Function) => ({
    getStream(id: Stream.id) {
        dispatch(getStream(id))
    },
    openStream(id: Stream.id) {
        dispatch(openStream(id))
    },
    getMyStreamPermissions(id: Stream.id) {
        dispatch(getMyStreamPermissions(id))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(StreamShowView)