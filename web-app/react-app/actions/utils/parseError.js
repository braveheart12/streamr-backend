// @flow

import type { ApiError } from '../../types'

export default (res: {
    response?: {
        data: ApiError
    }
}) : ApiError => (res.response || {}).data || res.message || {
    error: 'Something went wrong'
}