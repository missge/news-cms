<template>
    <section>

        <!--选择类型-->
        <el-col :span="24" class="toolbar">
            屏蔽词库类型选择
            <el-radio class="radio" v-model="current_type" label="comment" style="margin-left: 10px">评论</el-radio>
            <el-radio class="radio" v-model="current_type" label="search">搜索</el-radio>
        </el-col>

        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="keyword" placeholder="敏感词"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="searchKeyWord">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="list" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column prop="word" label="敏感词" min-width="180" >
            </el-table-column>
            <el-table-column prop="createTime" label="最后添加时间" :formatter="dateFormat" min-width="220" >
            </el-table-column>
            <el-table-column label="详情" min-width="180">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="handleAdd">新增敏感词</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="limit"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
                <el-form-item label="敏感词" prop="word">
                    <el-input v-model="addForm.word" auto-complete="off" required></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">添加</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import util, {dateFormat} from '../../common/js/util';
    //import NProgress from 'nprogress'
    import {getSenstiveList} from "../../api/api";
    import {addSenstive, editBackStageUser, removeSenstive, searchSenstive} from "../../api/api";
    //moment.js库
    import moment from 'moment';
    import md5 from 'blueimp-md5';

    export default {
        data() {
            return {
                current_type: 'comment',
                uname: "",
                filters: {
                    word: '',
                    userName: ''
                },
                list: [],
                total: 0,
                page: 1,
                limit: 10,
                listLoading: false,
                sels: [],//列表选中列

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ],
                    // password: [
                    //     { validator: validatePass, trigger: 'blur' }
                    // ]
                },
                //新增界面数据
                addForm: {
                    userId: "",
                    userName: "",
                    role: "",
                    email: "",
                    password: ""
                },
                keyword: ''

            }
        },
        methods: {
            dateFormat: dateFormat,
            //性别显示转换
            formatSex: function (row, column) {
                return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
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
                let para = {
                    page: this.page - 1,
                    limit: this.limit,
                    type: this.current_type, //comment/评论、search/搜索
                    ...filters
                };
                this.listLoading = true;
                console.log(`这是发送的请求`, para)
                //NProgress.start();
                getSenstiveList(para).then((data) => {

                    console.log("----------");
                    console.log(data);
                    console.log("----------");

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
            //删除
            handleDel: function (index, row) {
                this.$confirm('确定要删除该敏感词吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {"word": row.word};
                    para.type = this.current_type//comment/评论、search/搜索
                    removeSenstive(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        })
                        this.getUsers();
                    });
                })
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    word: ''
                };
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            let para = Object.assign({}, this.addForm);
                            para.type = this.current_type;
                            addSenstive(para)
                                .then((res) => {
                                    this.addLoading = false;
                                    //NProgress.done();
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    })

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
                var userIds = this.sels.map(item => item.userId).toString();
                var ids = userIds.split(",")
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {targetUserId: ids};
                    delBackStageUser(para).then((res) => {
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
            searchKeyWord() {
                if (!this.keyword) {
                    this.$message.warning('您搜索的词为空')
                    return
                }
                searchSenstive({
                    type: this.current_type,
                    word: this.keyword
                }).then(
                    data => {
                        console.log(data)
                        this.list = data.list
                    }
                ).catch(
                    message => {
                        console.log(message)
                    }
                )
            }
        },
        mounted() {
            this.getUsers();
        },
        watch: {
            current_type(old, newvalue) {
                console.log(old);
                this.getUsers();
            }
        }
    };

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