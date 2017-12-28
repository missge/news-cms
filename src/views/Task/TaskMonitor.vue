<template>
    <section>
        <el-row>
            <el-col :offset="18" :span="3">
                <el-button type="danger" @click.native="clearredis">清空redis队列</el-button>
            </el-col>
            <el-col :span="3">
                <el-button type="success" @click.native="resetredis">恢复redis队列</el-button>
            </el-col>
        </el-row>
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <template>
                    <el-select v-model="filters.type" placeholder="请选择">
                        <el-option v-for="item in statusTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <el-form-item>
                    <el-button type="primary" v-on:click="getUsers">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="taskList" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column prop="id" label="Id" min-width="180">
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="light" placement="top-end">
                        <div slot="content"> 用户Id：
                            <br/> {{scope.row.id}}
                        </div>
                        <div class="sTitle"> {{scope.row.id}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="data.taskName" label="任务名称" width="160">
            </el-table-column>
            <el-table-column prop="data.taskRunMethod" label="任务运行方法名" min-width="180">
            </el-table-column>
            <el-table-column prop="data.operator" label="操作人" width="140">
            </el-table-column>
            <!-- <el-table-column prop="timestamp" label="timestamp" :formatter="dateFormat" width="220" sortable>
                        </el-table-column>
                        <el-table-column prop="finishedOn" label="finishedOn" :formatter="dateFormat" width="140" sortable>
                        </el-table-column>
                        <el-table-column prop="processedOn" label="processedOn" :formatter="dateFormat" width="140" sortable>
                        </el-table-column>
                        <el-table-column prop="failedReason" label="failedReason" min-width="140" sortable>
                        </el-table-column> -->
            <el-table-column label="详情" width="180">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <!-- <el-button type="primary" @click="handleAdd">新增</el-button> -->
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">

                <div>
                    <tree-view :data="this.monitorlist" :options="{maxDepth: 8}"></tree-view>
                </div>

            </el-form>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
                <el-form-item label="姓名：" prop="userName">
                    <el-input v-model="addForm.userName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="用户类型">
                    <el-select v-model="addForm.role">
                        <el-option label="管理员" value="admin"></el-option>
                        <el-option label="普通用户" value="stander"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="email" label="邮箱：" :rules="[
                                                               { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                                                               { type: 'email', message: '请输入正确的邮箱地址，×××@×××.com', trigger: 'blur,change' } ]">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="密码：" prop="password">
                    <el-input type="password" v-model="addForm.password" auto-complete="off"></el-input>
                </el-form-item>
                <!-- <el-form-item label="确认密码" prop="checkPass">
                                                                                                                <el-input type="password" v-model="taskList.checkPass" auto-complete="off"></el-input>
                                                                                                            </el-form-item> -->

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
    import {getTaskMonitorList} from "../../api/api";
    import {addBackStageUser, editBackStageUser, delBackStageUser, clearRedis, resetRedis,} from "../../api/api";
    import md5 from 'blueimp-md5';
    import TreeView from "vue-json-tree-view";

    export default {
        data() {
            return {
                statusTypeOptions: [{
                    value: 'waiting',
                    label: '等待列表'
                }, {
                    value: 'failed',
                    label: '失败列表'
                }, {
                    value: 'delayed',
                    label: '延时列表'
                }],
                value: '',

                uname: "",
                filters: {
                    type: 'delayed'
                },
                taskList: [],
                total: 0,
                page: 0,
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
                    taskName: "",
                    taskIntroduce: "",
                    taskScript: "",
                    taskData: "",
                    taskRunMethod: "",
                    cron: "",
                    userId: "",
                    userName: "",
                    timestamp: "",
                    finishedOn: "",
                    processedOn: "",
                    // failedReason: item.failedReason,
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
                    userId: "",
                    userName: "",
                    role: "",
                    email: "",
                    password: "",
                },
                monitorlist: ""
            }
        },
        methods: {
            dateFormat: dateFormat,
            //性别显示转换
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
                    page: this.page,
                    size: this.size,
                    ...filters
                };
                this.listLoading = true;
                //NProgress.start();
                getTaskMonitorList(para).then((data) => {

                    console.log("----------");
                    console.log(data);
                    console.log("----------");

                    this.total = data.total;
                    // this.total = 100;
                    this.taskList = data.taskList;
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            clearredis() {
                this.$confirm('确认清空redis队列吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.redisLoading = true;
                    //NProgress.start();
                    clearRedis().then((res) => {
                        this.redisLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '清空成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {
                    this.redisLoading = false;
                });
            },
            resetredis() {
                this.$confirm('确认恢复redis队列吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.redisLoading = true;
                    //NProgress.start();
                    resetRedis().then((res) => {
                        this.redisLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '恢复成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {
                    this.redisLoading = false;
                });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该用户吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {targetUserId: row.userId};
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
            //显示编辑界面
            handleEdit(index, row) {
                this.editFormVisible = true;
                console.log(row)
                this.monitorlist = row;
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    userName: "",
                    role: "",
                    email: "",
                    password: "",
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (this.editForm.password.length < 8 || this.editForm.password.length > 16) {
                        this.$confirm("密码长度应为8-16");
                        this.password = ""
                    } else {
                        if (valid) {
                            this.$confirm('确认提交吗？', '提示', {}).then(() => {
                                this.editLoading = true;
                                //NProgress.start();
                                //md5加密
                                this.editForm.password = md5(this.editForm.password);

                                let para = Object.assign({}, this.editForm);
                                // para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                                editBackStageUser(para).then((res) => {
                                    this.editLoading = false;
                                    //NProgress.done();
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.$refs['editForm'].resetFields();
                                    this.editFormVisible = false;
                                    this.getUsers();
                                }).catch((message) => {
                                    this.$confirm('请输入完整信息', '提示')
                                    this.editLoading = false;
                                    this.$message.error(message);
                                });
                            });
                        }
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        if (this.addForm.password.length < 8 || this.addForm.password.length > 16) {
                            this.$confirm("密码长度应为8-16");
                            this.password = ""
                        } else {
                            this.$confirm('确认提交吗？', '提示', {}).then(() => {
                                this.addLoading = true;
                                //NProgress.start();

                                //md5加密
                                this.addForm.password = md5(this.addForm.password);

                                let para = Object.assign({}, this.addForm);

                                addBackStageUser(para).then((res) => {
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