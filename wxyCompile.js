//compiler:遍历模版,分析其中哪些地方用到了data中的key以及事件等指令
//这时认为是一个依赖,创建一个Watcher实例,使界面中的dom更新函数和key挂钩,
//如果更新了key,则执行这个更新函数
class Compiler {
    //el:宿主元素选择器
    //vm Vue实例
    constructor(el, vm) {
        this.$vm = vm
        this.$el = document.querySelector(el)
        //执行编译
        this.compaile(this.$el)
    }
    compaile(el) {
        const childNodes = el.childNodes
        Array.from(childNodes).forEach(node => {
            //判断节点类型
            if (this.isElement(node)) {
                //解析节点
                this.compaileElement(node)
            } else if (this.isInter(node)
                //判断是否是text
            ) {
                //解析text
                this.compileText(node)
            }
            //递归可能存在的子元素
            this.compaile(node)
        });
    }
    //判断是否是节点函数
    isElement(node) {
        return node.nodeType === 1
    }
    //判断是否是text
    isInter(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }

    //编译插值文本
    compileText(node) {
        this.update(node, RegExp.$1, 'text');
    }

    //update函数:负责更新dom,同时创建watcher实例在两者之间挂钩
    update(node, exp, dir) {
        //首次初始化根据传入类型找到相应的函数 this[dir]
        const updaterFn = this[dir + 'Updater']
        //执行updaterFn修改node
        updaterFn && updaterFn(node, this.$vm[exp])
        //新建Watcher，更新
        new Watcher(this.$vm, exp, function (value) {
            updaterFn && updaterFn(node, value)
        })
    }
    textUpdater(node, value) {
        node.textContent = value
    }
    htmlUpdater(node, value) {
        node.innerHTML = value
    }
    modelUpdater(node, value) {
        node.value = value
    }
    //解析节点
    compaileElement(node) {
        //获取属性
        const nodeAttrs = node.attributes
        //k-text=‘exp'
        Array.from(nodeAttrs).forEach(attr => {
            //k-text
            const type = attr.name
            //exp
            const exp = attr.value
            //判断是v-
            if (this.isDirective(type)) {
                //截取变量名字
                const direName = type.substring(2)
                //执行相应的更新函数
                this[direName] && this[direName](node, exp, direName)
            } else if (this.isEvent(type)) {
                //截取变量名字@click
                const direName = type.substring(1)
                //click
                this.eventHandler(node, this.$vm, exp, direName)
            }
        })

    }
    //判断是不是指令
    isDirective(attr) {
        return attr.indexOf('k-') > -1
    }
    isEvent(attr) {
        return attr.indexOf('@') > -1
    }
    text(node, exp) {
        this.update(node, exp, 'text')
    }
    html(node, exp) {
        this.update(node, exp, 'html')
    }
    model(node, exp) {
        this.update(node, exp, 'model')
    }
    eventHandler(node, vm, exp, dir) {
        //验证是否是否有这个方法，有则获取这个函数
        const fn = vm.$options.methods && vm.$options.methods[exp]
        if (dir && fn) {
            //存在给node添加时间监听 事件名称  函数      阻止冒泡
            node.addEventListener(dir, fn.bind(vm), false)
        }
    }
}