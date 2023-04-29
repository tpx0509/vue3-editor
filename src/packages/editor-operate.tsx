import { componentConfigKey, TblockConfig, TeditorConfig } from "@/type/editor";
import { defineComponent, inject, PropType, reactive, watch } from "vue";
import { ElForm, ElInputNumber, ElFormItem, ElButton, ElInput, ElColorPicker, ElSelect, ElOption } from "element-plus";
import deepcopy from "deepcopy";

export default defineComponent({
    props: {
        block: { // 当前选中的block
            type: Object as PropType<TblockConfig>
        },
        data: { // 整个data
            type: Object as PropType<TeditorConfig>,
            required: true
        },
        updateContainer:{ // 更新容器方法
            type: Function,
            required:true
        },
        updateBlock:{ // 更新block方法
            type : Function,
            required:true
        }
    },
    setup(props, ctx) {
        console.log(props.block, props.data)
        const state = reactive<{ editData: any }>({
            editData: {}
        })
        const componentConfig = inject(componentConfigKey)
        const reset = () => {
            if (!props.block) { // 默认绑定容器的宽度高度
                state.editData = deepcopy(props.data.container)
            } else {
                state.editData = deepcopy(props.block)
            }
            console.log('操作栏数据 => ',state.editData)
        }

        const apply =() => {
            if(!props.block) { // 更新整个容器的宽高
                props.updateContainer({ ...props.data,container:state.editData }) // 接受的是整个容器对象，替换container为新的数据
            }else { // 更新block的配置
               props.updateBlock(state.editData,props.block) // 传入新的，旧的
            }
        }
        watch(() => props.block, reset, { immediate: true })
        watch(() => props.data, reset)
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
                console.log('state.editData',state.editData.props)
                if (component && component.props) {
                    content.push(Object.entries(component.props).map(([propName, propConfig]: any) => {
                        let map:any = {
                            input: () => <ElInput v-model={state.editData.props[propName]}></ElInput>,
                            color: () => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,
                            select: () => <ElSelect v-model={state.editData.props[propName]}>
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
                if(component && component.model) {
                    
                    content.push(Object.entries(component.model).map(([modelName,label]) => {
                        return <ElFormItem label={label}>
                            <ElInput v-model={state.editData.model[modelName]}></ElInput>
                        </ElFormItem>
                    }))
                }

            }
            return <ElForm labelPosition="top" style={{ padding: '50px' }}>
                {content}
                <ElFormItem>
                    <ElButton type="primary" onClick={apply}>应用</ElButton>
                    <ElButton type="primary" onClick={reset}>重置</ElButton>
                </ElFormItem>
            </ElForm>
        }
    }
})