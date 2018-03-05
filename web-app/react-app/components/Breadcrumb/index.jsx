// @flow

import React, {Component} from 'react'
import {Breadcrumb, DropdownButton} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import {Link} from 'react-router-dom'
import _ from 'lodash'

import type {Node} from 'react'

type Children = string | Node | Array<Node>

import styles from './breadcrumb.pcss'

export class StreamrBreadcrumb extends Component<{
    children?: Children,
    style?: {}
}> {
    render() {
        return (
            <Breadcrumb style={this.props.style} className={styles.breadcrumb}>
                {this.props.children}
            </Breadcrumb>
        )
    }
}

export class StreamrBreadcrumbItem extends Component<{
    href?: string,
    to?: string,
    active?: boolean,
    children?: Children
}> {
    render() {
        return (
            <li {...(_.omit(this.props, 'active', 'children', 'to', 'href'))}>
                {
                    (this.props.active && (
                        <span>
                            {this.props.children}
                        </span>
                    )) || (this.props.to && (
                        <Link to={this.props.to}>
                            {this.props.children}
                        </Link>
                    )) || (
                        <a href={this.props.href}>
                            {this.props.children}
                        </a>
                    )
                }
            </li>
        )
    }
}

export class StreamrBreadcrumbDropdownButton extends Component<{
    className?: string,
    children?: Children
}> {
    render() {
        return (
            <div className={styles.streamrDropdownContainer}>
                <DropdownButton
                    id={`streamrDropdownButton-${Date.now()}`}
                    {...this.props}
                    bsSize="xs"
                    className={`${this.props.className || ''} ${styles.streamrDropdownButton}`}
                >
                    {this.props.children}
                </DropdownButton>
            </div>
        )
    }
}

export class StreamrBreadcrumbToolbar extends Component<{
    children?: Children
}> {
    render() {
        return (
            <div className={styles.toolbar}>
                {this.props.children}
            </div>
        )
    }
}

export class StreamrBreadcrumbToolbarButton extends Component<{
    iconName: string,
    onClick: Function
}> {
    render() {
        return (
            <div className={styles.button} onClick={this.props.onClick}>
                <FontAwesome name={this.props.iconName}/>
            </div>
        )
    }
}
