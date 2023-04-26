import { TblockConfig, TeditorConfig } from '@/type/editor';
import { defineComponent, computed, PropType, provide, ref } from 'vue';
import editorBlock from './editor-block';
import './editor.scss';

import { registerConfig as config } from '@/utils/editor-config';
import { componentConfigKey } from '@/type/editor';
import { useMenuDragger } from './useMenuDragger';
import deepcopy from 'deepcopy';
import { useFocus } from './useFocus';
import { useBlockDragger } from './useBlockDragger';
import { useCommands } from './useCommands';
import { $dialog } from '@/components/Dialog';
import { ElButton } from 'element-plus';
import { $dropDown, DropdownItem } from '@/components/Dropdown';
import EditorOperate from './editor-operate';
export default defineComponent({
    props: {
        modelValue: {
            type: Object as PropType<TeditorConfig>,
            required: true
        }
    },
    components: {
        editorBlock
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        provide(componentConfigKey, config)

        const previewRef = ref(false) // 是否处于预览状态
        const isCloseRef = ref(false) // 关闭编辑等
        const editorConfig = computed<TeditorConfig>({
            get(): TeditorConfig {
                return props.modelValue
            },
            set(value: TeditorConfig) {
                emit('update:modelValue', deepcopy(value))
            }
        })
        const containerStyle = computed(() => ({
            width: editorConfig.value.container.width + 'px',
            height: editorConfig.value.container.height + 'px'
        }))
        const containerRef = ref<HTMLElement | null>(null)
        // 左侧菜单的拖拽
        const { dragStart, dragEnd } = useMenuDragger(containerRef, editorConfig)

        // 内容区点击获取焦点
        const {
            focusData,
            lastSelectedBlock,
            blockMousedown,
            containerMousedoen,
            clearBlocksFocus
        } = useFocus(editorConfig, previewRef, (e) => {  // 选中后可能直接就进行拖拽了
            // 获取焦点后进行拖拽
            mouseDown(e) // 点击时的event。
        })

        // 内容区多个元素的拖拽

        const { mouseDown, markLine } = useBlockDragger({ data: focusData, lastSelectedBlock, editorConfig })

        const { commands } = useCommands(editorConfig, focusData)
        const buttons = ref([
            { label: '撤销', handler: commands.undo },
            { label: '重做', handler: commands.redo },
            {
                label: '导出',
                handler: () => {
                    $dialog({
                        title: '导出json',
                        content: JSON.stringify(editorConfig.value)
                    })
                }
            },
            {
                label: '导入',
                handler: () => {
                    $dialog({
                        title: '导入json',
                        content: '',
                        footer: true,
                        onConfirm(strData) {
                            // editorConfig.value = JSON.parse(strData) // 这样直接操作无法入队列,将来不能撤销重做
                            commands.updateContainer(JSON.parse(strData))
                        }
                    })
                }
            },
            { label: '置顶', handler: commands.placeTop },
            { label: '置底', handler: commands.placeBottom },
            { label: '删除', handler: commands.delete },
            {
                label: () => previewRef.value ? '编辑' : '预览', handler: () => {
                    previewRef.value = !previewRef.value
                    clearBlocksFocus()
                }
            },
            { label: '关闭', handler: () => isCloseRef.value = true }
        ])

        const onContextmenu = (e:any,block:TblockConfig) => {
            e.preventDefault()
            $dropDown({
                el:e.target,
                content() {
                    return <>
                        <DropdownItem label='删除' onClick={() => commands.delete()}></DropdownItem>
                        <DropdownItem label='置顶' onClick={() => commands.placeTop()}></DropdownItem>
                        <DropdownItem label='置底' onClick={() => commands.placeBottom()}></DropdownItem>
                        <DropdownItem label='查看' onClick={() => {
                            $dialog({
                                title:'查看节点数据',
                                content: JSON.stringify(block)
                            })
                        }}></DropdownItem>
                        <DropdownItem label='导入' onClick={() => {
                            $dialog({
                                title:'导入节点数据',
                                content: '',
                                footer:true,
                                onConfirm(text) {
                                    text = JSON.parse(text)
                                    commands.updateBlock(text,block)
                                }
                            })
                        }}></DropdownItem>
                    </>
                }
            })
            console.log(block)
        }
        return () => (
            <div class='editor'>
                {
                    isCloseRef.value ?
                        <>
                            {
                                editorConfig.value.blocks.map(block => (
                                    <editorBlock
                                        class='editor-block__preview'
                                        block={block}
                                    >
                                    </editorBlock>
                                ))
                            }
                            <ElButton type='primary' onClick={() => isCloseRef.value = false}>返回编辑</ElButton>
                        </> :
                        <>
                            <div class='editor-left'>
                                {/* 物料区，这里要渲染所有注册的组件列表 */}
                                {
                                    config.componentList.map(component => (
                                        <div
                                            class='editor-left-item'
                                            draggable
                                            onDragstart={(e) => dragStart(e, component)}
                                            onDragend={dragEnd}>
                                            <span class='editor-left-item__label'>{component.label}</span>
                                            <div>{component.preview()}</div>
                                        </div>
                                    ))
                                }
                            </div>
                            <div class='editor-top'>
                                {
                                    buttons.value.map(item => {
                                        const label = typeof item.label === 'function' ? item.label() : item.label;
                                        return <div class='item' onClick={item.handler}>{label}</div>
                                    })
                                }
                            </div>
                            <div class='editor-right'>
                                <EditorOperate block={lastSelectedBlock.value} data={editorConfig.value}></EditorOperate>
                            </div>
                            {/* 负责用padding产生内容区 */}
                            <div class='editor-container' >
                                {/* 负责产生滚动条 */}
                                <div class='editor-container__canvas'>
                                    {/* 放置内容 */}
                                    <div class='editor-container__content'
                                        style={containerStyle.value}
                                        ref={containerRef}
                                        onMousedown={containerMousedoen}>
                                        {
                                            editorConfig.value.blocks.map((block, index) => (
                                                <editorBlock
                                                    class={
                                                        [block.focus && 'editor-block__focus',
                                                        previewRef.value && 'editor-block__preview']
                                                    }
                                                    block={block}
                                                    onMousedown={(e: MouseEvent) => blockMousedown(e, block, index)}
                                                    onContextmenu = { (e:Event) => onContextmenu(e,block)}
                                                >

                                                </editorBlock>
                                            ))
                                        }
                                        {markLine.x !== null && <div class="line-x" style={{ top: markLine.x + 'px' }}></div>}
                                        {markLine.y !== null && <div class="line-y" style={{ left: markLine.y + 'px' }}></div>}
                                    </div>
                                </div>
                            </div>
                        </>
                }

            </div>
        )
    }
})