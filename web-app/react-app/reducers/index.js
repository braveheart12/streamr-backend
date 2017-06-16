
import {combineReducers} from 'redux'

import canvas from './canvas'
import dashboard from './dashboard'
import integrationKey from './integrationKey'
import permission from './permission'
import notification from './notification'

export default combineReducers({
    canvas,
    dashboard,
    integrationKey,
    permission,
    notification
})