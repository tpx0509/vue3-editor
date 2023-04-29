import { TblockConfig } from "./editor"

export type componentConfig = {
    label: string,
    preview: () => JSX.Element,
    render: (params:{
      props:TblockConfig['props'],
      model:any
    }) => JSX.Element,
    key: string,
    props ?: {
        [key: string]: {
            type: string,
            [key:string]: any
        }
    },
    model ?: {
        default?: string,
        [key:string]: any
    }
}