
import type {User} from './user-types'
import type {Operation} from './permission-types'

export type CommonResource = {
    id: string,
    name: string,
    type: 'DASHBOARD' | 'CANVAS' | 'STREAM',
    user: User.email,
    ownPermissions: Array<Operation>
}

export type ResourceSearchQuery = {
    max: ?number,
    offset: ?number,
    search: ?string
}