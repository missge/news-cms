<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.articleId" placeholder="文章id"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.title" placeholder="标题"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getUsers">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true">
                <el-input v-model="threshold" label="阀值" placeholder="请输入阀值" style="width:50%"></el-input>
                <el-button type="primary" @click="changeAllThreshold">修改全局指令监控报警阀值</el-button>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="articleList" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">

            <el-table-column prop="articleId" label="文章id" width="100">
            </el-table-column>
            <el-table-column prop="title" label="文章标题" width="120">
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="light" placement="top-end">
                        <div slot="content"> 文章标题：
                            <br/> {{scope.row.title}}
                        </div>
                        <div class="sTitle"> {{scope.row.title}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="instructionCount" label="指令条数" width="140" >
            </el-table-column>
            <el-table-column prop="threshold" label="报警阀值" width="140" >
                <template slot-scope="scope">
                    {{scope.row.threshold}}
                    <el-button size="small" @click="handleEditThreshold(scope.$index, scope.row)">修改/查看</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="instructionsUrl" label="全指令查询url" min-width="140" >
                <template slot-scope="scope">
                    <el-button size="small" @click="handleAllInstruction(scope.$index, scope.row)">查看</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="220" >
                <template slot-scope="scope">
                    {{scope.row.status}}
                    <el-button size="small" @click="handleAdd(scope.$index, scope.row)">修改状态</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="instructionUrlPrefix" label="指令对比" width="160" >
                <template slot-scope="scope">
                    <span>{{scope.row.instructionCount - 1}}</span>--
                    <span>{{scope.row.instructionCount}}</span>
                    <el-button size="small" @click="handleCompare(scope.$index, scope.row)">查看</el-button>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">清空</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>
        <!--修改阀值-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="文章id" prop="articleId">
                    {{this.editForm.articleId}}
                </el-form-item>
                <el-form-item label="阀值" prop="threshold">
                    <el-input v-model="editForm.threshold"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--对比界面-->
        <el-dialog title="对比" v-model="compareFormVisible" :close-on-click-modal="false">
            <template>
                <div v-if="this.secondLastnum > 0" style="width:50% ;float:left">
                    <h3>第{{this.secondLastnum}}条</h3>
                    <tree-view :data="secondLastInstruction" :options="{maxDepth: 8}"></tree-view>
                </div>
                <div v-else style="width:50% ;float:left">
                    <h3>没有第0条数据</h3>
                </div>
            </template>
            <template>
                <div v-if="this.lastnum >0" style="width:50%;float:right">
                    <h3>第{{this.lastnum}}条</h3>
                    <tree-view :data="lastInstruciton" :options="{maxDepth: 8}"></tree-view>
                </div>
                <div v-else style="width:50%;float:right">
                    <h3>没有第0条数据</h3>
                </div>
            </template>
        </el-dialog>

        <!--全指令查询-->
        <el-dialog title="全指令查询" v-model="allInstructionFormVisible" :close-on-click-modal="false">
            <div>
                <tree-view :data="instructionsUrls" :options="{maxDepth: 8}"></tree-view>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    //调用时间插件
    import util, {dateFormat} from '../../common/js/util';
    //请求ajax
    import {getInstructionList} from "../../api/api";
    import {
        getBackStageUserList,
        changeThreshold,
        changeThresholdStatus,
        clearInstruction,
        changeGlobalConfig
    } from "../../api/api";
    import axios from 'axios';
    import TreeView from "vue-json-tree-view";

    export default {
        data() {
            return {
                threshold: '',
                value: '',
                uname: "",
                filters: {
                    userId: '',
                    userName: ''
                },
                articleList: [],
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
                //编辑界面数据
                editForm: {
                    articleId: '',
                    threshold: ''

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
                    articleId: '',
                    status: ''
                },
                //对比界面
                compareFormVisible: false,
                compareLoading: false,
                compareFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ],
                },
                //对比界面数据
                secondLastnum: '',
                lastnum: '',
                lastInstruciton: '',
                secondLastInstruction: '',
                compareForm: {
                    lastInstruciton: '',
                    secondLastInstruction: ''
                },

                instructionsUrls: "",
                //全指令界面
                allInstructionFormVisible: false,
                allInstructionLoading: false,
                allInstructionFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ],
                },
                //全指令界面数据
                allInstructionForm: {
                    instructionsUrl: ''
                }


            }
        },
        methods: {
            dateFormat: dateFormat,

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
                    size: this.size,
                    ...filters
                };
                this.listLoading = true;
                //NProgress.start();
                //请求ajax
                getInstructionList(para).then((data) => {

                    this.total = data.total;
                    // this.total = 100;
                    this.articleList = data.articleList;
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            //清空指令
            handleDel(index, row) {
                this.$confirm('确认清空吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {articleId: row.articleId};
                    clearInstruction(para).then((res) => {
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
            //显示编辑界面
            handleEditThreshold(index, row) {
                this.editFormVisible = true;
                this.editForm = {
                    articleId: row.articleId,
                    threshold: row.threshold,
                };

            },
            //修改状态
            handleAdd(index, row) {
                this.$confirm('确认修改此状态吗', '提示', {}).then(() => {
                    this.editLoading = true;
                    let statuses;
                    if (row.status == "processing") {
                        statuses = "processed"
                    } else {
                        statuses = "processing"
                    }
                    let para = {
                        "articleId": row.articleId,
                        "status": statuses
                    };
                    changeThresholdStatus(para).then((res) => {
                        this.editLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '提交成功',
                            type: 'success'
                        });
                        this.$refs['addForm'].resetFields();
                        this.editFormVisible = false;
                        this.getUsers();
                    });
                });

            },
            //显示对比界面
            handleCompare(index, row) {
                this.compareFormVisible = true;
                this.compareForm = {
                    lastInstruciton: '',
                    secondLastInstruction: ''
                };
                this.secondLastnum = row.instructionCount - 1;
                this.lastnum = row.instructionCount;
                let that = this;
                axios.get(row.instructionUrlPrefix + row.articleId + '/' + (row.instructionCount - 1))
                    .then(function (data) {
                        that.lastInstruciton = data
                    });
                axios.get(row.instructionUrlPrefix + row.articleId + '/' + (row.instructionCount - 2))
                    .then(function (data) {

                        that.secondLastInstruction = data;

                    });
            },
            handleAllInstruction(index, row) {
                this.allInstructionFormVisible = true;
                this.allInstructionForm = {
                    instructionsUrl: row.instructionsUrl
                };
                let that = this;
                axios.get(row.instructionsUrl)
                    .then(function (data) {
                        that.instructionsUrls = data;
                    });
            },
            //修改阀值
            editSubmit() {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认修改此阈值吗', '提示', {}).then(() => {
                            this.editLoading = true;
                            let para = Object.assign({}, this.editForm);
                            changeThreshold(para).then((res) => {
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

            selsChange: function (sels) {
                this.sels = sels;
            },
            //修改全局阀值
            changeAllThreshold() {
                this.$confirm('确认修改全局阀值吗', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {"threshold": this.threshold, "checkInterval": 10};
                    changeGlobalConfig(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '修改成功',
                            type: 'success'
                        });
                        this.getUsers();
                        this.threshold = ""
                    });
                }).catch(() => {
                    this.listLoading = false;
                });
                // this.threshold = ""
            }
        },
        mounted() {
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