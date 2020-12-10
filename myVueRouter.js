let _Vue = null

export default class VueRouter {
  // install 静态方法参数是 Vue 的构造函数
  static install(Vue) {
    console.log('这是 Vue 的构造函数')
    console.log(Vue)
    // 1. 判断当前产插件是否已经被安装
    if (VueRouter.install.installed) {
      return
    }
    VueRouter.install.installed = true
    // 2. 把 Vue 构造函数记录到全局变量
    _Vue = Vue
    // 3. 把创建 Vue 实例时候传入的 router 对象注入到 Vue 实例上
    _Vue.mixin({
      beforeCreate() {
        // 判断是 Vue 根实例还是 Vue 组件，组件不需要重复注入，第一次实例化 Vue 注入即可
        if (this.$options && this.$options.router) {
          // 只有 Vue 根实例的 $options 选项才有 router 属性
          console.log('只有根组件 Vue 实例对象的 $options 选项有 router 属性，因为在实例化根组件 Vue 实例对象的时候才传入 router 属性')
          console.log(this)
          _Vue.prototype.$router = this.$options.router
          // 调用定义好的 init 初始化方法 
          this.$options.router.init()
        }
      }
    })
  }

  constructor(options) {
    this.options = options
    this.routeMap = {}
    // observable 方法是 Vue 提供的能够将对象定义为响应式的一个方法
    this.data = _Vue.observable({
      current: '/'
    })
  }

  init() {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  createRouteMap() {
    // 遍历所有的路由规则，把路由规则解析成键值对的形式储存到 routeMap 中
    this.options.routes.forEach(route => {
      // 键 -> 值
      // 路由地址 -> 组件
      this.routeMap[route.path] = route.component
    })
  }

  // 实现这个 initComponents 方法时参数需要传 Vue 实例
  // 也可以通过全局变量 _Vue 获取，这里为了减少该方法对外部变量的依赖，使用传递 Vue 实例的方式
  initComponents(Vue) {
    // 获取传入的路由模式
    const mode = this.options.mode === 'history' ? 'history' : 'hash'
    Vue.component('router-link', {
      props: {
        to: String
      },
      //template: '<a :href="to"><slot></slot></a>'
      render(h) {
        return h('a', {
          attrs: {
            // 增加对 hash 路由模式的处理
            href: mode === 'history' ? this.to : `/#${this.to}`
          },
          on: {
            click: this.clickHandler
          }
        }, [this.$slots.default])
      },
      methods: {
        clickHandler(e) {
          // hash 模式下不需要重写 a 标签默认行为，这里直接返回
          if (mode === 'hash') return
          // history 模式下改变浏览器地址栏 url
          window.history.pushState({}, '', this.to)
          // 设置当前路由地址到 VueRouter 实例的响应式属性 data 中，data 的成员改变，成员所对应的组件也会自动更新
          this.$router.data.current = this.to
          // history 模式下阻止 a 标签默认行为
          e.preventDefault()
        }
      }
    })

    // 获取 VueRouter 实例
    const self = this
    Vue.component('router-view', {
      render(h) {
        // 获取当前路由对应的组件
        const component = self.routeMap[self.data.current]
        return h(component)
      }
    })
  }

  initEvent() {
    // 对路由模式的判断以及处理，对浏览器前进后退的处理
    if (this.options.mode && this.options.mode === 'history') {
      // 监听浏览器前进后退触发的 popstate 事件，手动更改 current，触发更新组件视图
      window.addEventListener('popstate', () => {
        this.data.current = window.location.pathname
      })
    } else {
      // hash 模式
      // 判断是否已存在 hash 符号，不存在则添加 #/
      window.location.hash ? '' : window.location.hash = '/'
      // 第一次加载的时候对 hash 路由进行渲染
      window.addEventListener('load', () => {
        this.data.current = window.location.hash.slice(1)
      })
      // 监听 hash 变化
      window.addEventListener('hashchange', () => {
        // 这里因为是 hash 模式，所以 location.hash 的值是 #/ 开头的字符串 
        // 这里用 slice 截取去掉 #，赋值给 current，根据 routeMap 键值对触发组件的渲染
        this.data.current = window.location.hash.slice(1)
        console.log('hash 改变')
      })
    }
  }
}