import { componentConfig } from "@/type/component"

import { ElInput,ElButton } from 'element-plus';

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

registerConfig.register({
    label:'文本',
    preview : () => (<span>这是一个预览文本</span>),
    render : () => (<span>这是一个渲染文本</span>),
    key : 'text'
})
registerConfig.register({
    label:'输入框',
    preview : () => (<ElInput placeholder="这是一个预览输入框"></ElInput>),
    render : () => (<ElInput placeholder="这是一个渲染输入框"></ElInput>),
    key : 'input'
})
registerConfig.register({
    label:'按钮',
    preview : () => (<ElButton>预览按钮</ElButton>),
    render : () => (<ElButton>渲染按钮</ElButton>),
    key : 'button'
})

type TcomponentConfig = ReturnType<typeof createEditorConfig>
export { registerConfig,TcomponentConfig }