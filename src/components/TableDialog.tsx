import { componentConfig } from "@/type/component";
import deepcopy from "deepcopy";
import { ElDialog,ElTable,ElTableColumn,ElButton,ElInput } from "element-plus";
import { createVNode, defineComponent, PropType, reactive, render, RendererElement, RendererNode, VNode } from "vue";

type TDOptions =  {
    data: any
    componentConf : any
    onConfirm : (newValue:any) => void
}
const tableDialogComponent = defineComponent({
    props:{ 
        options : {
            type: Object as PropType<TDOptions>,
            required : true
        }
    },
    setup(props,ctx) {
        const state = reactive<{
            options: TDOptions,
            isShow:boolean,
            editData : any[] // 编辑的数据
        }>({
            options : props.options,
            isShow : false,
            editData:[]
        })
        const methods = {
            show(options:TDOptions) {
                console.log('options',options)
                state.options = options // 把用户的配置缓存起来
                state.isShow = true 
                state.editData = deepcopy(options.data) // 通过渲染的数据 默认展现
            }
        }
        const add = () => {
            console.log('state.editData',state.editData)
            state.editData.push({})
        }
        const cancel = () => {
             state.isShow = false
        }
        const confirm = () => {
            state.options?.onConfirm(state.editData)
            cancel()
        }
        ctx.expose(methods)
        const tableConfig =  state.options.componentConf
        console.log('state.options',state.options)
        return () => {
            return <ElDialog v-model={state.isShow} title={tableConfig.label}>
                <ElButton onClick={add}>添加</ElButton>
                <ElTable data={state.editData}>
                    {
                        tableConfig.options.options.map((item:any,index:number) => {
                            return <ElTableColumn label={item.label}>
                                {{
                                    default:({row}:any) => <ElInput v-model={row[item.field]}></ElInput>  
                                }}
                            </ElTableColumn>   
                        })
                    }
                </ElTable>
                <div style={{
                    display : 'flex',
                    justifyContent : 'flex-end',
                    marginTop : '15px'
                }}>
                    <ElButton onClick={cancel}>取消</ElButton>
                    <ElButton type="primary" onClick={confirm}>确定</ElButton>
                </div>
            </ElDialog>
        }
    }
})

let vm: VNode<RendererNode, RendererElement, { [key: string]: any; }> | null;
export function $tableDialog(options:TDOptions) {
    
    if(!vm) {
        const el = document.createElement('div');
        vm = createVNode(tableDialogComponent, { options})
        let r = render(vm,el)
        document.body.appendChild(el)
    }
    vm.component?.exposed!.show(options)
}