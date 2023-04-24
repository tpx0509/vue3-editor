import { TblockConfig } from "@/type/editor"
import { ElDialog, ElInput, ElButton } from "element-plus"
import { computed, createVNode, defineComponent, inject, onMounted, onUnmounted, PropType, provide, reactive, ref, render, VNode } from "vue"

type Toption = {
    el: Element, // 以哪个元素为准产生dropdown
    content: () => JSX.Element
}

export const DropdownItem = defineComponent({
    props: {
        label: {
            type : String
        },
        onClick: {
            type: Function as any
        }
    },
    setup(props) {
        let {label} = props
        let hide:any = inject('hide')
         return () => <div class='dropdown-item' onClick={() => {
            props?.onClick()
            hide()
         }}>
            <span>{label}</span>
         </div>
    }
})



const DropdownComponent = defineComponent({
    props: {
        option: {
            type: Object as PropType<Toption>,
            required: true
        }
    },
    setup(props, ctx) {
        const state = reactive({
            isShow: false,
            option: props.option,
            left: 0,
            top: 0
        })
        ctx.expose({
            showDropdown(option: Toption) {
                state.option = option // 更新自己的option。 将来都是用这一个组件实例，只是option不同
                state.isShow = true
                let { left, top, height } = option.el.getBoundingClientRect()
                state.left = left
                state.top = top + height
            }
        })
        provide('hide',() => state.isShow=false)
        const classes = computed(() => [
            'dropdown',
            {
                'dropdown-isShow': state.isShow
            }
        ])
        const styles = computed(() => ({
            'left': state.left + 'px',
            'top': state.top + 'px'
        
        }))
        const el = ref<Element|null>(null)
        const onMousedownDocument = (e:any) => {
            if (!el.value!.contains(e.target)) {
                state.isShow = false
            }
        }
        onMounted(() => {
            document.addEventListener('mousedown', onMousedownDocument,true)
        })
        onUnmounted(() => {
            document.addEventListener('mousedown', onMousedownDocument,true)
        })
        return () => {
            return <div class={classes.value} style={styles.value} ref={el} >
                {state.option.content()}
            </div>
        }
    }
})

let vnode: VNode | null = null
export function $dropDown(option: Toption) {
    if (!vnode) {
        // 创建真实节点
        let el = document.createElement('div')
        // 创建虚拟节点
        vnode = createVNode(DropdownComponent, { option })
        // 将vnode渲染到真实节点上
        render(vnode, el)
        // 将真实节点扔到页面上
        document.body.appendChild(el)
    }
    // 创建过一次了，就只让它显示就好
    vnode.component?.exposed!.showDropdown(option)
}