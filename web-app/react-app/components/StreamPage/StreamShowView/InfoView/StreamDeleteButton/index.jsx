// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import ConfirmButton from '../../../../ConfirmButton'
import createLink from '../../../../../helpers/createLink'

import {deleteStream} from '../../../../../actions/stream'

import type {Node} from 'react'
import type {Stream, State as StreamState} from '../../../../../flowtype/stream-types'

type Props = {
    stream: Stream,
    canWrite: boolean,
    buttonProps: {},
    children?: Node | Array<Node>,
    deleteStream: (id: Stream.id) => Promise<any>,
    className: string
}

export class StreamDeleteButton extends Component<Props> {
    
    static defaultProps = {
        buttonProps: {},
        className: ''
    }
    
    onDelete = () => {
        this.props.deleteStream(this.props.stream.id)
            .then(() => {
                // TODO: change to be handled with react-router
                window.location.assign(createLink('/stream/list'))
            })
    }
    
    render() {
        return (
            <ConfirmButton
                buttonProps={{
                    disabled: !this.props.canWrite || this.props.stream.new,
                    ...this.props.buttonProps
                }}
                className={this.props.className}
                confirmCallback={this.onDelete}
                confirmTitle="Are you sure?"
                confirmMessage={`Are you sure you want to remove stream ${this.props.stream.name}?`}
            >
                {this.props.children}
            </ConfirmButton>
        )
    }
}

export const mapStateToProps = ({stream}: {stream: StreamState}) => ({
    stream: stream.byId[stream.openStream.id]
})

export const mapDispatchToProps = (dispatch: Function) => ({
    deleteStream(id: Stream.id) {
        return dispatch(deleteStream(id))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(StreamDeleteButton)