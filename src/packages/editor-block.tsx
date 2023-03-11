import { componentConfigKey, TblockConfig } from "@/type/editor";
import { computed, defineComponent, inject, PropType } from "vue";
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
        return () => {
            // 通过block的key获取对应的组件
            const component = config?.componentMap[props.block.key]
            const renderComponent = component?.render()
            return <div class='editor-block' style={blockStyles.value}>
                {renderComponent}
            </div>
        }
    }
})