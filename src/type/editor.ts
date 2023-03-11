
import { TcomponentConfig } from '@/utils/editor-config'
import { InjectionKey } from 'vue'
export type TeditorConfig = {
     container : {
        width:number,
        height:number
     },
     blocks:TblockConfig[]
}

export type TblockConfig = {
     left:number,
     top:number,
     zIndex:number,
     key:string
}

export const componentConfigKey:InjectionKey<TcomponentConfig> = Symbol('config')