<template>
    <section>
        <h3>黑名单列表</h3>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <!-- 下拉菜单筛选 -->
                <template>
                    <el-select v-model="type" placeholder="请选择" @change="chooseType">
                        <el-option v-for="item in TypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <el-form-item>
                    <el-input v-model="filters.entityId" placeholder="封禁Id"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.entityName" placeholder="封禁名称"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" v-on:click="serchBlacks">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="list" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="100">
            </el-table-column>

            <template v-if="this.type == 'device'">
                <el-table-column prop="entityId" label="设备Id" min-width="140" >
                </el-table-column>
                <el-table-column prop="entityName" label="设备名" min-width="140" >
                </el-table-column>
            </template>
            <template v-else>
                <el-table-column prop="entityId" label="用户Id" min-width="140" >
                </el-table-column>

                <el-table-column prop="entityName" label="用户名" min-width="140" >
                </el-table-column>
            </template>


            <el-table-column prop="type" label="封禁类型" min-width="140" >
            </el-table-column>
            <el-table-column prop="creator" label="创建者" min-width="140" >
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" :formatter="dateFormat" min-width="140" >
            </el-table-column>
            <el-table-column label="详情" min-width="180">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">更新</el-button>
                    <el-button size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <!-- <el-button type="danger" @click="delJournalist" :disabled="this.sels.length===0">批量删除</el-button> -->
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="limit"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>
        <!--编辑界面-->
        <el-dialog title="更新" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <el-form-item label="封禁Id" prop="entityId">
                    {{this.editForm.entityId}}
                </el-form-item>
                <el-form-item label="封禁简介" prop="entityName">
                    <el-input v-model="editForm.entityName" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false" size="small">
            <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
                <el-form-item label="封禁类型" prop="entityId">
                    <el-select v-model="addForm.type" placeholder="请选择">
                        <el-option v-for="item in addTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="this.addForm.type == 'user'" label="用户Id：" prop="entityId">
                    <el-input v-model="addForm.entityId"></el-input>
                </el-form-item>
                <el-form-item v-if="this.addForm.type == 'device'" label="设备Id：" prop="entityId">
                    <el-input v-model="addForm.entityId"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="entityName">
                    <el-input v-model="addForm.entityName"></el-input>
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
    import util, {dateFormat} from '../../common/js/util'
    import {addBlack, serchBlack, deleteBlack, updateBlack} from '../../api/api';
    import {getBlackList, searchUsers, dealJournalist} from "../../api/api";

    export default {
        data() {
            return {
                TypeOptions: [{
                    value: 'device',
                    label: '设备封禁'
                }, {
                    value: 'user',
                    label: '用户封禁'
                }],
                addTypeOptions: [{
                    value: 'device',
                    label: '设备封禁'
                }, {
                    value: 'user',
                    label: '用户封禁'
                }],
                value: '',

                article: "记者列表",
                type: 'user',
                filters: {

                    articleId: '',
                    articleType: '',
                    liveStatus: '',
                    startTime: new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000)),
                    endTime: new Date(),
                },
                filterUser: {
                    keywords: ''
                },
                list: [],
                journalists: [],
                total: 0,
                page: 1,
                limit: 10,
                listLoading: false,
                sels: [],//列表选中列

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    type: [{required: true, message: '请选择类型', trigger: 'blur'}],
                    entityId: [
                        {required: true, message: '请输入Id', trigger: 'blur'}
                    ],
                    entityName: [
                        {required: true, message: '请输入名称', trigger: 'blur'}
                    ]
                },
                //新增界面数据
                addForm: {
                    type: "user", //'user', 'device'
                    entityId: "", //userId、deviceId
                    entityName: "" //用户名、设备名称
                },
                timeValue: "",
                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                editForm: {
                    entityId: '',
                    entityName: ''
                },

            }
        },
        methods: {
            //删除
            handleDel: function (index, row) {
//                let tt = (this.type === 'device') ? '设备' : '用户'
                this.$confirm(`确定要删除该${(this.type === 'device') ? '设备' : '用户'}吗?`, '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let type = this.type;
                    let entityId = row.entityId;
                    deleteBlack(type, entityId)
                        .then((res) => {
                            this.listLoading = false;
                            //NProgress.done();
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getUsers();
                        }).catch(message => {
                        this.listLoading = false;
                        this.$message.error(message);
                    });
                }).catch(() => {

                });
            },
            dateFormat: dateFormat,
            chooseType(value) {
                this.type = value;
                this.getUsers()
            },

            getArticle(value) {
                this.article = value;
                console.log("+++++++++");
                console.log(this.article)
            },
            //时间戳改成标准时间
            dateFormat: dateFormat,
            handleCurrentChange(val) {
                this.page = val
            },
            //获取用户列表
            getUsers() {
                let types = this.type
                let para = {
                    page: this.page - 1,
                    limit: this.limit,
                    // ...filters
                };
                this.listLoading = true;
                //NProgress.start();
                getBlackList(types).then((data) => {
                    this.total = data.count;
                    this.list = data.list;
                    this.listLoading = false;

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            serchBlacks() {
                let filters = {};
                for (let name in this.filters) {
                    if (this.filters[name]) {
                        filters[name] = this.filters[name];
                        filters.startTime = new Date(this.filters.startTime).getTime();
                        filters.endTime = new Date(this.filters.endTime).getTime();
                    }
                    ;

                }
                ;
                let para = {
                    ...filters
                };
                let type = this.type
                this.listLoading = true;
                //NProgress.start();
                serchBlack(type, para).then((data) => {
                    this.list = data.list;
                    this.listLoading = false;

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error("查询id或名称为空");
                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = {
                    entityId: row.entityId,
                    entityName: row.entityName
                };
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    type: this.filters.type, //'user', 'device'
                    entityId: "", //userId、deviceId
                    entityName: "" //用户名、设备名称
                };
            },
            //新增
            addSubmit: function () {

                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            let para = Object.assign({}, this.addForm);
                            let type = this.addForm.type
                            addBlack(type, para)
                                .then((res) => {
                                    this.addLoading = false;
                                    //NProgress.done();
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success',

                                    })
                                    this.$refs['addForm'].resetFields();
                                    this.addFormVisible = false;
                                    this.getUsers();
                                }).catch(message => {
                                // this.addLoading = false;
                                this.$confirm('不在用户系统里', '提示', {})
                                // this.$message.error(message);

                            });
                            ;
                        });

                    }
                });
            },
            //更新
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {

                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            let type = this.filters.type;
                            let entityId = this.editForm.entityId
                            let para = {entityName: this.editForm.entityName};
                            updateBlack(type, entityId, para)
                                .then((res) => {
                                    this.editLoading = false;
                                    //NProgress.done();
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
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
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            delJournalist: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        var journalists = this.sels.map(item => item._id).toString();
                        // var journalist = journalists.split(",")
                        this.$confirm('确认删除吗', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = {"userIds": journalists, "type": "remove"};
                            dealJournalist(para).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
                                this.$refs['addForm'].resetFields();
                                this.getUsers();
                            });
                        });
                    }
                });
            },
        },
        mounted() {
            this.getUsers();
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