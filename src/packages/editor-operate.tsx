import { componentConfigKey, TblockConfig, TeditorConfig } from "@/type/editor";
import { defineComponent, inject, PropType, reactive, watch } from "vue";
import { ElForm, ElInputNumber, ElFormItem, ElButton, ElInput, ElColorPicker, ElSelect, ElOption } from "element-plus";
import deepcopy from "deepcopy";

export default defineComponent({
    props: {
        block: {
            type: Object as PropType<TblockConfig>
        },
        data: {
            type: Object as PropType<TeditorConfig>,
            required: true
        }
    },
    setup(props, ctx) {
        console.log(props.block, props.data)
        const state = reactive<{ editData: any }>({
            editData: {}
        })
        const componentConfig = inject(componentConfigKey)
        const reset = () => {
            if (props.block) {
                state.editData = deepcopy(componentConfig?.componentMap[props.block.key])
            } else {
                state.editData = deepcopy(props.data.container)
            }
            console.log(state.editData)
        }
        watch(() => props.block, reset, { immediate: true })

        // props.block ? 

        // <div>block</div>
        // : 
        // // 没有选中的block，默认渲染容器的配置
        // <ElForm >
        //     
        // </ElForm>  


        return () => {
            const content: any = []
            if (!props.block) {
                content.push(<>
                    <ElFormItem label="容器宽度">
                        <ElInputNumber v-model={state.editData.width}></ElInputNumber>
                    </ElFormItem>
                    <ElFormItem label="容器高度">
                        <ElInputNumber v-model={state.editData.height}></ElInputNumber>
                    </ElFormItem>
                </>)
            } else {
                let component = componentConfig?.componentMap[props.block.key]
                console.log('component',component)
                if (component && component.props) {
                    content.push(Object.entries(component.props).map(([propName, propConfig]: any) => {
                        let map:any = {
                            input: () => <ElInput></ElInput>,
                            color: () => <ElColorPicker></ElColorPicker>,
                            select: () => <ElSelect>
                                {propConfig.options.map((opt: any) => {
                                    return <ElOption label={opt.label} value={opt.value}></ElOption>
                                })}
                            </ElSelect>
                        }
                        return <ElFormItem label={propConfig.label}>
                            {map[propConfig.type]()}
                        </ElFormItem>
                    }))
                }

            }
            return <ElForm labelPosition="top" style={{ padding: '50px' }}>
                {content}
                <ElFormItem>
                    <ElButton type="primary">应用</ElButton>
                    <ElButton type="primary">重置</ElButton>
                </ElFormItem>
            </ElForm>
        }
    }
})