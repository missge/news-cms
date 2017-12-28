<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <template>
                    <el-select v-model="language" placeholder="请选择语言" @change="getLang">
                        <el-option v-for="item in languageTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <template>
                    <el-select v-model="filters.menuId" placeholder="请选择分类" @change="getMenuId">
                        <el-option v-for="item in MenuIdOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>

                <el-form-item>
                    <el-input v-model="filters.title" placeholder="标题"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.articleId" placeholder="文章Id"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" v-on:click="getUsers">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="articleList" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="index" label="序号" width="70">
            </el-table-column>
            <el-table-column prop="articleId" label="文章id" width="160" >
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="140" >
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="dark" :content="scope.row.title" placement="top-end">
                        <div class="sTitle"> {{scope.row.title}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="commentCount" label="评论总数" width="140" >
            </el-table-column>
            <el-table-column label="查看" width="150">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit2(scope.$index, scope.row)">查看列表</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

    </section>
</template>

<script>
    import util, {dateFormat} from '../../common/js/util'
    import {removeUser, batchRemoveUser, editUser, addUser} from '../../api/api';
    import {getViewMainList} from "../../api/api";
    import {getMenu} from "../../api/api";

    export default {
        data() {
            return {
                menuList: [],
                menuValue: "",
                menuLabel: "",

                //下拉菜单
                MenuIdOptions: [],

                languageTypeOptions: [{
                    value: 'zh',
                    label: '中文'
                }, {
                    value: 'en',
                    label: '英文'
                }, {
                    value: 'fr',
                    label: '法文'
                },
                    {
                        value: 'ar',
                        label: '阿拉伯文'
                    }, {
                        value: 'ru',
                        label: '俄文'//俄文
                    }, {
                        value: 'sp',
                        label: '西班牙文'
                    }, {
                        value: 'de',
                        label: '德文'
                    }, {
                        value: 'ko',
                        label: '韩文'
                    }, {
                        value: 'ja',
                        label: '日文'
                    }],
                value: '',

                titles: '',
                language: "",
                filtersOther: {
                    articleId: '',
                },
                filters: {
                    type: '',
                    title: '',
                    menuId: '',
                    articleId: '',
                    liveStatus: '',
                    // startTime: new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000)),
                    startTime: 1504195200000,
                    endTime: new Date(),

                },
                articleList: [],
                total: 0,
                page: 1,
                size: 10,
                listLoading: false,
                sels: [],//列表选中列
                // maxStartTime:'',

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                editForm: {
                    viewStatus: '先发后审',
                    name: '',
                    sex: -1,
                    age: 0,
                    birth: '',
                    addr: ''
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //新增界面数据
                addForm: {
                    name: '',
                    sex: -1,
                    age: 0,
                    birth: '',
                    addr: ''
                },
                timeValue: "",
                langloading: ''
            }
        },
        methods: {
            getMenuId(value) {
                for (var j in this.MenuIdOptions) {
                    if (this.MenuIdOptions[j].value == value) {
                        this.titles = this.MenuIdOptions[j].label
                        console.log(this.titles)
                    }
                }

            },
            getLang(value) {
                this.language = value;
                this.getLanguage();
            },
            getLanguage() {
                let para = {
                    language: this.language
                };
                this.langloading = true;
                getMenu(para).then((data) => {
                    var subscribed = data.subscribed;
                    var strong = data.strong;
                    var noSubscribed = data.noSubscribed;
                    for (var i in strong) {
                        this.MenuIdOptions.push({'label': strong[i].title, 'value': strong[i].menuId});
                    }
                    for (var i in subscribed) {
                        this.MenuIdOptions.push({'label': subscribed[i].title, 'value': subscribed[i].menuId});
                    }
                    for (var i in noSubscribed) {
                        this.MenuIdOptions.push({'label': noSubscribed[i].title, 'value': noSubscribed[i].menuId});
                    }

                    this.langloading = false;
                    //NProgress.done();
                }).catch(message => {
                    this.langloading = false;
                    this.$message.error(message);
                });
                this.MenuIdOptions = [];
                this.filters.menuId = ""
            },
            //时间戳改成标准时间
            dateFormat: dateFormat,
            handleCurrentChange(val) {
                this.page = val;
                this.getUsers();
            },
            //获取用户列表
            getUsers() {
                let filters = {};
                for (let name in this.filters) {

                    if (this.filters[name]) {
                        filters[name] = this.filters[name];
                        //时间改为时间戳
                        filters.startTime = new Date(this.filters.startTime).getTime();
                        filters.endTime = new Date(this.filters.endTime).getTime();
                    }
                    ;
                }

                let para = {
                    page: this.page - 1,
                    size: this.size,
                    ...filters
                };
                this.listLoading = true;
                getViewMainList(para).then((data) => {
                    this.total = data.total;
                    this.articleList = data.articleList;
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {id: row.id};
                    removeUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();

                    }).catch(message => {
                        this.listLoading = false;
                        this.$message.error(message);
                    })
                });
            },
            //显示提问列表
            2: function (index, row) {

                this.$router.push(`/review/QuestionList/${row.articleId}`);
            },
            //显示评论列表
            handleEdit2: function (index, row) {
                sessionStorage.setItem('extras', row.extra)
                console.log(row.extra)
                let {title: title, menuName: menuName} = row;
                if (title)
                    title = title.replace("\?", "？");
                console.log(menuName)
                if (menuName)
                    menuName = menuName.replace("\?", "？");
                this.$router.push({path: `/review/ReviewList/${row.articleId}/${title}/${row.menuId}/${menuName}`});
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    name: '',
                    sex: -1,
                    age: 0,
                    birth: '',
                    addr: ''
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.editForm);
                            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                            editUser(para).then((res) => {
                                this.editLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['editForm'].resetFields();
                                this.editFormVisible = false;
                                this.getUsers();
                            });
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.addForm);
                            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                            addUser(para).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addForm'].resetFields();
                                this.addFormVisible = false;
                                this.getUsers();
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {ids: ids};
                    batchRemoveUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {

                });
            },
            // 字符替换
            checkLiveStatus: function (row, column) {
                let status = row[column.property];
                switch (status) {
                    case "1":
                        return "直播中";
                    case "2":
                        return "预告";
                    case "3":
                        return "回顾";
                    default:
                        return "出现错误";
                }
            },
            checkArticleType: function (row, column) {
                let status = row[column.property];
                switch (status) {
                    case 7:
                        return "直播";
                    case 8:
                        return "直播专题";
                    case 9:
                        return "直击";
                    default:
                        return "出现错误";
                }
            },

        },
        mounted() {
            this.getUsers();
            this.getLanguage()
        }
    }

</script>

<style scoped lang="scss">
    .sTitle {
        width: 400px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer
    }

    ;
    .active {
        color: #a00;
    }
</style>