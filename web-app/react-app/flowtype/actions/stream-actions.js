// @flow

import type {CSVImporterSchema, Stream} from '../stream-types'
import type {Permission} from '../permission-types'
import type {ErrorInUi} from '../common-types'

import {
    CREATE_STREAM_REQUEST,
    CREATE_STREAM_SUCCESS,
    CREATE_STREAM_FAILURE,
    GET_STREAM_REQUEST,
    GET_STREAM_SUCCESS,
    GET_STREAM_FAILURE,
    UPDATE_STREAM_REQUEST,
    UPDATE_STREAM_SUCCESS,
    UPDATE_STREAM_FAILURE,
    DELETE_STREAM_REQUEST,
    DELETE_STREAM_SUCCESS,
    DELETE_STREAM_FAILURE,
    GET_MY_STREAM_PERMISSIONS_REQUEST,
    GET_MY_STREAM_PERMISSIONS_SUCCESS,
    GET_MY_STREAM_PERMISSIONS_FAILURE,
    SAVE_STREAM_FIELDS_REQUEST,
    SAVE_STREAM_FIELDS_SUCCESS,
    SAVE_STREAM_FIELDS_FAILURE,
    UPLOAD_CSV_FILE_REQUEST,
    UPLOAD_CSV_FILE_SUCCESS,
    UPLOAD_CSV_FILE_FAILURE,
    OPEN_STREAM
} from '../../actions/stream'

export type StreamAction = {
    type: typeof UPDATE_STREAM_REQUEST
        | typeof GET_STREAM_REQUEST
        | typeof DELETE_STREAM_REQUEST
        | typeof CREATE_STREAM_REQUEST
        | typeof GET_MY_STREAM_PERMISSIONS_REQUEST
        | typeof SAVE_STREAM_FIELDS_REQUEST
        | typeof UPLOAD_CSV_FILE_REQUEST
} | {
    type: typeof OPEN_STREAM
        | typeof DELETE_STREAM_SUCCESS,
    id: $ElementType<Stream, 'id'>
} | {
    type: typeof UPDATE_STREAM_SUCCESS
        | typeof GET_STREAM_SUCCESS
        | typeof CREATE_STREAM_SUCCESS,
    stream: Stream
} | {
    type: typeof SAVE_STREAM_FIELDS_SUCCESS,
    id: $ElementType<Stream, 'id'>,
    fields: $ElementType<$ElementType<Stream, 'config'>, 'fields'>
} | {
    type: typeof GET_MY_STREAM_PERMISSIONS_SUCCESS,
    id: $ElementType<Stream, 'id'>,
    permissions: Array<$ElementType<Permission, 'operation'>>
} | {
    type: typeof SAVE_STREAM_FIELDS_FAILURE
        | typeof UPDATE_STREAM_FAILURE
        | typeof GET_STREAM_FAILURE
        | typeof CREATE_STREAM_FAILURE
        | typeof DELETE_STREAM_FAILURE
        | typeof GET_MY_STREAM_PERMISSIONS_FAILURE,
    error: ErrorInUi
} | {
    type: typeof UPLOAD_CSV_FILE_FAILURE,
    error: ErrorInUi,
    id: $ElementType<Stream, 'id'>,
    fileUrl: string,
    schema: CSVImporterSchema
} | {
    type: typeof UPLOAD_CSV_FILE_SUCCESS
}
