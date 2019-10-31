
class WxyVue {
    constructor(options) {
        this.$options = options
        this.$data = options.data
        //响应化
        this.observe(this.$data)

    }
    observe(obj) {
        //遍历必须存在,必须是对象
        if (!obj || Object.prototype.toString.call(obj) !== '[object Object]') {
            return;
        }
        //遍历defineReactive
        Object.keys(obj).forEach(key => {
            this.defineReactive(obj, key, obj[key])
        })

    }
    //响应化处理
    defineReactive(obj, key, val) {
        this.observe(val)
        Object.defineProperty(obj, key, {
            //一个局部作用域的一个变量通过一个函数暴露给外界,形成一个闭包.不会被释放,会一直保存着key的值,有效的保存应用的状态
            get() {
                return val
            },
            //直接在set修改data的val值会产生无限循环,通过一个函数定义了一个局部作用域.
            set(newVal) {
                if (newVal == val) return;
                val = newVal
            }
        })
    }
}
