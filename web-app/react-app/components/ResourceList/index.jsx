// @flow

import React, {Component} from 'react'
import {
    Row, Col, Panel, DropdownButton, MenuItem, InputGroup, Button
} from 'react-bootstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import FontAwesome from 'react-fontawesome'

import ShareDialog from '../ShareDialog'
//import {ClickableTr, ClickableTd} from '../ClickableTable'

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'
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
    getItems: Function
    onSearchChange: Function
    onSortChange: Function
    onPageChange: Function
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
        this.getItems = this.getItems.bind(this)
        this.onSearchChange = this.onSearchChange.bind(this)
        this.onSortChange = this.onSortChange.bind(this)
        this.onPageChange = this.onPageChange.bind(this)
    }
    
    componentWillMount() {
        this.props.getItems({
            max: this.state.max,
            offset: this.state.offset
        })
    }
    
    onSearchChange({target}: { target: HTMLInputElement }) {
        const newState = {
            search: target.value
        }
        this.setState(newState)
        this.props.getItems({
            ...this.state,
            ...newState
        })
    }
    
    getItems() {
        this.props.getItems({
            max: this.state.max,
            offset: this.state.offset,
            search: this.state.search
        })
    }
    
    onSortChange() {
        debugger
    }
    
    onPageChange(page: number, sizePerPage: number) {
        debugger
        const newState = {
            max: sizePerPage,
            offset: sizePerPage * (page - 1)
        }
        this.setState(newState)
        this.props.getItems({
            ...this.state,
            ...newState
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
                                                onChange={this.onSearchChange}
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
                            containerClass={styles.itemTableContainer}
                            tableContainerClass={styles.itemTable}
                            fetchInfo={{
                                dataTotalSize: this.props.items.length || 0
                            }}
                            options={{
                                noDataText: 'No items found',
                                onSortChange: this.onSortChange,
                                sizePerPage: this.state.max,
                                sizePerPageList: [10, 25, 50, 100],
                                onPageChange: this.onPageChange,
                                page: this.state.offset / this.state.max + 1
                            }}
                            remote
                            pagination
                            striped
                            hover
                            bordered
                        >
                            <TableHeaderColumn dataSort dataField='name' isKey={ true }>Name</TableHeaderColumn>
                            <TableHeaderColumn dataSort dataField='lastUpdated'>Last Updated</TableHeaderColumn>
                            <TableHeaderColumn dataField='action' columnClassName={ styles.itemActionColumn } className={ styles.itemActionColumnHeader } dataFormat={(cell, row) => (
                                <ActionFormatter item={row} mapResourceToItem={this.props.mapResourceToItem} resourceType={this.props.resourceType} />
                            )}/>
                        </BootstrapTable>
                    </Panel>
                </Col>
            </Row>
        )
    }
}

function ActionFormatter(props: {
    item: Item,
    mapResourceToItem: (res: CommonResource | Item) => Item,
    resourceType: CommonResource.type
}) {
    const item: Item = props.mapResourceToItem(props.item)
    const canShare = item.ownPermissions && item.ownPermissions.includes('share') || item.user === Streamr.user
    const canDelete = item.ownPermissions && item.ownPermissions.includes('write') || item.user === Streamr.user

    return (
        (canShare || canDelete) ? (
            <DropdownButton
                pullRight
                title=""
                id={`dropdown-for-${item.id}`}
                bsSize="sm"
                className="btn-outline"
            >
                {canShare && (
                    <ShareDialog
                        resourceId={item.id}
                        resourceType={props.resourceType}
                        resourceTitle={item.name || item.id}
                    >
                        <MenuItem>
                            Share
                        </MenuItem>
                    </ShareDialog>
                )}
                {canDelete && (
                    <MenuItem>
                        Delete
                    </MenuItem>
                )}
            </DropdownButton>
        ) : null
    )
}