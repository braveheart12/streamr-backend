import React from 'react'
import {Link} from 'react-router'
import type {ReactChildren} from 'react-flow-types'

export function ClickableTr(props: {
    href?: string,
    to?: string,
    children: ReactChildren
}) {
    if (!props.href && !props.to) {
        throw new Error('ClickableTr needs either \'to\' or \'href\' as props!')
    }
    return (
        <tr>
            {React.Children.map(props.children, c => {
                return React.cloneElement(c, c.type === ClickableTd ? {
                    href: props.href,
                    to: props.to
                } : {})
            })}
        </tr>
    )
}
ClickableTr.displayName = 'ClickableTr'

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

export function ClickableTd(props: {
    href?: string,
    to?: string,
    children: ReactChildren
}) {
    const LinkComponent = props.href ? 'a' : Link
    
    return (
        <td style={tdStyle}>
            <LinkComponent
                href={props.to === undefined ? props.href : undefined}
                to={props.href === undefined ? props.to : undefined}
                style={aStyle}
            >
                {props.children}
            </LinkComponent>
        </td>
    )
}
ClickableTd.displayName = 'ClickableTd'