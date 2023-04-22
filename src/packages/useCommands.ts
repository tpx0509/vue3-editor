import { TblockConfig, TeditorConfig } from "@/type/editor"
import deepcopy from "deepcopy"
import { ComputedRef, onUnmounted, WritableComputedRef } from "vue"
import events from "./events"

type TCommands = {
    name: string,
    keyboard?: string,
    pushQueue?: boolean, // 该命令是否需要加入队列
    init?: () => () => void,
    execute: (...args: any) => { redo: () => unknown, [key: string]: () => unknown },
    [key: string]: any
}
type TFn = () => unknown

type Task = {
    redo: () => void,
    undo: () => void
}

type TCommandsState = {
    current: number, // 当前在任务队列的指针
    queue: Task[], // 任务队列 用于撤销，重做等
    commands: { // 存放指令的映射 undo: () => {}
        [key: string]: (...args: any) => void
    },
    commandsArray: TCommands[], // 存放所有操作指令
    destroyArray: TFn[] // 需要执行的销毁函数集
}

export function useCommands(data: WritableComputedRef<TeditorConfig>, focusData: ComputedRef<{
    focusBlocks: TblockConfig[];
    unFocusBlocks: TblockConfig[];
}>) {
    console.log('data', data.value)
    const state: TCommandsState = {
        current: -1,
        queue: [],
        commands: {},
        commandsArray: [],
        destroyArray: []
    }
    // 注册命令
    const register = (commands: TCommands) => {
        state.commandsArray.push(commands)
        state.commands[commands.name] = (...args) => {
            const { redo, undo } = commands.execute(...args)
            redo()
            if (!commands.pushQueue) return
            let { queue, current } = state
            // 如果先放了组件1=》组件2=》撤回=》组件3   （放置的过程中发生了撤回）
            // 队列结果应该是组件1=》组件3
            // 撤销命令相当于只是做了移动current指针，并没有操作队列，所以这里需要处理一下，截取掉没用的
            if (queue.length > 0) {
                queue = queue.slice(0, current + 1) // 以当前的位置去截取 （可能在放置的过程中有撤销操作，所以跟据当前最新的current值来计算新的队列）
                state.queue = queue
            }

            // 需要入队列，能撤销回退的任务，要在这里加入
            queue.push({ redo, undo })
            state.current++
            console.log('操作队列', queue)
        }
    }
    // 注册命令，之后注册新的操作命令都在这里维护
    register({// 撤销
        name: 'undo',
        keyboard: 'ctrl+z',
        execute() {
            return {
                redo() {
                    if (state.current === -1) return;
                    let item = state.queue[state.current] // 找到上一步撤销操作
                    if (item) {
                        item.undo?.()
                    }
                    state.current--
                }
            }
        }
    })
    register({ // 重做
        name: 'redo',
        keyboard: 'ctrl+y',
        execute() {
            return {
                redo() {
                    let item = state.queue[state.current + 1] // 找到下一步还原操作
                    if (item) {
                        item.redo?.()
                        state.current++
                    }
                }
            }
        }
    })
    register({ // 每次拖拽时会执行
        name: 'drag',
        pushQueue: true,
        init() { // 一开始就要执行的函数
            /*
                在这里监听组件的拖拽,保存拖拽前和拖拽后的状态
                可以调用命令的redo和undo进行撤销和重做
            */
            this.before = null
            const start = () => this.before = deepcopy(data.value.blocks) // 保存拖拽之前的状态
            const end = () => state.commands.drag() // 每次拖拽结束后调用drag会保存本次拖拽任务到队列中
            events.on('start', start)
            events.on('end', end)
            return () => { // 销毁函数
                events.off('start')
                events.off('end')
            }
        },
        execute() { // 调用时执行的函数
            let before = this.before
            let after = data.value.blocks;
            return {
                redo() {
                    console.log('redo,after', after)
                    // 拖拽结束/重做就会执行此函数
                    data.value = {
                        ...data.value,
                        blocks: after
                    }
                },
                undo() {
                    console.log('undo,before', before)
                    data.value = {
                        ...data.value,
                        blocks: before
                    }
                }
            }
        }
    })
    register({ // 更新整个容器
        name: 'updateContainer',
        pushQueue: true,
        execute(newValue) {
            let state = {
                before: data.value, // 当前的值
                after: newValue //新值
            }
            return {
                redo() {
                    data.value = state.after
                },
                undo() {
                    data.value = state.before
                }
            }
        }
    })
    register({ // 置顶
        name: 'placeTop',
        pushQueue: true,
        execute() {
            let { focusBlocks, unFocusBlocks } = focusData.value
            let before = deepcopy(data.value.blocks) // 保存一份之前的
            let after = (() => {
                // 找到未选中block中的最大zIndex
                let maxZIndex = unFocusBlocks.reduce((prev, block) => {
                    return Math.max(prev, block.zIndex)
                }, -Infinity)
                // 把选中的block统一在最大的zIndex基础上+1就实现了置顶
                focusBlocks.forEach(block => block.zIndex = maxZIndex + 1)
                return data.value.blocks
            })()

            return {
                redo() {
                    data.value = {
                         ...data.value,
                         blocks : after
                    }
                },
                undo() {
                    data.value = {
                        ...data.value,
                        blocks : before
                    }
                }
            }
        }
    })
    register({ // 置底
        name: 'placeBottom',
        pushQueue: true,
        execute() {
            let { focusBlocks, unFocusBlocks } = focusData.value
            let before = deepcopy(data.value.blocks) // 保存一份之前的(要深拷贝一份，因为在undo里面直接使用的话，他们是同一份引用，并不会触发试图更新)
            let after = (() => {
                // 找到未选中block中的最小zIndex
                let minZIndex = unFocusBlocks.reduce((prev, block) => {
                    return Math.min(prev, block.zIndex)
                }, Infinity) - 1;

                if(minZIndex < 0) {
                     // 特殊情况，minZindex已经为负值了。为了避免不展示。zIndex不能出现负值
                     // 所以让它为0，其他的元素++展示在其上面即可
                     minZIndex = 0
                     let durIndex = Math.abs(minZIndex)
                     unFocusBlocks.forEach(block => block.zIndex+=durIndex)
                }
                focusBlocks.forEach(block => block.zIndex = minZIndex)
                return data.value.blocks
            })()

            return {
                redo() {
                    data.value = {
                         ...data.value,
                         blocks : after
                    }
                },
                undo() {
                    data.value = {
                        ...data.value,
                        blocks : before
                    }
                }
            }
        }
    })
    register({ // 删除
        name: 'delete',
        pushQueue:true,
        execute() {
            let state = {
                before: deepcopy(data.value.blocks),
                after : focusData.value.unFocusBlocks // 让blocks变为只包含unFocusBlocks就实现了删除
            }
            return {
                redo() {
                    data.value = {
                        ...data.value,
                        blocks : state.after
                    }
                },
                undo() {
                    data.value = {
                        ...data.value,
                        blocks : state.before
                    }
                }
            }
        }
    })
    const keyboardEvent = (() => {
        const KeyCodes: any = {
            90: 'z',
            89: 'y'
        }
        const onKeydown = (e: KeyboardEvent) => {
            let { ctrlKey, keyCode } = e

            let keyArr = []
            let keyString = ''
            if (ctrlKey) {
                // 按下了ctrl
                keyArr.push('ctrl');
                keyArr.push(KeyCodes[keyCode])
                keyString = keyArr.join('+')
            }
            state.commandsArray.forEach(({ keyboard, name }) => {
                if (keyboard === keyString) {
                    state.commands[name]()
                    e.preventDefault()
                }
            })
        }
        const init = () => { // 初始化事件
            window.addEventListener('keydown', onKeydown)
            return () => {
                window.removeEventListener('keydown', onKeydown)
            }
        }
        return init
    })()
        ; (() => {
            // 监听键盘事件
            state.destroyArray.push(keyboardEvent())
            state.commandsArray.forEach(commands => {
                commands.init && state.destroyArray.push(commands.init())
            })
        })()
    onUnmounted(() => {
        state.destroyArray.forEach(fn => fn())
    })
    return state
}