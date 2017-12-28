<template>
    <section>
        <h3>记者列表</h3>
        <!--列表-->
        <el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="100">
            </el-table-column>
            <el-table-column prop="_id" label="id" width="140" >
            </el-table-column>
            <el-table-column prop="avatar" label="头像" min-width="140" >
            </el-table-column>
            <el-table-column prop="username" label="昵称" width="140" >
            </el-table-column>
            <el-table-column prop="realName" label="真实姓名" width="140" >
            </el-table-column>
            <el-table-column prop="idCard" label="身份证号" width="140" >
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="danger" @click="delJournalist" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false" size="small">

            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">

                <b>用户名： </b>
                <el-input v-model="filterUser.keywords" placeholder="请输入用户名" style="width:30%"></el-input>
                <el-button type="primary" v-on:click="searchIds" style="margin-bottom:20px;margin-left:10%">查询</el-button>

                <el-table :data="journalists" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
                    <el-table-column type="selection" width="100">
                    </el-table-column>
                    <el-table-column prop="username" label="昵称" width="260" sortable>
                    </el-table-column>
                    <el-table-column prop="_id" label="id" min-width="140" sortable>
                    </el-table-column>
                </el-table>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :disabled="this.sels.length===0" :loading="addLoading">批量添加</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
import util, { dateFormat } from '../../common/js/util'
import { removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';
import { getJournalist, searchUsers, dealJournalist } from "../../api/api";

export default {
    data() {
        return {
            article: "记者列表",
            filters: {
                title: '',
                articleId: '',
                articleType: '',
                liveStatus: '',
                startTime: new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000)),
                endTime: new Date(),
            },
            filterUser: {
                keywords: ''
            },
            users: [],
            journalists: [],
            total: 0,
            page: 1,
            size: 10,
            listLoading: false,
            sels: [],//列表选中列

            addFormVisible: false,//新增界面是否显示
            addLoading: false,
            addFormRules: {
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' }
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
            timeValue: ""

        }
    },
    methods: {
        searchIds() {
            let filterUser = {};
            for (let name in this.filterUser) {
                if (this.filterUser[name]) {
                    filterUser[name] = this.filterUser[name];
                };
            }
            let para = {
                page: this.page - 1,
                size: this.size,
                ...filterUser
            };
            this.listLoading = true;
            searchUsers(para).then((data) => {
                this.journalists = data.users;
                this.listLoading = false;
            }).catch(message => {
                this.listLoading = false;
                this.$message.error(message);
            });
        },

        getArticle(value) {
            this.article = value;
            console.log("+++++++++");
            console.log(this.article)
        },
        //时间戳改成标准时间
        dateFormat: dateFormat,
        handleCurrentChange(val) {
            this.page = val;
            this.searchIds();
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
                };

            }

            let para = {
                page: this.page - 1,
                size: this.size,
                // ...filters
            };
            this.listLoading = true;
            //NProgress.start();
            getJournalist(para).then((data) => {
                this.total = data.total;
                this.users = data.users;
                this.listLoading = false;

            }).catch(message => {
                this.listLoading = false;
                this.$message.error(message);
            });
        },
        //显示编辑界面
        handleEdit: function(index, row) {
            this.$router.push(`/review/QuestionList/${row.articleId}`);
        },
        //显示新增界面
        handleAdd: function() {
            this.addFormVisible = true;
            this.addForm = {

            };
        },
        //批量新增
        addSubmit: function() {
            this.$refs.addForm.validate((valid) => {
                if (valid) {
                    var journalists = this.sels.map(item => item._id).toString();
                    // var journalist = journalists.split(",")
                    this.$confirm('确认添加吗？', '提示', {}).then(() => {
                        this.addLoading = true;
                        //NProgress.start();
                        let para = { "userIds": journalists, "type": "add" };
                        dealJournalist(para).then((res) => {
                            this.addLoading = false;
                            //NProgress.done();
                            this.$message({
                                message: '添加成功',
                                type: 'success'
                            });
                            this.$refs['addForm'].resetFields();
                            this.addFormVisible = false;
                            this.getUsers();
                        });
                    });
                }
                filters.keywords = ""

            });
        },
        selsChange: function(sels) {
            this.sels = sels;
        },
        //批量删除
        delJournalist: function() {

            var journalists = this.sels.map(item => item._id).toString();
            // var journalist = journalists.split(",")
            this.$confirm('确认删除吗', '提示', {}).then(() => {
                this.addLoading = true;
                //NProgress.start();
                let para = { "userIds": journalists, "type": "remove" };
                dealJournalist(para).then((res) => {
                    this.addLoading = false;                  
                    //NProgress.done();
                    this.$message({
                        message: '删除成功',
                        type: 'success'
                    });
                    this.getUsers();
                    this.$refs['addForm'].resetFields();
                    
                });
            });


        },
        // 字符替换
        checkLiveStatus: function(row, column) {
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
        checkArticleType: function(row, column) {
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
    }
}

</script>

<style scoped   lang="scss">
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