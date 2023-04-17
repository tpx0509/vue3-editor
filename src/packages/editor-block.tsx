import { componentConfigKey, TblockConfig } from "@/type/editor";
import { computed, defineComponent, inject, onMounted, PropType, ref } from "vue";
export default defineComponent({
    props: {
        block: {
            type: Object as PropType<TblockConfig>,
            required: true
        }
    },
    setup(props) {
        const config = inject(componentConfigKey)
        const blockStyles = computed(() => ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
            zIndex: props.block.zIndex,
        }))
        const blockRef = ref()
        onMounted(() => {
            let { offsetHeight, offsetWidth } = blockRef.value
            if (props.block.dragAlignCenter) {
                // 只有在拖拽松手的时候，让组件可以居中，其他默认渲染的不需要改变top，left值
                // 改变top，left
                // 原则上改props要派发事件。
                props.block.left = props.block.left - offsetWidth / 2
                props.block.top = props.block.top - offsetHeight / 2
                props.block.dragAlignCenter = false
            }
            props.block.width =offsetWidth
            props.block.height = offsetHeight
        })
        return () => {
            // 通过block的key获取对应的组件
            const component = config?.componentMap[props.block.key]
            const renderComponent = component?.render()
            return <div
                class='editor-block'
                style={blockStyles.value}
                ref={blockRef}
            >
                {renderComponent}
            </div>
        }
    }
})