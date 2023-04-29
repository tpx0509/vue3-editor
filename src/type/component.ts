import { TblockConfig } from "./editor"

export type componentConfig = {
    label: string,
    preview: () => JSX.Element,
    render: (props:TblockConfig['props']) => JSX.Element,
    key: string,
    props: {
        [key: string]: {
            type: string,
            [key:string]: any
        }
    }
}