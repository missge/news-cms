<template>
    <section>
        <!--列表-->
        <el-table :data="resourceList" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="70">
            </el-table-column>
            <el-table-column prop="resourceName" label="资源名称" min-width="180" >
            </el-table-column>
            <el-table-column prop="resourceId" label="资源Id" min-width="150" >
            </el-table-column>
            <el-table-column prop="resourceUrl" label="资源Url" min-width="140" >
            </el-table-column>
            <el-table-column label="详情" min-width="180">
                <template slot-scope="scope">
                    <!-- <el-button @click="handleResource(scope.$index, scope.row)">添加到群组</el-button> -->
                    <el-button @click="handleEdit(scope.$index, scope.row)">查看</el-button>

                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button @click.native="batchRemove" :disabled="this.sels.length===0" :loading="listLoading">删除
            </el-button>
            <el-button @click.native="handleResource" :disabled="this.sels.length===0" :loading="addLoading">添加到群组
            </el-button>
        </el-col>

        <!--资源界面-->
        <el-dialog title="编辑" v-model="resourceFormVisible" :close-on-click-modal="false">
            <el-table :data="groupList" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                      style="width: 100%;">
                <el-table-column type="index" label="序号" width="70">
                </el-table-column>
                <el-table-column prop="groupName" label="权限组名称" min-width="180" sortable>
                </el-table-column>
                <el-table-column prop="groupId" label="权限组Id" min-width="150" sortable>
                </el-table-column>
                <el-table-column prop="groupInstruction" label="权限组简介" min-width="140" sortable>
                </el-table-column>
                <el-table-column label="详情" min-width="180">
                    <template slot-scope="scope">
                        <el-button @click="chooseGrouplist(scope.$index, scope.row)">选择此权限组</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-form :model="resourceForm" label-width="100px" :rules="resourceFormRules" ref="resourceForm">
                <el-form-item label="权限组名" prop="groupName">
                    {{this.groupname}}
                </el-form-item>
                <el-form-item label="权限组Id" prop="groupId">
                    {{this.groupid}}
                </el-form-item>
                <!-- <el-form-item label="资源Id" prop="resourceId">
                    <el-input v-model="resourceForm.resourceId" auto-complete="off" placeholder="单行输入"></el-input>
                </el-form-item> -->

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="resourceFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="resourceSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <el-form-item label="资源名称" prop="resourceName">
                    <el-input v-model="editForm.resourceName" auto-complete="off" placeholder="单行输入"></el-input>
                </el-form-item>
                <el-form-item label="资源ID" prop="resourceId">
                    <el-input v-model="editForm.resourceId" auto-complete="off" placeholder="单行输入"></el-input>
                </el-form-item>
                <el-form-item label="资源url" prop="resourceUrl">
                    <el-input v-model="editForm.resourceUrl" auto-complete="off" placeholder="单行输入"></el-input>
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
                <el-form-item label="资源名称" prop="resourceName">
                    <el-input v-model="addForm.resourceName" auto-complete="off" placeholder="单行输入"></el-input>
                </el-form-item>
                <el-form-item label="资源url" prop="resourceUrl">
                    <el-input v-model="addForm.resourceUrl" auto-complete="off" placeholder="单行输入"></el-input>
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
    import {getResourcesList, addResources, updateResources, delResources, assignResources} from "../../api/api";
    import {getGroupList} from "../../api/api";
    import md5 from 'blueimp-md5';

    export default {
        data() {
            return {
                uname: "",
                filters: {
                    userId: '',
                    userName: ''
                },
                groupList: [],
                resourceList: [],
                total: 0,
                page: 0,
                size: 15,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {},
                //编辑界面数据
                editForm: {
                    resourceName: "",
                    resourceUrl: "",
                    resourceId: ''
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
                    resourceName: "",
                    resourceUrl: ""
                },

                resourceFormVisible: false,//资源编辑
                resourceLoading: false,
                resourceFormRules: {},
                resourceForm: {
                    groupId: "",
                    resourceIds: "",
                },
                groupid: '',
                groupname: ''
            }
        },
        methods: {
            dateFormat: dateFormat,
            //性别显示转换
            chooseGrouplist(index, row) {
                this.groupid = row.groupId;
                this.groupname = row.groupName
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
                getResourcesList(para).then((data) => {

                    console.log("----------");
                    console.log(data);
                    console.log("----------");

                    this.total = data.total;
                    // this.total = 100;
                    this.resourceList = data.resourceList;
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该群组吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {resourceIds: row.resourceId};
                    delResources(para).then((res) => {
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
            handleResource(index, row) {
                this.resourceFormVisible = true;
                this.resourceForm = {
                    groupId: this.groupid,
                };
                this.getGroupLists()
            },
            getGroupLists() {

                this.listLoading = true;
                //NProgress.start();
                getGroupList().then((data) => {

                    this.groupList = data.groupList;
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            //资源
            resourceSubmit: function () {
                var ids = this.sels.map(item => item.resourceId).toString();
                // var journalist = journalists.split(",")
                this.$confirm('确认添加吗', '提示', {}).then(() => {
                    this.addLoading = true;
                    //NProgress.start();
                    let para = {groupId: this.groupid, resourceIds: ids};
                    assignResources(para).then((res) => {
                        this.addLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '添加成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                });
            },

            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = {
                    resourceName: row.resourceName,
                    resourceUrl: row.resourceUrl,
                    resourceId: row.resourceId
                };
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    resourceName: "",
                    resourceUrl: ""
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {

                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;

                            let para = Object.assign({}, this.editForm);

                            updateResources(para).then((res) => {
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
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {

                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();

                            let para = Object.assign({}, this.addForm);

                            addResources(para).then((res) => {
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
                let resource = this.sels.map(item => item.resourceId).toString();
                var ids = resource.split(",")
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {resourceIds: ids};
                    delResources(para).then((res) => {
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