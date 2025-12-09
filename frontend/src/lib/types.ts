export interface Graph {
    title: string
    src: string
}

export interface GraphGroup {
    name: string
    graphs: Graph[]
}

export interface GraphGroupWithProps extends GraphGroup {
    color: string
    visible: boolean
}

export interface TabGroup {
    name: string
    groups: GraphGroup[]
};

//=== API types ===//
export interface User {
    id: string
    user_id: string
    username: string
    role: 'guest' | 'admin'
}

export interface Document {
    id: string
    title: string
    mtg_date: string
    body: string
    author_uuid: string
    author_id: string
    author_name: string
}

export interface Image {
    id: string
    path: string
    url: string
}

export interface SimpleRes {
    success: boolean
}