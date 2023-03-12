import { TblockConfig } from "@/type/editor"
import { ComputedRef } from "vue";

export function useBlockDragger(data:ComputedRef<{
    focusBlocks: TblockConfig[];
    unFocusBlocks: TblockConfig[];
}>) {
    let dragState: {
        startX: number,
        startY: number,
        startPos?: Pick<TblockConfig, 'top' | 'left'>[]
    } = {
        startX: 0,
        startY: 0,
        startPos: []
    }
    function mouseDown(e: MouseEvent) {
        // 记录点击时的位置
        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            startPos: data.value.focusBlocks.map(({ top, left }) => ({ top, left }))
        }
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    }
    function mouseMove(e: MouseEvent) {
        let { clientX: moveX, clientY: moveY } = e
        let durX = moveX - dragState.startX
        let durY = moveY - dragState.startY
        // 改变每一项选中的位置
        data.value.focusBlocks.forEach((block, index) => {
            block.left = dragState.startPos![index].left + durX
            block.top = dragState.startPos![index].top + durY
        })
    }
    function mouseUp(e: MouseEvent) {
        document.removeEventListener('mousemove', mouseMove)
        document.removeEventListener('mouseup', mouseUp)
    }
    return {
        mouseDown
    }
}