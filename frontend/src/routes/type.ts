export interface Route {
    path?:        string
    component:    React.ComponentType<any>
    isProtected?: boolean
    index?:       boolean
    children?:    Route[]
}