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
        const childNodes = el.childNodes;
        Array.from(childNodes).forEach(node => {
            //判断节点类型
            if (this.isElement(node)) {

                this.compaileElement(node)

            } else if (this.isInter(node)) {
                this.compileText(node)
            }
            //递归可能存在的子元素
            this.compaile(node)
        })
    }
    isElement(node) {
        return node.nodeType === 1
    }
    isInter(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    //编译插值文本
    compileText(node) {
        this.update(node, RegExp.$1, 'text')
    }
    //update函数:负责更新dom,同时创建watcher实例在两者之间挂钩
    update(node, exp, dir) {
        //首次初始化
        const updaterFn = this[dir + 'Updater']
        //
        updaterFn && updaterFn(node, this.$vm[exp])
        //更新
        new Watcher(this.$vm, exp, function (value) {
            updaterFn && updaterFn(node, value)
        })
    }
    textUpdater(node, value) {
        node.textContent = value
    }
    //编译
    compaileElement(node) {
        //获取属性
        const nodeAttrs = node.attributes
        //k-text=‘exp'
        Array.from(nodeAttrs).forEach(attr => {
            const attrName = attr.name //k-text
            const exp = attr.value  //exp
            if (this.isDirective(attrName)) {
                //截取变量名字
                const dir = attrName.substring(2) //text
                //执行相应的更新函数
                this[dir] && this[dir](node, exp)
            }

        })
    }
    //判断是不是指令
    isDirective(attr) {
        return attr.indexOf('k-') == 0
    }
    text(node, exp) {
        this.update(node, exp, 'text')
    }
}