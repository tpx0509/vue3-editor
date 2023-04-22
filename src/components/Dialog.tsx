import { ElDialog, ElInput,ElButton } from "element-plus"
import { createVNode, defineComponent, PropType, reactive, render, VNode } from "vue"

type Toption = {
    title: string,
    content: string,
    footer?:boolean,
    onConfirm?:(content:string) => void
}
const DialogComponent = defineComponent({
    props: {
        option: {
            type: Object as PropType<Toption>,
            required:true
        }
    },
    setup(props, ctx) {
        const state = reactive({
            isShow: false,
            option: props.option
        })
        ctx.expose({
            showDialog(option: Toption) {
                state.option = option // 更新自己的option。 将来都是用这一个组件实例，只是option不同
                state.isShow = true
            }
        })

        const onCancel = () => state.isShow = false
        const onConfirm = () => {
            state.isShow = false
            state.option.onConfirm?.(state.option.content)
        } 
        return () => {

            return <ElDialog v-model={state.isShow} {...props.option} >
                {
                    {
                        default: () => <ElInput 
                        type="textarea" 
                        v-model={state.option.content}
                        autosize={true}
                        ></ElInput>,
                        footer:() => state.option.footer && <div>
                            <ElButton onClick={onCancel}>取消</ElButton>
                            <ElButton type="primary" onClick={onConfirm}>确定</ElButton>
                        </div>
                    }
                }
            </ElDialog>
        }
    }
})

let vnode: VNode | null = null
export function $dialog(option: Toption) {
    if (!vnode) {
        // 创建真实节点
        let el = document.createElement('div')
        // 创建虚拟节点
        vnode = createVNode(DialogComponent, { option })
        // 将vnode渲染到真实节点上
        render(vnode, el)
        // 将真实节点扔到页面上
        document.body.appendChild(el)
    }
    // 创建过一次了，就只让它显示就好
    vnode.component?.exposed!.showDialog(option)
}