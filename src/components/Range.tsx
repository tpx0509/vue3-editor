import { computed, defineComponent } from "vue";

export default defineComponent({
    props:{
        start: {
            type : Number
        },
        end: {
            type : Number
        }
    },
    emits:['update:start','update:end'],
    setup(props,ctx) {
        const start = computed({
            get() {
                return props.start
            },
            set(newValue) {
                ctx.emit('update:start',newValue)
            }
        })
        const end = computed({
            get() {
                return props.end
            },
            set(newValue) {
                ctx.emit('update:end',newValue)
            }
        })
        return () => {
            return <div class="range-component">
                <input type="number" v-model={start.value} />
                <span>~</span>
                <input type="number" v-model={end.value} />
            </div>
        }
    }
})