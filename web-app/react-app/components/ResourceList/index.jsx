// @flow

import React, {Component} from 'react'
import {Row, Panel, Table} from 'react-bootstrap'
import {ClickableTr, ClickableTd} from '../ClickableTable'

export default class ResourceList extends Component {
    
    props: {
        title: string,
        items: Array<{
            href: string
        }>,
        fields: Array<string | {
            name: string,
            displayName: string
        }>,
        mapItemToResource: (item: {}) => {
            href: string,
            [string]: any
        }
    }
    
    static defaultProps = {
        mapItemToResource: (item: {
            href: string
        }) => item
    }
    
    render() {
        return (
            <Row>
                <Panel header={this.props.title}>
                    <Table striped hover bordered>
                        <thead>
                            <tr>
                                {this.props.fields.map(field => (
                                    <th>
                                        {field.displayName || field}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                        {this.props.items.map(item => {
                            const resource = this.props.mapItemToResource(item)
                            return (
                                <ClickableTr href={item.href}>
                                    {this.props.fields.map(field => (
                                        <ClickableTd>
                                            resource[field]
                                        </ClickableTd>
                                    ))}
                                </ClickableTr>
                            )
                        })}
                        </tbody>
                    </Table>
                </Panel>
            </Row>
        )
    }
}