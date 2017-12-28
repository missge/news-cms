<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <template>
                    <el-select v-model="filters.appID" placeholder="请选择分类" @change="getAppId">
                        <el-option v-for="item in newTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <template>
                    <el-select v-model="filters.language" placeholder="请选择语言" @change="getLanguage">
                        <el-option v-for="item in languageTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <el-form-item>
                    <el-input v-model="filters.columnId" placeholder="栏目Id"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getUsers">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="list" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column prop="columnId" label="栏目id" width="180" >
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="light" placement="top-end">
                        <div slot="content"> 栏目id：
                            <br/> {{scope.row.columnId}}
                        </div>
                        <div class="sTitle"> {{scope.row.columnId}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="栏目名称" width="220" >
            </el-table-column>
            <el-table-column prop="type" label="栏目类型" width="200" >
                <template slot-scope="scope">
                    <div v-if="scope.row.isDelete == 'NO'&&scope.row.isSubscribed=='YES'">默认订阅且不可取消订阅
                    </div>
                    <div v-if="scope.row.isDelete == 'YES'&&scope.row.isSubscribed=='YES'">默认订阅且可取消订阅
                    </div>
                    <div v-if="scope.row.isDelete == 'YES'&&scope.row.isSubscribed=='NO'">默认不可订阅
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="index" label="排序" width="140" >
            </el-table-column>
            <el-table-column prop="count" label="当前订阅数" min-width="140" >
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">恢复</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

    </section>
</template>

<script>
    import {util, InitMenu} from '../../common/js/util';
    //import NProgress from 'nprogress'
    import {getDisabledColumnsList, reuseNewColumns, getAppList} from "../../api/api"
    import md5 from 'blueimp-md5';

    export default {
        data() {
            return {
                newTypeOptions: [],
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

                uname: "",
                filters: {
                    appID: '',
                    language: 'zh',
                },
                list: [],
                total: 0,
                page: 1,
                size: 10,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ],

                },
                //新增界面数据
                addForm: {
                    appID: "",
                    columnId: "",
                    index: "",
                    isDelete: "",
                    isSubscribed: "",
                    language: "",
                    name: "",
                    url: "",
                    vLevel: 0,
                    type: ""
                },

            }
        },
        methods: {
            getLanguage(value) {
                this.filters.language = value;
                this.getUsers();
                console.log(this.addForm.language)

            },
            getAppId(value) {
                this.filters.appID = value;
                this.getUsers();
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getUsers();
            },
            //获取用户列表
            getUsers() {
                //筛选
                let filters = {};
                for (let name in this.filters) {
                    if (this.filters[name]) {
                        filters[name] = this.filters[name];
                    }
                }
                this.addForm.language = this.filters.language;
                this.addForm.appID = this.filters.appID;
                let para = {
                    skip: 0 + ((this.page - 1) * 10),
                    limit: this.size,
                    name: "",
                    ...filters
                };
                this.listLoading = true;
                //NProgress.start();
                getDisabledColumnsList(para).then((data) => {

                    this.total = data.count;
                    // this.total = 100;
                    this.list = data.list;
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            //恢复
            batchRemove() {
                var userIds = this.sels.map(item => item.columnId).toString();
                var ids = userIds.split(",");
                this.$confirm('确认恢复选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {columnIdArr: ids, language: this.filters.language, appId: this.filters.appID};
                    console.log(para)
                    reuseNewColumns(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '恢复成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            getSelectList() {
                let _this = this;
                InitMenu(this.newTypeOptions, function (menulist) {
                    menulist.forEach(x => {
                        if (x.label === '中国网') {
                            _this.filters.appID = x.value;
                        }
                    })
                })
            },
        },
        mounted() {
            this.getSelectList();
            this.getUsers();
        }
    }

</script>

<style scoped lang="scss">
    .sTitle {
        width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer
    }
</style>