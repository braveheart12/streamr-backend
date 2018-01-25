import assert from 'assert-diff'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import sinon from 'sinon'
import moxios from 'moxios'
import * as createLink from '../../helpers/createLink'

import * as actions from '../../actions/stream'
import * as notificationActions from '../../actions/notification'

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

describe('Stream actions', () => {
    let store
    let sandbox
    
    beforeEach(() => {
        moxios.install()
        sandbox = sinon.sandbox.create()
        sandbox.stub(createLink, 'default').callsFake((url) => url)
        store = mockStore({
            byId: {},
            openStream: {
                id: null
            },
            error: null
        })
    })
    
    afterEach(() => {
        moxios.uninstall()
        sandbox.restore()
        store.clearActions()
    })
    
    describe('getStream', () => {
        it('creates GET_STREAM_SUCCESS when fetching a stream has succeeded', async () => {
            const id = 'asdfasdfasasd'
            moxios.stubRequest(`api/v1/streams/${id}`, {
                status: 200,
                response: {
                    id: 'test',
                    name: 'test'
                }
            })
            
            const expectedActions = [{
                type: actions.GET_STREAM_REQUEST
            }, {
                type: actions.GET_STREAM_SUCCESS,
                stream: {
                    id: 'test',
                    name: 'test'
                }
            }]
            
            await store.dispatch(actions.getStream(id))
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })
        it('creates GET_STREAM_FAILURE when fetching stream has failed', async () => {
            const id = 'asdfasdfasasd'
            moxios.stubRequest(`api/v1/streams/${id}`, {
                status: 500,
                response: new Error('test-error')
            })
            
            const expectedActions = [{
                type: actions.GET_STREAM_REQUEST
            }, {
                type: actions.GET_STREAM_FAILURE,
                error: new Error('test-error')
            }]
            
            try {
                await store.dispatch(actions.getStream(id))
            } catch (e) {
                assert.deepStrictEqual(store.getActions().slice(0, 2), expectedActions)
            }
        })
    })
    
    describe('updateStream', () => {
        it('creates UPDATE_STREAM_SUCCESS and CREATE_NOTIFICATION when fetcupdatinghing a stream has succeeded', async () => {
            const id = 'test'
            const stream = {
                id,
                name: 'test',
                ownPermissions: []
            }
            moxios.stubRequest(`api/v1/streams/${id}`, {
                status: 200,
                response: stream
            })
            
            const expectedActions = [{
                type: actions.UPDATE_STREAM_REQUEST
            }, {
                type: actions.UPDATE_STREAM_SUCCESS,
                stream
            }, {
                type: notificationActions.CREATE_NOTIFICATION,
                notification: {
                    type: 'success'
                }
            }]
            
            await store.dispatch(actions.updateStream(stream))
            assert.deepStrictEqual(store.getActions().slice(0, 2), expectedActions.slice(0, 2))
            assert.equal(store.getActions()[2].type, expectedActions[2].type)
            assert.equal(store.getActions()[2].notification.type, expectedActions[2].notification.type)
        })
        it('creates UPDATE_STREAM_FAILURE and CREATE_NOTIFICATION when updating a stream has failed', async () => {
            const id = 'test'
            const db = {
                id,
                name: 'test'
            }
            moxios.stubRequest(`api/v1/streams/${id}`, {
                status: 500,
                response: new Error('test')
            })
            
            const expectedActions = [{
                type: actions.UPDATE_STREAM_REQUEST
            }, {
                type: actions.UPDATE_STREAM_FAILURE,
                error: new Error('test')
            }, {
                type: notificationActions.CREATE_NOTIFICATION,
                notification: {
                    type: 'error'
                }
            }]
            
            try {
                await store.dispatch(actions.updateStream(db))
            } catch (e) {
                assert.deepStrictEqual(store.getActions().slice(0, 2), expectedActions.slice(0, 2))
                assert.equal(store.getActions()[2].type, expectedActions[2].type)
                assert.equal(store.getActions()[2].notification.type, expectedActions[2].notification.type)
            }
        })
        it('uses PUT request', async () => {
            const id = 'test'
           
            store.dispatch(actions.updateStream({
                id
            }))
            await moxios.promiseWait()
            let request = moxios.requests.mostRecent()
            assert.equal(request.url, `api/v1/streams/${id}`)
            assert.equal(request.config.method.toLowerCase(), 'put')
        })
    })
    
    describe('deleteStream', () => {
        it('uses DELETE request', async () => {
            const id = 'asdfjasldfjasödf'
            store.dispatch(actions.deleteStream(id))
            await moxios.promiseWait()
            let request = moxios.requests.mostRecent()
            assert.equal(request.url, `api/v1/streams/${id}`)
            assert.equal(request.config.method, 'delete')
        })
        it('creates DELETE_STREAM_SUCCESS when deleting stream has succeeded', async () => {
            const id = 'afasfasfsa'
            moxios.stubRequest(`api/v1/streams/${id}`, {
                status: 200
            })
            
            const expectedActions = [{
                type: actions.DELETE_STREAM_REQUEST
            }, {
                type: actions.DELETE_STREAM_SUCCESS,
                id
            }, {
                type: notificationActions.CREATE_NOTIFICATION,
                notification: {
                    type: 'success'
                }
            }]
            
            await store.dispatch(actions.deleteStream(id))
            assert.deepStrictEqual(store.getActions().slice(0, 2), expectedActions.slice(0, 2))
            assert.equal(store.getActions()[2].type, expectedActions[2].type)
            assert.equal(store.getActions()[2].notification.type, expectedActions[2].notification.type)
        })
        it('creates DELETE_STREAM_FAILURE when deleting stream has failed', async () => {
            const id = 'afasfasfsa'
            moxios.stubRequest(`api/v1/streams/${id}`, {
                status: 500,
                error: new Error('error')
            })
            
            const expectedActions = [{
                type: actions.DELETE_STREAM_REQUEST
            }, {
                type: actions.DELETE_STREAM_FAILURE,
                error: new Error('test')
            }, {
                type: notificationActions.CREATE_NOTIFICATION,
                notification: {
                    type: 'error'
                }
            }]
            try {
                await store.dispatch(actions.deleteStream(id))
            } catch (e) {
                assert.deepStrictEqual(store.getActions().slice(0, 2), expectedActions.slice(0, 2))
                assert.equal(store.getActions()[2].type, expectedActions[2].type)
                assert.equal(store.getActions()[2].notification.type, expectedActions[2].notification.type)
            }
        })
    })
    
    describe('createStream', () => {
        it('uses POST request', async () => {
            const stream = {
                name: 'test'
            }
        
            store.dispatch(actions.createStream(stream))
            await moxios.promiseWait()
            const request = moxios.requests.mostRecent()
            assert.equal(request.url, 'api/v1/streams')
            assert.equal(request.config.method, 'post')
            assert.equal(request.body, stream)
        })
        it('creates CREATE_STREAM_SUCCESS when creating stream has succeeded', async () => {
            const stream = {
                name: 'test'
            }
            moxios.stubRequest('api/v1/streams', {
                status: 200,
                response: stream
            })
        
            const expectedActions = [{
                type: actions.CREATE_STREAM_REQUEST
            }, {
                type: actions.CREATE_STREAM_SUCCESS,
                stream
            }]
        
            await store.dispatch(actions.createStream(stream))
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })
        it('creates CREATE_STREAM_FAILURE when creating stream has failed', async () => {
            const stream = {
                name: 'test'
            }
            moxios.stubRequest('api/v1/streams', {
                status: 500,
                error: new Error('error')
            })
        
            const expectedActions = [{
                type: actions.CREATE_STREAM_REQUEST
            }, {
                type: actions.CREATE_STREAM_FAILURE,
                error: new Error('test')
            }]
        
            await store.dispatch(actions.createStream(stream))
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })
    })
    
    describe('saveFields', () => {
        it('uses POST request', (done) => {
            const id = 'fjasdlfjasdlkfj'
            const fields = [{
                name: 'moi',
                type: 'string'
            }, {
                name: 'moimoi',
                type: 'number'
            }]
            moxios.wait(() => {
                let request = moxios.requests.mostRecent()
                assert.equal(request.url, `api/v1/streams/${id}/fields`)
                assert.equal(request.config.method, 'post')
                assert.equal(request.body, fields)
                done()
            })
        
            store.dispatch(actions.saveFields(fields))
        })
        it('creates SAVE_STREAM_FIELDS_SUCCESS when saving fields has succeeded', async () => {
            const id = 'sfasldkfjsaldkfj'
            const fields = [{
                name: 'moi',
                type: 'string'
            }, {
                name: 'moimoi',
                type: 'number'
            }]
            moxios.stubRequest('api/v1/streams', {
                status: 200,
                response: fields
            })
        
            const expectedActions = [{
                type: actions.SAVE_STREAM_FIELDS_REQUEST
            }, {
                type: actions.SAVE_STREAM_FIELDS_SUCCESS,
                id,
                fields
            }]
        
            await store.dispatch(actions.saveFields(id, fields))
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })
        it('creates SAVE_STREAM_FIELDS_FAILURE when saving fields has failed', async () => {
            const id = 'sfasldkfjsaldkfj'
            const fields = [{
                name: 'moi',
                type: 'string'
            }, {
                name: 'moimoi',
                type: 'number'
            }]
            moxios.stubRequest('api/v1/streams', {
                status: 200,
                error: new Error('error')
            })
    
            const expectedActions = [{
                type: actions.SAVE_STREAM_FIELDS_REQUEST
            }, {
                type: actions.SAVE_STREAM_FIELDS_FAILURE,
                error: new Error('error')
            }]
    
            await store.dispatch(actions.saveFields(id, fields))
            assert.deepStrictEqual(store.getActions(), expectedActions)
        })
    })
})