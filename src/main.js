import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
//import ElementUI from 'element-ui'
import {
    Autocomplete,
    Button,
    Dialog,
    Table,
    Icon,
    Upload,
    Input,
    Select,
    Option,
    Pagination,
    MessageBox,
    Form,
    Dropdown,
    DropdownMenu,
    Checkbox,
    Tooltip,
    Breadcrumb,
    Message,
    CheckboxGroup,
    DatePicker,
    Row,
    Col,
    Radio,
    RadioGroup,
    BreadcrumbItem,
    DropdownItem,
    Menu,
    Submenu,
    MenuItem,
    FormItem,
    Loading,
    TableColumn,
    Collapse,
    CollapseItem,
    RadioButton
} from 'element-ui'
// import 'element-ui/lib/theme-default/index.css'
import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
import {setRouter} from "./common/js/util"
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
import './styles/iconfont.css'
import './styles/myfonticon/iconfont.css'


//本地模拟服务器返回数据进行测试,暂时没有必要
// import Mock from './mock'
// Mock.bootstrap();


import 'font-awesome/css/font-awesome.min.css'
import TreeView from "vue-json-tree-view"

//Vue.use(ElementUI)
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(TreeView);
Vue.use(Autocomplete);


Vue.use(Dialog);
Vue.use(Pagination);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(Submenu);
Vue.use(Input);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(RadioButton);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Select);
Vue.use(Option);
Vue.use(Button);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(DatePicker);
Vue.use(Tooltip);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Icon);
Vue.use(Row);
Vue.use(Col);
Vue.use(Upload);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Loading.directive)


Vue.prototype.$loading = Loading.service
Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message

//NProgress.configure({ showSpinner: false });

/*判断数组里面是否含有某一项*/
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

const router = new VueRouter({
    routes
})
setRouter(router);

router.beforeEach((to, from, next) => {
    //NProgress.start();
    // sessionStorage.removeItem('token');
    // if (to.path == '/login') {

    //     localStorage.removeItem('token');

    // }
    //let token = sessionStorage.getItem('token');

    let token = localStorage.getItem('token');
    if (!token) {
        // 检测url里是否存在token
        let url = window.location.href;
        let index = url.search(/token/) + 6;
        if (index !== 5) {
            console.log(index)
            let str1 = url.substr(index);
            let end = str1.search(/&/)
            if (end !== -1) {
                str1 = str1.substr(0, end)
            }
            token = str1
            window.localStorage.setItem('token', token);
        }
    }
    if (!token && to.path != '/login') {
        next({path: '/login'});
    } else {
        next()
    }
})

//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
    //el: '#app',
    //template: '<App/>',
    router,
    store,
    //components: { App }
    render: h => h(App)
}).$mount('#app')

