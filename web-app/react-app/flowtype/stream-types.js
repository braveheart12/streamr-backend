export type Stream = {
    id: string,
    name: string,
    description: string,
    config?: {
        fields?: Array<{
            name: string,
            type: string
        }>
    }
}

export type State = {
    byId: {
        [Stream.id]: Stream
    },
    openStream: {
        id: Stream.id
    },
    ownPermissions: Array<string>,
    fetching: boolean,
    error?: ?string
}

export type Action = {
    type: string,
    error?: string,
    stream?: Stream
}
