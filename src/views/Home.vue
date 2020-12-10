<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  created () {
    console.log('组件实例对象的 $options 选项没有 router 属性')
    console.log(this)
  },
  components: {
    HelloWorld
  }
}
</script>
