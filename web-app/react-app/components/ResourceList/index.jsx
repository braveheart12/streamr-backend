// @flow

import React, {Component} from 'react'
import {
    Row, Col, Panel, Table, DropdownButton, MenuItem, InputGroup, Button
} from 'react-bootstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import FontAwesome from 'react-fontawesome'
import Select from 'react-select'

import ShareDialog from '../ShareDialog'
import {ClickableTr, ClickableTd} from '../ClickableTable'

import 'react-select/dist/react-select.css'
import styles from './resourceList.pcss'

import type {CommonResource} from '../../flowtype/resource-types'

type Item = CommonResource & {
    href?: string,
    to?: string
}

declare var Streamr: {
    user: any
}

export default class ResourceList extends Component {
    search: Function
    onMaxChange: Function
    state: {
        search: string,
        max: number,
        offset: number
    }
    props: {
        title: string,
        items: Array<Item>,
        fields: Array<string | {
            name: string,
            displayName: string
        }>,
        mapResourceToItem: (item: Item) => Item,
        resourceType: CommonResource.type,
        searchEnabled?: boolean,
        items: Array<CommonResource | Item>,
        getItems: (search: {
            max: number,
            offset: number,
            query?: string
        }) => Promise<Array<Item>>
    }
    
    static defaultProps = {
        mapItemToResource: (item: Item): Item => ({
            ...item
        })
    }
    
    constructor() {
        super()
        this.state = {
            search: '',
            max: 25,
            offset: 0
        }
        this.search = this.search.bind(this)
        this.onMaxChange = this.onMaxChange.bind(this)
    }
    
    componentWillMount() {
        this.props.getItems({
            max: this.state.max,
            offset: this.state.offset
        })
    }
    
    search({target}: { target: HTMLInputElement }) {
        this.setState({
            search: target.value
        })
        this.props.getItems({
            max: this.state.max,
            offset: this.state.offset,
            search: target.value
        })
    }
    
    onMaxChange(newValue: number) {
        this.setState({
            max: newValue
        })
    }
    
    render() {
        return (
            <Row>
                <Col xs={12}>
                    <Panel
                        header={[
                            <div key="1" className="panel-title">{this.props.title}</div>,
                            this.props.searchEnabled ? (
                                <div key="2" className={`panel-heading-controls ${styles.panelHeadingControls}`}>
                                    <form>
                                        <InputGroup className={styles.inputGroup}>
                                            <input
                                                required
                                                placeholder="Search"
                                                className={`form-control ${styles.searchInput}`}
                                                onChange={this.search}
                                            />
                                            <InputGroup.Button className={styles.inputGroupButton}>
                                                <Button>
                                                    <FontAwesome name="search"/>
                                                </Button>
                                            </InputGroup.Button>
                                        </InputGroup>
                                    </form>
                                </div>
                            ) : ''
                        ]}
                    >
                        <BootstrapTable
                            data={ this.props.items }
                            noDataText="No items found"
                            pagination
                            striped
                            hover
                            bordered
                            search
                            //ignoreSinglePage
                        >
                            <TableHeaderColumn dataField='name' isKey={ true }>Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='lastUpdated'>Last Updated</TableHeaderColumn>
                        </BootstrapTable>
                        {/*<Table className={styles.resourceTable} striped hover bordered>*/}
                        {/*<thead>*/}
                        {/*<tr>*/}
                        {/*{this.props.fields.map(field => (*/}
                        {/*<th key={JSON.stringify(field)}>*/}
                        {/*{field.displayName || field}*/}
                        {/*</th>*/}
                        {/*))}*/}
                        {/*<th/>*/}
                        {/*</tr>*/}
                        {/*</thead>*/}
                        {/*<tbody>*/}
                        {/*{this.props.items.map(item => {*/}
                        {/*const resource: Object = this.props.mapResourceToItem(item)*/}
                        {/*const canShare = item.ownPermissions && item.ownPermissions.includes('share') || item.user === Streamr.user*/}
                        {/*const canDelete = item.ownPermissions && item.ownPermissions.includes('write') || item.user === Streamr.user*/}
                        {/*return (*/}
                        {/*<ClickableTr href={item.href} to={item.to} key={item.id}>*/}
                        {/*{this.props.fields.map(field => (*/}
                        {/*<ClickableTd key={JSON.stringify(field)}>*/}
                        {/*{resource[field.name || field]}*/}
                        {/*</ClickableTd>*/}
                        {/*))}*/}
                        {/*<td>*/}
                        {/*{(canShare || canDelete) && (*/}
                        {/*<DropdownButton*/}
                        {/*pullRight*/}
                        {/*title=""*/}
                        {/*id={`dropdown-for-${item.id}`}*/}
                        {/*bsSize="sm"*/}
                        {/*className="btn-outline"*/}
                        {/*>*/}
                        {/*{canShare && (*/}
                        {/*<ShareDialog*/}
                        {/*resourceId={item.id}*/}
                        {/*resourceType={this.props.resourceType}*/}
                        {/*resourceTitle={item.name || item.id}*/}
                        {/*>*/}
                        {/*<MenuItem>*/}
                        {/*Share*/}
                        {/*</MenuItem>*/}
                        {/*</ShareDialog>*/}
                        {/*)}*/}
                        {/*{canDelete && (*/}
                        {/*<MenuItem>*/}
                        {/*Delete*/}
                        {/*</MenuItem>*/}
                        {/*)}*/}
                        {/*</DropdownButton>*/}
                        {/*)}*/}
                        {/*</td>*/}
                        {/*</ClickableTr>*/}
                        {/*)*/}
                        {/*})}*/}
                        {/*</tbody>*/}
                        {/*</Table>*/}
                        <div className={styles.footerControl}>
                            <div className={styles.maxSelect}>
                                <Select
                                    className={styles.maxSelect}
                                    value={this.state.max}
                                    options={[10, 25, 50, 100].map(o => ({
                                        value: o,
                                        label: o
                                    }))}
                                    clearable={false}
                                    searchable={false}
                                    autosize={false}
                                    onChange={this.onMaxChange}
                                />
                            </div>
                        </div>
                    </Panel>
                </Col>
            </Row>
        )
    }
}