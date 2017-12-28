<template>
    <section>
        <br>
        <el-row>
            <el-col :span="4">
                <span> WAITING:{{this.waiting}}</span>
            </el-col>
            <el-col :span="4">
                <span>ACTIVE: {{this.active}}</span>
            </el-col>
            <el-col :span="4">
                <span>COMPLETED: {{this.completed}}</span>
            </el-col>
            <el-col :span="4">
                <span> FAILED:{{this.failed}}</span>
            </el-col>
            <el-col :span="4">
                <span> DELAYED:{{this.delayed}}</span>
            </el-col>
        </el-row>
        <br>
        <!--列表-->
        <el-table :data="taskList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column prop="taskId" label="任务Id" min-width="180" >
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="light" placement="top-end">
                        <div slot="content"> 用户Id：
                            <br/> {{scope.row.taskId}} </div>
                        <div class="sTitle"> {{scope.row.taskId}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="taskName" label="任务名称" min-width="160" >
            </el-table-column>
            <el-table-column prop="taskIntroduce" label="任务简介" min-width="180" >
            </el-table-column>
            <!-- <el-table-column prop="taskRunMethod" label="任务运行方法名" width="180" sortable>
                                </el-table-column> -->
            <el-table-column prop="status" label="状态" min-width="120" >
                <template slot-scope="scope">
                    <div v-if="scope.row.status == 'on'">开启</div>
                    <div v-else-if="scope.row.status == 'off'">关闭</div>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="operator" label="操作人" width="140" sortable>
                                </el-table-column>
                                <el-table-column prop="updateTime" label="更新时间" :formatter="dateFormat" width="140" sortable>
                                </el-table-column> -->
            <el-table-column label="详情" width="180">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">修改/查看</el-button>
                    <el-button size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <el-form-item label="任务名：" prop="taskName">
                    <el-input v-model="editForm.taskName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="任务Id" prop="taskId">
                    <el-input v-model="editForm.taskId" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="任务介绍" prop="taskIntroduce">
                    <el-input v-model="editForm.taskIntroduce" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="任务脚本" prop="taskScript">
                    <el-input v-model="editForm.taskScript" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="任务数据" prop="taskData">
                    <el-input v-model="editForm.taskData" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="任务方法名" prop="taskRunMethod">
                    <el-input v-model="editForm.taskRunMethod" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="cron" prop="cron">
                    <el-input v-model="editForm.cron" auto-complete="off"></el-input>
                </el-form-item>

                <el-form-item label="状态">
                    <template>
                        <el-radio-group v-model="editForm.status">
                            <el-radio class="radio" label="on">开启</el-radio>
                            <el-radio class="radio" label="off">关闭</el-radio>
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

                <el-form-item label="任务名：" prop="taskName">
                    <el-input v-model="addForm.taskName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="任务介绍" prop="taskIntroduce">
                    <el-input v-model="addForm.taskIntroduce" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="任务脚本" prop="taskScript">
                    <el-input v-model="addForm.taskScript" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="任务数据" prop="taskData">
                    <el-input v-model="addForm.taskData" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="任务方法名" prop="taskRunMethod">
                    <el-input v-model="addForm.taskRunMethod" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="cron" prop="cron">
                    <el-input v-model="addForm.cron" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <template>
                        <el-radio-group v-model="addForm.status">
                            <el-radio class="radio" label="on">开启</el-radio>
                            <el-radio class="radio" label="off">关闭</el-radio>
                        </el-radio-group>
                    </template>
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
import util, { dateFormat } from '../../common/js/util';
import { getTaskList } from "../../api/api";
import { saveTask, removeTask, getTaskMonitorCount } from "../../api/api";
import md5 from 'blueimp-md5';

export default {
    data() {
        return {
            uname: "",
            filters: {
                userId: '',
                userName: ''
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
                    { required: true, message: '请输入姓名', trigger: 'blur' }
                ]
            },
            //编辑界面数据
            editForm: {
                taskName: "",
                taskId: '',
                taskIntroduce: "",
                taskScript: "",
                taskData: "",
                taskRunMethod: "",
                cron: "",
                userId: "",
                userName: "",
                status: ""
            },

            redisLoading: false,

            addFormVisible: false,//新增界面是否显示
            addLoading: false,
            addFormRules: {
                userName: [
                    { required: true, message: '请输入姓名', trigger: 'blur' }
                ],
            },
            //新增界面数据
            addForm: {
                taskName: "",
                taskIntroduce: "",
                taskScript: "",
                taskData: "",
                taskRunMethod: "",
                cron: "",
                userId: "",
                userName: "",
                status: ''
            },
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0,
            countlist: []
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
            getTaskList(para).then((data) => {

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
        getCount() {
            this.listLoading = true;
            //NProgress.start();
            getTaskMonitorCount().then((data) => {

                this.waiting = data.waiting;
                this.active = data.active;
                this.completed = data.completed;
                this.failed = data.failed;
                this.delayed = data.delayed;
                console.log(this.delayed)
                this.listLoading = false;

            }).catch(message => {
                this.listLoading = false;
                this.$message.error(message);
            });
        },
        //删除
        handleDel: function(index, row) {
            this.$confirm('确认删除该任务吗?', '提示', {
                type: 'warning'
            }).then(() => {
                this.listLoading = true;
                //NProgress.start();
                let para = { taskId: row.taskId };
                removeTask(para).then((res) => {
                    this.listLoading = false;
                    //NProgress.done();
                    this.$message({
                        message: '删除成功',
                        type: 'success'
                    });
                    this.getUsers();
                });
            }).catch(() => {
                this.listLoading = false;
            });
        },
        //显示编辑界面
        handleEdit(index, row) {
            this.editFormVisible = true;
            this.editForm = {
                taskName: row.taskName,
                taskId: row.taskId,
                taskIntroduce: row.taskIntroduce,
                taskScript: row.taskScript,
                taskData: row.taskData,
                taskRunMethod: row.taskRunMethod,
                cron: row.cron,
                status: row.status
                // userId: row.operatorId,
                // userName: row.operator
            };
        },
        //显示新增界面
        handleAdd: function() {
            this.addFormVisible = true;
            this.addForm = {
                taskName: "",
                taskIntroduce: "",
                taskScript: "",
                taskData: "",
                taskRunMethod: "",
                cron: "",
                status: ''
                // userId: "",
                // userName: ""
            };
        },
        //编辑
        editSubmit: function() {
            this.$refs.editForm.validate((valid) => {
                if (valid) {
                    this.$confirm('确认修改吗？', '提示', {}).then(() => {
                        this.editLoading = true;
                        //NProgress.start();
                        let para = Object.assign({}, this.editForm);
                        saveTask(para).then((res) => {
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

            });
        },
        //新增
        addSubmit: function() {
            this.$refs.addForm.validate((valid) => {
                if (valid) {

                    this.$confirm('确认提交吗？', '提示', {}).then(() => {
                        this.addLoading = true;
                        //NProgress.start();
                        let para = Object.assign({}, this.addForm);

                        saveTask(para).then((res) => {
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
        selsChange: function(sels) {
            this.sels = sels;
        },
        //批量删除
        batchRemove: function() {
            var userIds = this.sels.map(item => item.userId).toString();
            var ids = userIds.split(",")
            this.$confirm('确认删除选中记录吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.listLoading = true;
                //NProgress.start();
                let para = { targetUserId: ids };
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
        this.getCount()
    }
}

</script>

<style scoped lang="scss">
.sTitle {
    width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer
}
</style>