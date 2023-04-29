<template>
  <editor v-model="state" :formData="formData"></editor>
</template>

<script lang="ts" setup>
import data from "./data.json";
import editor from "./packages/editor";
import { ref } from "vue";
import { TeditorConfig } from './type/editor';

let state = ref<TeditorConfig>(data);

const formData = ref({
  username : 'tpx',
  password : '123'
})

</script>

<style lang="scss">
#app {
  position: fixed;
  left: 20px;
  right: 20px;
  bottom: 20px;
  top: 20px;
}
</style>
