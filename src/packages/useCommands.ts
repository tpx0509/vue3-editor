import { TeditorConfig } from "@/type/editor"
import deepcopy from "deepcopy"
import { onUnmounted, WritableComputedRef } from "vue"
import events from "./events"

type TCommands = { 
    name:string,
    pushQueue?:boolean,
    init?:() => () => void,
    execute:() => { redo: () => unknown , [key:string] : () => unknown},
    [key:string]: any
}
type TFn = () => unknown

type TCommandsState = {
    current:number, // 当前在任务队列的指针
    queue:TCommands[], // 任务队列 用于撤销，重做等
    commands : { // 存放指令的映射 undo: () => {}
        [key:string]: () => void
    },
    commandsArray: TCommands[], // 存放所有操作指令
    destroyArray: TFn[] // 需要执行的销毁函数集
}

export function useCommands(data: WritableComputedRef<TeditorConfig>) {
    console.log('data',data.value)
     const state: TCommandsState = {
         current: -1,
         queue:[],
         commands:{}, 
         commandsArray:[], 
         destroyArray:[]
     }
     const register = (commands:TCommands) => {
        state.commandsArray.push(commands)
        state.commands[commands.name] = () => {
            const { redo } = commands.execute()
            redo()
        }
     }
     // 注册命令，之后注册新的操作命令在这里维护
    register({
         name:'undo',
         execute() {
             return {
                redo() { 
                    console.log('undo')
                }
             }
         }
    })
    register({
        name:'redo',
        execute() {
            return {
               redo() { 
                console.log('redo')
               }
            }
        }
    })
    register({
        name:'drag',
        pushQueue:true,
        init() { // 一开始就要执行的函数
            /*
                在这里监听组件的拖拽,保存拖拽前和拖拽后的状态
                可以调用命令的redo和undo进行撤销和重做
            */ 
            console.log('this',this)
            const start = () => this.before = deepcopy(data.value.blocks) // 保存拖拽之前的状态
            const end = () => this.redo()
            events.on('start',start)
            events.on('start',end)
            return () => { // 销毁函数
                events.off('start')
                events.off('end')
            }
        },
        execute() { // 调用时执行的函数
            return {
                 redo() {
                     data.value = {
                        ...data.value,
                        blocks : data.value.blocks
                     }
                 },
                 undo() {
                    // data.value = {
                    //     ...data.value,
                    //     blocks : this.before
                    //  }
                 }
            }
        }
    })

    onUnmounted(() => {
        state.destroyArray.forEach(fn => fn())
    })
    ;(() => {
        state.commandsArray.forEach(commands => {
            commands.init && state.destroyArray.push(commands.init())
            if(commands.pushQueue) {
                state.queue.push(commands)
            }
        })
        console.log(state)
    })()
    return state
}