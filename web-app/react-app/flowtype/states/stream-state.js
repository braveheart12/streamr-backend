// @flow

import type {Stream} from '../stream-types'
import type {ApiError} from '../common-types'

export type StreamState = {
    byId: {
        [$ElementType<Stream, 'id'>]: Stream
    },
    openStream: {
        id: ?$ElementType<Stream, 'id'>
    },
    fetching: boolean,
    error?: ?ApiError
}
