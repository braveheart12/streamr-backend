
import type {ApiError} from './common-types'
import type {CommonResource} from './resource-types'

export type Operation = 'read' | 'write' | 'share'

export type Permission = CommonResource & {
    operation: Operation,
    user: CommonResource.user,
    anonymous?: boolean,
    fetching?: boolean,
    new?: boolean,
    removed?: boolean,
    error?: ApiError,
    resourceType?: CommonResource.type,
    resourceId?: CommonResource.id
}

export type State = {
    byTypeAndId: {
        [resourceType]: {
            [resourceId]: Array<Permission>
        }
    },
    error: ?ApiError,
    fetching: boolean
}