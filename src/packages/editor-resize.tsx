import { componentConfig } from "@/type/component";
import { TblockConfig } from "@/type/editor";
import { defineComponent, PropType } from "vue";
type Direction = {
    horizontal : string,
    vertical:string
}
type TmouseMouse = {
    startX: number,
    startY: number,
    startWidth : number,
    startHeight : number,
    startLeft : number,
    startTop: number,
    direction : Direction
}
export default defineComponent({
    props: {
        config: {
            type: Object as PropType<componentConfig>,
            required: true
        },
        blockData: {
            type : Object as PropType<TblockConfig>,
            require: true
        }
    },
    setup(props) {
        let startData: TmouseMouse = {} as any;
        const onMousedown = (e:MouseEvent,direction:Direction) =>  {
            startData = {
                startX: e.clientX,
                startY: e.clientY,
                startWidth : props.blockData!.width,
                startHeight : props.blockData!.height,
                startLeft : props.blockData!.left,
                startTop: props.blockData!.top,
                direction
            }
            e.stopPropagation()
            document.addEventListener('mousemove',onMousemove)
            document.addEventListener('mouseup',onMouseup)
            console.log('startData',startData)
        }
        const onMousemove = (e:MouseEvent) => {
            let { clientX,clientY } = e
            let { startX,startY,startWidth,startHeight,startLeft,startTop,direction } = startData
            
            // 选中的是水平中间位置的点时,另一个方向的拖动无效
            if(direction.horizontal === 'center') {
                clientX = startX
            }
            // 同理 只能改横向，纵向是不变化的
            if(direction.vertical === 'center') {
                clientY = startY
            }
            // 移动的距离
            let durX = clientX - startX
            let durY = clientY - startY


            // 如果是拉动水平方向的起始位置，要取反,同时改变left值
            if(direction.horizontal === 'start') { 
                durX = -durX
                props.blockData!.left = startLeft - durX
            }
            // 如果是拉动垂直方向的起始位置，也要取反，同时改变top值
            if(direction.vertical === 'start') {
                durY = -durY
                props.blockData!.top = startTop - durY
            }
            const width = startWidth + durX
            const height = startHeight + durY
            props.blockData!.width = width
            props.blockData!.height = height // 拖拽时改变宽高
            props.blockData!.isResize = true  // 改变了宽高标识，触发重新渲染
        }
        const onMouseup = () => {
            document.removeEventListener('mousemove',onMousemove)
            document.removeEventListener('mouseup',onMouseup)
            startData = {} as any
        }
        const { width, height } = props.config.resize!
        return () => {
            return <div class='editor-wrapper'>
                {
                    width && <>
                        <div onMousedown={(e) => onMousedown(e,{ horizontal:'start',vertical:'center' })} class='editor-resize editor-resize-left'></div>
                        <div onMousedown={(e) => onMousedown(e,{ horizontal:'end',vertical:'center' })} class='editor-resize editor-resize-right'></div>
                    </>
                }
                {
                height && <>
                    <div onMousedown={(e) => onMousedown(e,{ horizontal:'center',vertical:'start' })} class='editor-resize editor-resize-top'></div>
                    <div onMousedown={(e) => onMousedown(e,{ horizontal:'center',vertical:'end' })} class='editor-resize editor-resize-bottom'></div>
                </>
                }
                {
                    width && height && <>
                        <div onMousedown={(e) => onMousedown(e,{ horizontal:'start',vertical:'start' })} class='editor-resize editor-resize-left-top'></div>
                        <div onMousedown={(e) => onMousedown(e,{ horizontal:'start',vertical:'end' })} class='editor-resize editor-resize-left-bottom'></div>
                        <div onMousedown={(e) => onMousedown(e,{ horizontal:'end',vertical:'start' })} class='editor-resize editor-resize-right-top'></div>
                        <div onMousedown={(e) => onMousedown(e,{ horizontal:'end',vertical:'end' })} class='editor-resize editor-resize-right-bottom'></div>
                    </>
                }
            </div>

        }
    }
})