import { TeditorConfig } from '@/type/editor';
import { defineComponent, computed, PropType, provide } from 'vue';
import editorBlock from './editor-block';
import './editor.scss';

import { registerConfig as config } from '@/utils/editor-config';
import { componentConfigKey } from '@/type/editor';
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
            set(value: any) {
                emit('update:modelValue', value)
            }
        })
        const containerStyle = computed(() => ({
            width: editorConfig.value.container.width + 'px',
            height: editorConfig.value.container.height + 'px'
        }))
        return () => (
            <div class='editor'>
                <div class='editor-left'>
                    {/* 物料区，这里要渲染所有注册的组件列表 */}
                    {
                        config.componentList.map(component => (
                            <div class='editor-left-item'>
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
                        <div class='editor-container__content' style={containerStyle.value}>
                            {
                                editorConfig.value.blocks.map(block => (<editorBlock block={block}></editorBlock>))
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})