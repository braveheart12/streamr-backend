
import React, {Component} from 'react'
import type {ReactChildren} from 'react-flow-types'

export class ClickableTr extends Component {
    
    props: {
        href: string,
        children: ReactChildren
    }
    
    render() {
        return (
            <tr>
                {React.Children.map(this.props.children, c => {
                    return React.cloneElement(c, {
                        href: this.props.href
                    })
                })}
            </tr>
        )
    }
}

const tdStyle = {
    padding: 0
}

const aStyle = {
    padding: '8px',
    display: 'block',
    width: '100%',
    height: '100%',
    textDecoration: 'inherit',
    color: 'inherit'
}

export class ClickableTd extends Component {
    
    props: {
        href: string,
        children: ReactChildren
    }
    
    render() {
        return (
            <td style={tdStyle}>
                <a href={this.props.href} style={aStyle}>
                    {this.props.children}
                </a>
            </td>
        )
    }
}