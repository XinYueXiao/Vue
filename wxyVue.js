
class WxyVue {
    constructor(options) {
        //数据相应化
        this.$options = options
        //处理传入data
        this.$data = options.data
        //响应化
        this.observe(this.$data)
        //依赖收集
        new Compiler(options.el, this)
        //执行下钩子函数
        if (options.created) {
            options.created.call(this)
        }
    }
    observe(obj) {
        //遍历必须存在,必须是对象
        if (!obj || Object.prototype.toString.call(obj) !== '[object Object]') {
            return;
        }
        //遍历defineReactive
        Object.keys(obj).forEach(key => {
            this.defineReactive(obj, key, obj[key])
            this.proxyData(key)//添加代理this.$data.foo=>this.foo
        })

    }
    //响应化处理
    defineReactive(obj, key, val) {
        this.observe(val)
        //创建dep和key一一对应
        const dep = new Dep()

        Object.defineProperty(obj, key, {
            //一个局部作用域的一个变量通过一个函数暴露给外界,形成一个闭包.不会被释放,会一直保存着key的值,有效的保存应用的状态
            get() {
                Dep.target && dep.addDep(Dep.target)
                return val
            },
            //直接在set修改data的val值会产生无限循环,通过一个函数定义了一个局部作用域.
            set(newVal) {
                if (newVal == val) { return; }
                val = newVal
                //通知更新
                dep.notify()
            }
        })
    }
    //代理$data
    proxyData(key) {
        //需要给vue的实例定义属性
        Object.defineProperty(this, key, {
            get() {
                return this.$data[key]
            },
            set(newVal) {
                this.$data[key] = newVal
            }
        })
    }
}
//Dep和data中的每一个key对应起来,主要负责管理相关watch
class Dep {
    constructor(key) {
        this.deps = []
    }
    addDep(dep) {
        this.deps.push(dep)
    }

    notify() {
        this.deps.forEach(dep => dep.update())
    }
}
//Watcher:负责创建data中key和更新函数的映射关系
class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm
        this.key = key
        this.cb = cb
        Dep.target = this//把当前的watcher的实例附加到Dep静态属性上
        this.vm[this.key]//触发依赖收集
        Dep.target = null;//防止多次添加到dev
    }

    update() {
        //            上下文            
        this.cb.call(this.vm, this.vm[this.key])
    }

}