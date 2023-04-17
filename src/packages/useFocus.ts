import { TblockConfig, TeditorConfig } from "@/type/editor"
import { computed, ref, WritableComputedRef } from "vue"

export function useFocus(data:WritableComputedRef<TeditorConfig>,callback:(e:MouseEvent)=>void) {
    let lastSelectedIndex = ref(-1); // 当前选中项
    let lastSelectedBlock = computed<TblockConfig>(() => data.value.blocks[lastSelectedIndex.value])
    const focusData = computed(() => {
        let focusBlocks:TblockConfig[] = []
        let unFocusBlocks:TblockConfig[] = []
        data.value.blocks.forEach(block => (block.focus ? focusBlocks : unFocusBlocks).push(block))
        return {
           focusBlocks,
           unFocusBlocks
        }
   })
   function containerMousedoen() {
        clearBlocksFocus()
        lastSelectedIndex.value = -1
   }
   function blockMousedown(e: MouseEvent, block: TblockConfig,index:number) {
       e.preventDefault()
       e.stopPropagation()
       
       if (e.shiftKey) {
           if(focusData.value.focusBlocks.length <= 1) {
             block.focus = true // 当前只有一个节点被选中时，按住shift键也不会切换focus状态
           }else {
            block.focus = !block.focus
           }
           
       } else {
           if (!block.focus) {
               clearBlocksFocus() // 清空其他人的focus
               block.focus = true
           }
       }
       lastSelectedIndex.value = index
       callback(e)
   }
   function clearBlocksFocus() {
       data.value.blocks.forEach(block => block.focus = false)
   }
   return {
     focusData,
     blockMousedown,
     clearBlocksFocus,
     containerMousedoen,
     lastSelectedBlock
   }
}