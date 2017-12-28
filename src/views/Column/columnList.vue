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
                        <el-option v-for="item in languageOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <el-form-item>
                    <el-button type="primary" v-on:click="getUsers">查询</el-button>
                </el-form-item>
                <el-form-item style="float: right">
                    <el-button type="primary" @click="syn">同步</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="list" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column prop="columnId" label="栏目id" width="150">
            </el-table-column>
            <el-table-column prop="name" label="栏目名称" min-width="150">
            </el-table-column>
            <el-table-column prop="isTest" label="测试栏目" min-width="150">
            </el-table-column>
            <el-table-column prop="vLevel" label="加V" width="100">
                <template slot-scope="scope">
                    <div v-if="scope.row.vLevel ==0">不加V</div>
                    <div v-else-if="scope.row.vLevel !== 0">加V</div>
                </template>
            </el-table-column>
            <el-table-column prop="type" label="栏目类型" width="200">
                <template slot-scope="scope">
                    <div v-if="scope.row.isDelete == 'NO'&&scope.row.isSubscribed=='YES'">默认订阅且不可取消订阅
                    </div>
                    <div v-if="scope.row.isDelete == 'YES'&&scope.row.isSubscribed=='YES'">默认订阅且可取消订阅
                    </div>
                    <div v-if="scope.row.isDelete == 'YES'&&scope.row.isSubscribed=='NO'">默认不订阅
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="index" label="排序" width="100">
            </el-table-column>
            <el-table-column prop="count" label="当前订阅数" width="140">
            </el-table-column>
            <el-table-column prop="virtualCount" label="虚拟订阅数" width="140">
            </el-table-column>
            <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">修改/查看</el-button>
                    <!-- <el-button size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button> -->
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="limit"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <el-form-item prop="name" label="栏目名称">
                    <el-input v-model="editForm.name"></el-input>
                </el-form-item>
                <el-form-item prop="columnId" label="栏目Id">
                    <el-input v-model="editForm.columnId"></el-input>
                </el-form-item>
                <el-form-item prop="url" label="栏目URL">
                    <el-input v-model="editForm.url"></el-input>
                </el-form-item>
                <el-form-item prop="language" label="语言">
                    <b> {{editForm.language}}</b>
                </el-form-item>
                <el-form-item prop="index" label="栏目排序">
                    <el-input v-model="editForm.index"></el-input>
                </el-form-item>
                <el-form-item prop="virtualCount" label="虚拟订阅数">
                    <el-input v-model="editForm.virtualCount "></el-input>
                </el-form-item>
                <el-form-item label="测试栏目">
                    <el-radio v-model="editForm.isTest" label="YES">是</el-radio>
                    <el-radio v-model="editForm.isTest" label="NO">否</el-radio>
                </el-form-item>
                <el-form-item label="栏目类型">
                    <template>
                        <el-radio-group v-model="types" @change="chooseTypes">
                            <el-radio :label="3">默认订阅且不可取消订阅</el-radio>
                            <el-radio :label="6">默认订阅且可以取消订阅</el-radio>
                            <el-radio :label="9">默认不订阅</el-radio>
                        </el-radio-group>
                    </template>
                </el-form-item>
                <el-form-item label="加V">
                    <template>
                        <el-radio-group v-model="editForm.vLevel">
                            <el-radio :label="0">不加V</el-radio>
                            <el-radio :label="1">小V</el-radio>
                        </el-radio-group>
                    </template>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
                <el-form-item prop="name" label="栏目名称">
                    <el-input v-model="addForm.name"></el-input>
                </el-form-item>
                <el-form-item prop="columnId" label="栏目Id">
                    <el-input v-model="addForm.columnId"></el-input>
                </el-form-item>
                <el-form-item prop="url" label="栏目URL">
                    <el-input v-model="addForm.url"></el-input>
                </el-form-item>
                <el-form-item prop="language" label="语言">
                    <b> {{addForm.language}}</b>
                </el-form-item>
                <el-form-item prop="index" label="栏目排序">
                    <el-input v-model="addForm.index"></el-input>
                </el-form-item>
                <el-form-item prop="virtualCount" label="虚拟订阅数">
                    <el-input v-model="addForm.virtualCount "></el-input>
                </el-form-item>
                <el-form-item label="测试栏目">
                    <el-radio v-model="addForm.isTest" label="YES">是</el-radio>
                    <el-radio v-model="addForm.isTest" label="NO">否</el-radio>
                </el-form-item>
                <el-form-item label="栏目类型">
                    <template>
                        <el-radio-group v-model="type" @change="chooseType">
                            <el-radio label="3">默认订阅且不可取消订阅</el-radio>
                            <el-radio label="6">默认订阅且可以取消订阅</el-radio>
                            <el-radio label="9">默认不订阅</el-radio>
                        </el-radio-group>
                    </template>
                </el-form-item>
                <el-form-item label="加V">
                    <template>
                        <el-radio-group v-model="addForm.vLevel">
                            <el-radio label="0">不加V</el-radio>
                            <el-radio label="1">小V</el-radio>
                            <!-- <el-radio label="2">大v</el-radio> -->
                        </el-radio-group>
                    </template>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">添加</el-button>
            </div>
            <!--{{addForm}}-->
        </el-dialog>

    </section>
</template>

<script>
    import {util, InitMenu} from '../../common/js/util';
    //import NProgress from 'nprogress'
    import {
        getColumnsList,
        addNeWColumn,
        deleteNewColumns,
        updateNewColumn,
        syncMenusInfo,
        getAppList
    } from "../../api/api"
    import md5 from 'blueimp-md5';

    export default {
        data() {
            return {
                newTypeOptions: [],
                languageOptions: [],
                languageTypeOptions: [
                    {
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
                    name: ''

                },
                list: [],
                total: 0,
                page: 1,
                size: "",

                skip: 0,
                limit: 10,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                editForm: {
                    appID: "",
                    columnId: "",
                    index: "",
                    isDelete: "",
                    isSubscribed: "",
                    language: "",
                    name: "",
                    url: "",
                    vLevel: 0,
                    virtualCount: '',
                    isTest: 'NO'
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
                    virtualCount: '',
                    isTest: 'NO'
                },
                type: 6,
                types: ''
            }

        },
        methods: {
            syn() {
                this.$confirm('确定同步吗', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {appId: this.filters.appID, language: this.filters.language};
                    console.log(para)
                    syncMenusInfo(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '同步成功',
                            type: 'success'
                        });
                        this.getUsers();
                    }).catch(message => {
                        this.listLoading = false;
                        this.$message.error(message);
                    });
                    ;
                })
            },
            chooseType(value) {
                this.type = value;
            },
            chooseTypes(value) {
                this.types = value
            },
            getLanguage(value) {
                this.filters.language = value;
                this.getUsers();
                console.log(this.addForm.language)

            },
            getAppId(value) {
                this.filters.appID = value;
                if (value === '1508754694000') {
                    this.languageOptions = [{
                        value: 'ja',
                        label: '日文'
                    }]
                    this.filters.language = 'ja'
                } else {
                    this.languageOptions = this.languageTypeOptions
                    this.filters.language = 'zh'
                }
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
                    skip: 0 + (this.page - 1) * 10,
                    limit: this.limit,
                    ...filters
                };
                console.log(para)
                this.listLoading = true;
                //NProgress.start();
                getColumnsList(para).then((data) => {

                    this.total = data.count;
                    this.list = data.list;
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该用户吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {columnIdArr: row.columnId, language: this.filters.language, appID: this.filters.appID};
                    deleteNewColumns(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = {
                    appID: this.filters.appID,
                    columnId: row.columnId,
                    index: row.index,
                    isDelete: row.isDelete,
                    isSubscribed: row.isSubscribed,
                    language: this.filters.language,
                    name: row.name,
                    url: row.url,
                    vLevel: row.vLevel,
                    virtualCount: row.virtualCount,
                    isTest: row.isTest
                };
                if (row.isDelete == "NO" && row.isSubscribed == 'YES') {
                    this.types = 3
                }
                else if (row.isDelete == "YES" && row.isSubscribed == 'YES') {
                    this.types = 6
                }
                else if (row.isDelete == "YES" && row.isSubscribed == 'NO') {
                    this.types = 9
                }
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    appID: this.filters.appID,
                    columnId: "",
                    index: "",
                    isDelete: "NO",
                    isSubscribed: 'YES',
                    language: this.filters.language,
                    name: "",
                    url: "",
                    vLevel: "0",
                    isTest: 'NO'
                };
                if (this.addForm.isDelete == "NO" && this.addForm.isSubscribed == 'YES') {
                    this.type = "3"
                }
                else if (this.addForm.isDelete == "YES" && this.addForm.isSubscribed == 'YES') {
                    this.type = "6"
                }
                else if (this.addForm.isDelete == "YES" && this.addForm.isSubscribed == 'NO') {
                    this.type = "9"
                }
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (this.types == 3) {
                        this.editForm.isDelete = "NO"
                        this.editForm.isSubscribed = 'YES'
                    }
                    else if (this.types == 6) {
                        this.editForm.isDelete = "YES"
                        this.editForm.isSubscribed = 'YES'
                    }
                    else if (this.types == 9) {
                        this.editForm.isDelete = "YES"
                        this.editForm.isSubscribed = 'NO'
                    }
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;

                            let para = Object.assign({}, this.editForm);
                            updateNewColumn(para).then((res) => {
                                this.editLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['editForm'].resetFields();
                                this.editFormVisible = false;
                                this.getUsers();
                            }).catch(message => {
                                this.editLoading = false;
                                this.$message.error(message);
                            });
                            ;
                        });

                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (this.type == 3) {
                        this.addForm.isDelete = "NO"
                        this.addForm.isSubscribed = 'YES'
                        console.log(this.addForm.isDelete)
                    }
                    else if (this.type == 6) {
                        this.addForm.isDelete = "YES"
                        this.addForm.isSubscribed = 'YES'
                    }
                    else if (this.type == 9) {
                        this.addForm.isDelete = "YES"
                        this.addForm.isSubscribed = 'NO'
                    }
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            let para = Object.assign({}, this.addForm);
                            addNeWColumn(para).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                if (res.code === 101) {
                                    this.$message({
                                        message: '栏目id已存在',
                                        type: 'error'
                                    });
                                }
                                if (!res.code) {

                                }
                                (!res.code) ? this.$message.success(`${res.message}`) : this.$message.error(`添加失败 ${res.message}`)

                                this.$refs['addForm'].resetFields();
                                this.addFormVisible = false;
                                this.getUsers();
                            }).catch(message => {
                                this.addLoading = false;
                                this.$message.error(message);
                            });
                            ;
                        });

                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var userIds = this.sels.map(item => item.columnId).toString();
                var ids = userIds.split(",")
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {"columnIdArr": ids, language: this.filters.language, appId: this.filters.appID};
                    console.log(para)
                    deleteNewColumns(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            getSelectList() {
                let _this = this;
                InitMenu(this.newTypeOptions, function (menulist) {
                    menulist.forEach(x => {
                        if (x.label === '中国网') {
                            console.log('找到了', x)
                            _this.filters.appID = x.value;
                        }
                    })
                })
            },
        },
        mounted() {
            this.languageOptions = this.languageTypeOptions
            this.getUsers();
            this.getSelectList()

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