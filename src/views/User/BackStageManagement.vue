<template>
    <section>
        <!--列表-->
        <el-table :data="userList" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column prop="userId" label="用户Id" width="180">
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="light" placement="top-end">
                        <div slot="content"> 用户Id：
                            <br/> {{scope.row.userId}}
                        </div>
                        <div class="sTitle"> {{scope.row.userId}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="userName" label="用户名" width="180">
            </el-table-column>
            <el-table-column prop="role" label="用户类型" width="140">
            </el-table-column>
            <el-table-column prop="createUser" label="创建人" width="140">
            </el-table-column>
            <el-table-column prop="email" label="邮箱" min-width="140">
            </el-table-column>
            <el-table-column label="详情" width="330">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleGroup(scope.$index, scope.row)">为用户分配群组</el-button>
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">修改/查看</el-button>
                    <el-button size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-col>

        <!--已有群组-->
        <el-dialog title="用户已有群组" v-model="groupnameFormVisible" :close-on-click-modal="false">
            <el-table :data="userGroupList" highlight-current-row v-loading="groupnameLoading"
                      @selection-change="selsChange" style="width: 100%;">
                <el-table-column prop="groupName" label="权限组名称" min-width="180" sortable>
                </el-table-column>
                <el-table-column prop="groupId" label="权限组Id" min-width="150" sortable>
                </el-table-column>
                <el-table-column prop="groupInstruction" label="权限组简介" min-width="140" sortable>
                </el-table-column>
            </el-table>
        </el-dialog>

        <!--群组界面-->
        <el-dialog title="群组" v-model="groupFormVisible" :close-on-click-modal="false">
            <el-table ref="multipleTable" :data="groupList" highlight-current-row v-loading="listLoading"
                      @selection-change="selsChange" style="width: 100%;">
                <el-table-column type="selection" width="70">
                </el-table-column>
                <el-table-column prop="groupName" label="权限组名称" min-width="180" sortable>
                </el-table-column>
                <el-table-column prop="groupId" label="权限组Id" min-width="150" sortable>
                </el-table-column>
                <el-table-column prop="groupInstruction" label="权限组简介" min-width="140" sortable>
                </el-table-column>
            </el-table>

            <el-form :model="groupForm" label-width="100px" :rules="groupFormRules" ref="groupForm">
                <el-form-item label="用户名" prop="userName">
                    {{this.groupForm.userName}}
                </el-form-item>
                <el-form-item label="用户id" prop="userId">
                    {{this.groupForm.userId}}
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="groupFormVisible = false">取消</el-button>
                <el-button @click.native="groupSubmit" :disabled="this.sels.length===0" :loading="addLoading">选择此权限组
                </el-button>
            </div>
        </el-dialog>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <el-form-item prop="userName" label="姓名：">
                    <b> {{editForm.userName}}</b>
                </el-form-item>
                <el-form-item label="用户类型">
                    <el-select v-model="editForm.role">
                        <el-option label="管理员" value="admin"></el-option>
                        <el-option label="普通用户" value="customer"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="email" label="邮箱：">
                    <b>{{editForm.email}}</b>
                </el-form-item>
                <el-form-item label="密码：" prop="password">
                    <el-input type="password" v-model="editForm.password" auto-complete="off"></el-input>
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
                <el-form-item label="姓名：" prop="userName">
                    <el-input v-model="addForm.userName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="用户类型">
                    <el-select v-model="addForm.role">
                        <el-option label="管理员" value="admin"></el-option>
                        <el-option label="普通用户" value="customer"></el-option>
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
                                                                                                                        <el-input type="password" v-model="userList.checkPass" auto-complete="off"></el-input>
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
    import {getBackStageUserList} from "../../api/api";
    import {
        addBackStageUser,
        editBackStageUser,
        delBackStageUser,
        getGroupList,
        assignGroup,
        getUserGroup
    } from "../../api/api";
    import md5 from 'blueimp-md5';

    export default {
        data() {
            return {
                groupid: '',
                groupList: [],
                userGroupList: [],
                uname: "",
                filters: {
                    userId: '',
                    userName: ''
                },
                userList: [],
                total: 0,
                page: 0,
                size: 10,
                listLoading: false,
                sels: [],//列表选中列

                groupFormVisible: false,//群组列表
                groupLoading: false,
                groupFormRules: {},
                groupForm: {
                    groupId: '',
                    userId: ''
                },

                groupnameFormVisible: false,//编辑界面是否显示
                groupnameLoading: false,
                groupnameFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                groupnameForm: {},

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                editForm: {
                    userId: "",
                    userName: "",
                    role: "",
                    email: "",
                    password: ""
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
                }

            }
        },
        methods: {
            dateFormat: dateFormat,
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
                getBackStageUserList(para).then((data) => {

                    console.log("----------");
                    console.log(data);
                    console.log("----------");

                    this.total = data.total;
                    // this.total = 100;
                    this.userList = data.userList;
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
            selectGroup() {
                console.log("------", this.userGroupList);
                console.log("------", this.groupList);
                let ugl = this.userGroupList;
                let gl = this.groupList;
                let arr = [];
                for (let u in ugl) {
                    for (let g in gl) {
                        if (ugl[u].groupId == gl[g].groupId) {
                            arr.push(this.groupList[g])
                        }
                    }
                }
                ;
                console.log("+++++++++", arr)
                if (arr) {
                    arr.forEach(row => {
                        this.$refs.multipleTable.toggleRowSelection(row);
                    });
                } else {
                    this.$refs.multipleTable.clearSelection();
                }
                ;
                arr = ''
            },
            //显示群组界面
            handleGroup: function (index, row) {
                this.groupFormVisible = true;
                this.groupForm = {
                    groupId: this.groupid,
                    userId: row.userId,
                    userName: row.userName
                };

                // this.getGroupname();
                this.getGroupLists();
            },
            getGroupLists() {
                this.listLoading = true;
                //NProgress.start()
                getGroupList().then((data) => {
                    this.groupList = data.groupList;
                    this.listLoading = false;
                    //NProgress.done();
                    this.getGroupname();
                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            getGroupname() {
                this.listLoading = true;
                //NProgress.start()
                let userId = this.groupForm.userId;
                let para = {
                    page: this.page,
                    size: this.size
                };
                getUserGroup(userId, para).then((data) => {

                    this.userGroupList = data.groupList;
                    this.listLoading = false;
                    this.selectGroup();
                    //NProgress.done();
                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = {
                    userId: row.userId,
                    userName: row.userName,
                    role: row.role,
                    email: row.email,
                    password: row.password,
                };
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
            groupSubmit() {
                var ids = this.sels.map(item => item.groupId).toString();
                // var journalist = journalists.split(",")
                this.$confirm('确认添加吗', '提示', {}).then(() => {
                    this.addLoading = true;
                    //NProgress.start();
                    let para = {groupIds: ids, userId: this.groupForm.userId};
                    assignGroup(para).then((res) => {
                        this.addLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '添加成功',
                            type: 'success'
                        })
                    }).catch((message) => {
                        this.addLoading = false;
                        this.$message.error(message);
                    });
                    ;
                    this.getUsers();
                    ;
                });
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (this.editForm.password.length < 8 || this.editForm.password.length > 16) {
                        this.$confirm("密码长度应为8-16");
                        this.password = ""
                    } else {
                        if (valid) {
                            var c = this.editForm.password;
                            this.$confirm('确认提交吗？', '提示', {}).then(() => {
                                this.editLoading = true;
                                //NProgress.start();
                                //md5加密
//                                this.editForm.password = md5(this.editForm.password);

                                let para = Object.assign({}, this.editForm);
                                para.password = md5(c)
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
                                }).catch(message => {
                                    this.addLoading = false;
                                    this.$message.error(message);
                                });
                                ;
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
                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            }
        },
        mounted() {
            this.getUsers();
            // this.getGroupLists();
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