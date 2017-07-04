// @flow

import React, {Component} from 'react'
import {Row, Col, Panel, Table, DropdownButton, MenuItem} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

import ShareDialog from '../ShareDialog'
import {ClickableTr, ClickableTd} from '../ClickableTable'

import styles from './resourceList.pcss'

import type {Permission} from '../../flowtype/permission-types'

type Item = {
    id: Permission.resourceId,
    name?: string,
    href?: string,
    to?: string
}

export default class ResourceList extends Component {
    
    props: {
        title: string,
        items: Array<Item>,
        fields: Array<string | {
            name: string,
            displayName: string
        }>,
        mapItemToResource: (item: Item) => Item,
        resourceType: Permission.resourceType
    }
    
    static defaultProps = {
        mapItemToResource: (item: Item): Item => ({
            ...item
        })
    }
    
    render() {
        return (
            <Row>
                <Col xs={12}>
                    <Panel header={this.props.title}>
                        <Table className={styles.resourceTable} striped hover bordered condensed>
                            <thead>
                                <tr>
                                    {this.props.fields.map(field => (
                                        <th key={JSON.stringify(field)}>
                                            {field.displayName || field}
                                        </th>
                                    ))}
                                    <th/>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.items.map(item => {
                                    const resource: Object = this.props.mapItemToResource(item)
                                    return (
                                        <ClickableTr href={item.href} to={item.to} key={item.id}>
                                            {this.props.fields.map(field => (
                                                <ClickableTd key={JSON.stringify(field)}>
                                                    {resource[field.name || field]}
                                                </ClickableTd>
                                            ))}
                                            <td>
                                                <DropdownButton title="" pullRight id={`dropdown-for-${item.id}`}>
                                                    <ShareDialog
                                                        resourceId={item.id}
                                                        resourceType={this.props.resourceType}
                                                        resourceTitle={item.name || item.id}
                                                    >
                                                        <MenuItem>
                                                            Share
                                                        </MenuItem>
                                                    </ShareDialog>
                                                    <MenuItem>
                                                        Delete
                                                    </MenuItem>
                                                </DropdownButton>
                                            </td>
                                        </ClickableTr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </Panel>
                </Col>
            </Row>
        )
    }
}