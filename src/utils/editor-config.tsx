import Range from "@/components/Range";
import { componentConfig } from "@/type/component"

import { ElInput,ElButton, ElSelect,ElOption } from 'element-plus';

function createEditorConfig() {
     let componentList:componentConfig[] = []
     let componentMap:{
        [key:string] : componentConfig
     } = {} as any
     return {
        componentList,
        componentMap,
        register(component:componentConfig) {
            componentList.push(component)
            componentMap[component.key] = component
        }
     }
}

let registerConfig = createEditorConfig()

const createInputProp = (label:string) => ({ type : 'input', label})
const createColorProp = (label:string) => ({ type : 'color', label})
const createSelectProp = (label:string,options:{label:string,value:string|number}[]) => ({ type : 'select', label,options})
const createTableProp = (label:string,options:any) => ({ type: 'table',label,options})
registerConfig.register({
    label:'文本',
    preview : () => (<span>这是一个预览文本</span>),
    render : ({props}) => (<span style={{
        fontSize : props.size,
        color : props.color
    } as any}>{props.text||'渲染文本'}</span>),
    key : 'text',
    props:{
        text: createInputProp('文本内容'),
        color : createColorProp('字体颜色'),
        size : createSelectProp('字体大小',[
            {label:'14px',value:'14px'},
            {label:'20px',value:'20px'},
            {label:'24px',value:'24px'},
            {label:'26px',value:'26px'}
        ])
    }
})
registerConfig.register({
    label:'按钮',
    preview : () => (<ElButton>预览按钮</ElButton>),
    render : ({props}) => (<ElButton type={props.type as any} size={props.size as any}>{props.text||'渲染按钮'}</ElButton>),
    key : 'button',
    props: {
        text: createInputProp('按钮内容'),
        type : createSelectProp('按钮类型',[
            {label:'基础',value:'primary'},
            {label:'成功',value:'success'},
            {label:'警告',value:'warning'},
            {label:'危险',value:'danger'},
            {label:'文本',value:'text'}
        ]),
        size : createSelectProp('按钮尺寸',[
            {label:'默认',value:''},
            {label:'中等',value:'default'},
            {label:'小的',value:'large'},
            {label:'极小',value:'small'}
        ])
    }
})
registerConfig.register({
    label:'输入框',
    preview : () => (<ElInput placeholder="这是一个预览输入框"></ElInput>),
    render : ({model}) => (<ElInput placeholder="这是一个渲染输入框" {...model.default}></ElInput>),
    key : 'input',
    props: {},
    model: {
        default :'绑定字段',
    }
})
registerConfig.register({
    label:'范围选择器',
    preview : () => <Range></Range>,
    render : ({model}) => {
       return <Range {...{
         start : model.start?.modelValue,
         end : model.end?.modelValue,
         'onUpdate:start' : model.start?.['onUpdate:modelValue'],
         'onUpdate:end' : model.end?.['onUpdate:modelValue']
       }}></Range> 
    },
    key : 'range',
    model: {
        start :'开始范围字段',
        end:'结束范围字段'
    }
})
registerConfig.register({
    label:'下拉选择器',
    preview : () => <ElSelect modelValue='请选择'></ElSelect>,
    render : ({props,model}) =>{
        console.log('props',props)
        console.log('model',model)
        return <ElSelect {...model.default}>
            { props.table && props.table.map((item:any,index:number) => {
                return <ElOption value={item.value}>{item.label}</ElOption> 
            })}
        </ElSelect>
           
    } ,
    key : 'select',
    props:{
        table : createTableProp('下拉选项',{
            options : [
                { label : '显示值', field : 'label' },
                { label : '绑定值', field : 'value' }
            ],
            key : 'label' // 显示给用户的值 是label值
        })
    },
    model:{
        default:'应用字段'
    }
})


type TcomponentConfig = ReturnType<typeof createEditorConfig>
export { registerConfig,TcomponentConfig }