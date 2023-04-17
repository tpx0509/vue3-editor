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
            blockMousedown,
            containerMousedoen,
            lastSelectedBlock
        } = useFocus(editorConfig, (e) => {  // 选中后可能直接就进行拖拽了
            // 获取焦点后进行拖拽
            mouseDown(e) // 点击时的event。
        })

        // 内容区多个元素的拖拽

        const { mouseDown,markLine } = useBlockDragger(focusData,lastSelectedBlock,editorConfig)

        return () => (
            <div class='editor'>
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
                <div class='editor-top'>顶部菜单区</div>
                <div class='editor-right'>右侧自定义区</div>
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
                                editorConfig.value.blocks.map((block,index) => (
                                    <editorBlock
                                        class={block.focus ? 'editor-block__focus' : ''}
                                        block={block}
                                        onMousedown={(e: MouseEvent) => blockMousedown(e, block,index)}
                                    >

                                    </editorBlock>
                                ))
                            }
                            { markLine.x !== null && <div class="line-x" style={{top:markLine.x+'px'}}></div>}
                            { markLine.y !== null && <div class="line-y" style={{left:markLine.y+'px'}}></div>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})