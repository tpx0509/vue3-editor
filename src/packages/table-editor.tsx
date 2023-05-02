import { componentConfig } from "@/type/component";
import { ElButton, ElTag } from "element-plus";
import { computed, defineComponent, PropType, reactive } from "vue";
import { $tableDialog } from "@/components/TableDialog";
import deepcopy from "deepcopy";

export default defineComponent({
    props: {
        propConfig: {
            type : Object ,
            required:true
        },
        modelValue:{
            type : Array
        }
    },
    emits:['update:modelValue'],
    setup(props,ctx) {
        const add =() => {
            $tableDialog({
               data: data.value,
               componentConf:props.propConfig,
               onConfirm(newValue:any) { // 保存操作
                   data.value = newValue
               }
            })
       }
       const data = computed<any[]>({
          get() {
            return props.modelValue || []
          },
          set(newValue) {
            ctx.emit('update:modelValue',deepcopy(newValue))
          }
       })
        console.log('propconfig',props.propConfig)
        console.log('modelValue',props.modelValue)
        return () => {
            if(!data.value || !data.value.length) {
                return <ElButton onClick={add}>请选择</ElButton>    
            }
            {
                return data.value.map(item => {
                   return <ElTag style={{ margin : '0 3px'}} onClick={add}>{item[props.propConfig.options.key]}</ElTag>  
                })
            }
        }
    }
})