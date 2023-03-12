import { TblockConfig, TeditorConfig } from "@/type/editor"
import { computed, WritableComputedRef } from "vue"

export function useFocus(data:WritableComputedRef<TeditorConfig>,callback:(e:MouseEvent)=>void) {
    const focusData = computed(() => {
        let focusBlocks:TblockConfig[] = []
        let unFocusBlocks:TblockConfig[] = []
        data.value.blocks.forEach(block => (block.focus ? focusBlocks : unFocusBlocks).push(block))
        return {
           focusBlocks,
           unFocusBlocks
        }
   })

   function blockMousedown(e: MouseEvent, block: TblockConfig) {
       e.preventDefault()
       e.stopPropagation()
       if (e.shiftKey) {
           block.focus = !block.focus
       } else {
           if (!block.focus) {
               clearBlocksFocus() // 清空其他人的focus
               block.focus = true
           } else {
               block.focus = false
           }
       }

       callback(e)
   }
   function clearBlocksFocus() {
       data.value.blocks.forEach(block => block.focus = false)
   }
   return {
     focusData,
     blockMousedown,
     clearBlocksFocus
   }
}