
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
     key:string,
     height: number,
     width: number
     dragAlignCenter?:boolean,
     focus?:boolean,
     props: {
          text?:string,
          size?:string,
          color?:string,
          type?:string,
          [key:string]:any,
     },
     model:{
          default?: string,
          [key:string]: any
     }
}

export const componentConfigKey:InjectionKey<TcomponentConfig> = Symbol('config')