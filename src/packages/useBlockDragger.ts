import { TblockConfig, TeditorConfig } from "@/type/editor"
import { ComputedRef, reactive, WritableComputedRef } from "vue";
import events from "./events";

export function useBlockDragger(
{
    data,
    lastSelectedBlock,
    editorConfig
}:{
    data:ComputedRef<{
        focusBlocks: TblockConfig[];
        unFocusBlocks: TblockConfig[];
    }>,
    lastSelectedBlock:ComputedRef<TblockConfig>,
    editorConfig:WritableComputedRef<TeditorConfig>
}
) {
    let dragState: {
        startX: number,
        startY: number,
        startPos?: Pick<TblockConfig, 'top' | 'left'>[],
        startLeft:number,
        startTop:number,
        lines:Lines,
        dragging?:boolean
    } = {
        startX: 0,
        startY: 0,
        startLeft:0,
        startTop:0,
        startPos: [],
        lines:{
            x:[],
            y:[]
        },
        dragging : false
    }
    let markLine = reactive<{
        x:number|null,
        y:number|null
    }>({
        x:null,
        y:null
    })
    type Xlines = {
        top:number,
        showTop:number
    }
    type Ylines = {
        left:number,
        showLeft:number
    }
    type Lines = {
        x:Xlines[],
        y:Ylines[]
    }
    function mouseDown(e: MouseEvent) {
        // 记录点击时的位置
        let { height: Bheight,width:Bwidth  } = lastSelectedBlock.value

        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            startLeft: lastSelectedBlock.value.left, // B拖拽前的left，top
            startTop: lastSelectedBlock.value.top,
            startPos: data.value.focusBlocks.map(({ top, left }) => ({ top, left })),
            lines:(() => {
                // B元素：当前正在拖拽的元素。 A元素：其他的每个元素
                // 记录拖拽的元素与其他元素可能产生的每根线的位置
                
                let lines:Lines = {
                    x:[], // 里面放的是一根根的横线
                    y:[] // 里面放的是一根根的纵线
                }
                const { unFocusBlocks } = data.value // 获取其他没选中的以他们的位置做辅助线
                // 把整个容器也作为一个block让元素可以相对于容器对齐做辅助线
                let markLineBlocks = [...unFocusBlocks,{
                    top:0,
                    left:0,
                    width: editorConfig.value.container.width,
                    height: editorConfig.value.container.height
                }]
                markLineBlocks.forEach(block => {
                    let { top: Atop,height:Aheight,left:Aleft,width:Awidth } = block
                    // 记录可能产生的每一根横线可能出现的位置
                    // showTop： 横线出现的位置
                    // top : 拖拽的元素的top值为多少时让这根线出现
                    // B底部对A顶部的情况（当B的底部拖拽到和A的top一样高的时候，显示这根线）
                    lines.x.push({ top:Atop-Bheight,showTop:Atop })
                    // B顶部对A顶部的情况 （当B拖拽到和A的top一样高的时候，显示这根线）
                    lines.x.push({ top:Atop,showTop:Atop })
                    // B中间对A中间的情况（横向）
                    lines.x.push({ top:Atop+Aheight/2-Bheight/2,showTop:Atop+Aheight/2 })
                    // B底部对A底部的情况
                    lines.x.push({ top:Atop+Aheight-Bheight,showTop:Atop+Aheight })
                    // B顶部对A底部的情况
                    lines.x.push({ top:Atop+Aheight,showTop:Atop+Aheight })

                    // 记录纵线可能出现的位置
                    // showLeft： 纵线出现的位置
                    // left : 拖拽的元素的left值为多少时让这根线出现
                    // B右部对A左部的情况
                    lines.y.push({ left:Aleft-Bwidth,showLeft:Aleft })
                    // B左部对A左部的情况
                    lines.y.push({ left:Aleft,showLeft:Aleft })
                    // B中间对A中间的情况（纵向）
                    lines.y.push({ left:Aleft+Awidth/2-Bwidth/2,showLeft:Aleft+Awidth/2 })
                    // B右部对A右部的情况
                    lines.y.push({ left:Aleft+Awidth-Bwidth,showLeft:Aleft+Awidth })
                    // B左部对A右部的情况
                    lines.y.push({ left:Aleft+Awidth,showLeft:Aleft+Awidth })
                })
                

                return lines
            })(),
            dragging:false
        }
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    }
    function mouseMove(e: MouseEvent) {
        let { clientX: moveX, clientY: moveY } = e
        if(!dragState.dragging) {
            dragState.dragging = true
            events.emit('start') // 派发拖拽开始事件(只要触发事件就会记住拖拽前的位置)
        }
        // 计算当前元素最新的left，top . 去线里面，找到应该显示的线
        // 鼠标移动后 - 鼠标移动前 + left
        let left = moveX - dragState.startX + dragState.startLeft;
        let top = moveY - dragState.startY + dragState.startTop;

        let x = null;
        let y = null;
        // 先计算横线 距离参照物元素还有5像素时 显示这根线
        for(let i=0;i<dragState.lines.x.length; i++) {
            const { top: t,showTop:s} = dragState.lines.x[i] // 获取每一根线
            if(Math.abs(t - top) < 5) {
                x = s // 线要显示的位置
                // 实现快速和这个元素贴在一起
                // startY下面计算durX的时候会减掉 (所以这里加上)
                // startTop最终计算top赋值的时候会加上（所以这里减掉）
                moveY = dragState.startY - dragState.startTop + t
                break; // 找到一根线后就跳出循环
            }
        }

        for(let i=0;i<dragState.lines.y.length; i++) {
            const { left: l,showLeft:s} = dragState.lines.y[i] // 获取每一根线
            if(Math.abs(l - left) < 5) {
                y = s // 线要显示的位置

                // 实现快速和这个元素贴在一起
                // 原理同上
                moveX = dragState.startX - dragState.startLeft + l
                break; 
            }
        }
        markLine.x = x // x,y更新了会让试图更新
        markLine.y = y


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
        markLine.x = null
        markLine.y = null
        if(dragState.dragging) {
            events.emit('end') // 派发拖拽结束事件
            dragState.dragging=false
        }
        
    }
    return {
        mouseDown,
        markLine
    }
}