import { componentConfig } from "@/type/component"
import { TeditorConfig } from "@/type/editor"
import { Ref, WritableComputedRef } from "vue"
import events from "./events"

export function useMenuDragger(containerRef:Ref<HTMLElement | null>,data:WritableComputedRef<TeditorConfig>) {
    let currentDragComponent:componentConfig|null = null
    
    function dragStart(e:DragEvent,component:componentConfig) {
        containerRef.value?.addEventListener('dragenter',dragEnter)
        containerRef.value?.addEventListener('dragover',dragOver)
        containerRef.value?.addEventListener('dragleave',dragLeave)
        containerRef.value?.addEventListener('drop',drop)
        currentDragComponent = component
    }
    function dragEnter(e:DragEvent) {
        e.dataTransfer!.dropEffect = 'move'
    }
    function dragOver(e:DragEvent) {
        e.preventDefault()
    }
    function dragLeave(e:DragEvent) {
        e.dataTransfer!.dropEffect = 'none'
    }
    function drop(e:DragEvent) {
        // 拖动对象且在投放区放开鼠标时触发，要先在dragover上设置禁止默认事件，才会触发
        // 更新画布数据
        let originBlocks = data.value.blocks
        data.value = {
             ...data.value,
             blocks:[
                ...originBlocks,
                {
                    left:e.offsetX,
                    top:e.offsetY,
                    zIndex:1,
                    key:currentDragComponent!.key,
                    width:0,
                    height:0,
                    dragAlignCenter:true // 松手时让组件可以居中
                }
             ]
        }
        currentDragComponent = null
        events.emit('start')
    }
    function dragEnd() {
        containerRef.value?.removeEventListener('dragenter',dragEnter)
        containerRef.value?.removeEventListener('dragover',dragOver)
        containerRef.value?.removeEventListener('dragleave',dragLeave)
        containerRef.value?.removeEventListener('drop',drop)
        events.emit('end')
    }
    return {
        dragStart,
        dragEnd
    }
}