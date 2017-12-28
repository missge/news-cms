<template>
    <section>
        <h3>文章id:{{id}} &nbsp;&nbsp; 标题：{{title}}</h3>
        <h3>{{this.c}}：{{this.d}}</h3>
        <el-col :span="24" class="toolbar">
            <el-button type="primary">
                <router-link :to="{ name: '评论'}" style=" color:#fff; text-decoraction: none;">返回上一级</router-link>
            </el-button>
        </el-col>

        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <template>
                    <el-select v-model="filters.status" placeholder="请选择" @change="getStatus">
                        <el-option v-for="item in statusTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <el-form-item>
                    开始时间：
                    <el-date-picker v-model="filters.startTime" type="date" placeholder="开始时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    结束时间：
                    <el-date-picker v-model="filters.endTime" type="date" placeholder="结束时间">
                    </el-date-picker>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" v-on:click="getUsers">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <el-table :data="commentList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="70">
            </el-table-column>
            <el-table-column prop="userId" label="用户id" min-width="120" >
            </el-table-column>
            <el-table-column prop="_id" width="1">
                <template slot-scope="scope">
                    <div class="sTitles"> {{scope.row._id}} </div>
                </template>
            </el-table-column>
            <el-table-column prop="user.username" label="用户名" width="120" >
            </el-table-column>
            <el-table-column prop="commentTime" label="评论时间" :formatter="dateFormat" min-width="120" >
            </el-table-column>
            <el-table-column prop="replyCount" label="回复数" width="100" >
            </el-table-column>
            <el-table-column prop="upvoteCount" label="点赞数" width="100" >
            </el-table-column>
            <el-table-column prop="content" label="评论内容" width="120" >
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="dark" :content="scope.row.content" placement="top-end">
                        <div class="scontent"> {{scope.row.content}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="260">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">查看回复</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button v-if="this.labels!=='通过数'" type="success" @click.native="handleRecover" :disabled="this.sels.length===0" :loading="addLoading">恢复</el-button>
            <el-button v-if="this.labels!=='删除数'" type="danger" @click.native="batchRemove" :disabled="this.sels.length===0" :loading="addLoading">删除</el-button>

            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false" size="large">
            <el-table :data="journalists" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
                <el-table-column prop="_id" label="id" width="140" sortable>
                </el-table-column>
                <el-table-column prop="username" label="昵称" min-width="260" sortable>
                </el-table-column>
                <el-table-column label="选择" width="180">
                    <template slot-scope="scope">
                        <el-button size="small" @click="chooseJournalist(scope.$index, scope.row)">选择此记者</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-form :model="chooseJournalists" label-width="80px" :rules="addFormRules" ref="chooseJournalists">
                <h3>
                    <b> 记者id：</b>{{ this.chooseJournalists.userId}}</h3>
                <el-form-item label="评论内容" prop="content">
                    <el-input v-model="chooseJournalists.content"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
                <el-button @click.native="addFormVisible = false">取消</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
import util, { dateFormat } from '../../common/js/util'
//import NProgress from 'nprogress'
import { removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';
import { getViewList, publishView, getJournalist, commentStatus } from "../../api/api";

//moment.js库
import moment from 'moment'

export default {
    data() {
        return {
            c: '通过数',
            d: '',
            statusTypeOptions: [{
                value: 'checked',
                label: '通过'
            }, {
                value: 'waitCheck',
                label: '等待审核'
            }, {
                value: 'delete',
                label: '删除'
            }],
            value: '',

            id: '',
            title: '',
            status: '',
            totals: '',
            labels: "通过数",

            filters: {
                title: '',
                articleId: '',
                status: "checked",
                startTime: 1504195201000,
                endTime: new Date(),
            },
            commentList: [],
            total: 0,
            page: 1,
            size: 10,
            listLoading: false,
            sels: [],//列表选中列
            // maxStartTime:'',

            editFormVisible: false,//编辑界面是否显示
            editLoading: false,
            editFormRules: {
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' }
                ]
            },
            //编辑界面数据
            editForm: {
                id: 0,
                name: '',
                sex: -1,
                age: 0,
                birth: '',
                addr: ''
            },

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
            timeValue: "",
            journalists: [],
            handleChooseJournalists: false,
            chooseJournalists: {
                articleId: "",//6059
                userId: "", //发帖人用户id
                // targetUserId: "", //当type=3或4时候传，其他类型不需要,要回复的帖子用户id
                commentId: "", //当type=3或4时候传，其他类型不需要,要回复的帖子id
                mainCommentId: "", //要回复的帖子i,当type=3或4时候传，要回复的帖子的主贴id（如果是回复类型且没有传，认为要回复的帖子为主帖）
                articleTitle: "",//文章标题
                menuId: "",//栏目id
                menuName: "",//栏目名称
                content: "",//提问／评论内容
                type: "4",  // 1:提问、2、普通评论、3:用户回复、4:记者回复
                extra: ""
            },
            url: '',
            contentType: ''
        }
    },
    methods: {
        getStatus(value) {

            if (value == "checked") {
                this.labels = "通过数"
            } else if (value == 'waitCheck') {
                this.labels = "待审核数"
            } else (
                this.labels = "删除数"
            );
            this.c = this.labels;

            this.getUsers()
        },
        chooseJournalist(index, row) {
            var extras = ""
            extras = JSON.parse(sessionStorage.getItem('extras'));
            this.chooseJournalists = {
                articleId: this.id,
                userId: row._id,
                // targetUserId: "",
                // commentId: "-1",
                // mainCommentId: '-1',
                articleTitle: this.title,
                menuId: this.$route.params.menuId,
                menuName: this.$route.params.menuName,
                content: "",
                type: "2",
                extra: JSON.stringify({ "articleId": this.id, "title": this.title, "url": extras.artUrl, "contentType": extras.contentType, "images": extras.images })
            };
            console.log(this.chooseJournalists.extra)
        },
        getJournalists() {
            let para = {
                page: this.page - 1,
                size: this.size,
            };
            this.listLoading = true;
            getJournalist(para).then((data) => {
                this.journalists = data.users;
                this.listLoading = false;
            }).catch(message => {
                this.listLoading = false;
                this.$message.error(message);
            });
            this.chooseJournalists.content = "";
        },
        //时间戳改成标准时间
        dateFormat: dateFormat,
        //性别显示转换
        formatSex: function(row, column) {
            return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
        },
        handleCurrentChange(val) {
            this.page = val;
            this.getUsers();
        },
        //获取用户列表
        getUsers() {
            const id = this.$route.params.id;
            const title = this.$route.params.title;
            this.id = id;
            this.title = title;
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
                ...filters,
                articleId: this.id
            };
            this.listLoading = true;
            //NProgress.start();
            getViewList(para).then((data) => {

                this.d = data.total;
                this.total = data.total;
                //  this.total = 100;
                this.commentList = data.commentList;
                this.totals = data.total;
                this.listLoading = false;
                //NProgress.done();

            }).catch(message => {
                this.listLoading = false;
                this.$message.error(message);
            });
        },
        //恢复
        handleRecover: function(index, row) {
            var userids = this.sels.map(item => item._id).toString();
            // var journalist = journalists.split(",")
            this.$confirm('确认恢复吗', '提示', {}).then(() => {
                this.addLoading = true;
                //NProgress.start();
                let para = { "commentIds": userids, "status": "checked" };
                commentStatus(para).then((res) => {
                    this.addLoading = false;
                    //NProgress.done();
                    this.$message({
                        message: '恢复成功',
                        type: 'success'
                    })
                    this.getUsers();
                }).catch(message => {
                    this.addLoading = false;
                    this.$message.error(message);
                });;
            });

        },
        //删除
        handleDel: function(index, row) {
            this.$confirm('确认删除该记录吗?', '提示', {
                type: 'warning'
            }).then(() => {
                this.listLoading = true;
                //NProgress.start();
                let para = { id: row.id };
                commentStatus(para)
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
                    })
            });
        },
        //显示编辑界面
        handleEdit: function(index, row) {
            sessionStorage.setItem('extrass', row.extra)

            this.$router.push(`/review/ReplyList/${this.$route.params.id}/${row._id}/${row.content}/${this.$route.params.menuId}/${this.$route.params.titles}/${row.userId}/${this.$route.params.title}`);
        },
        //显示新增界面
        handleAdd: function() {
            this.addFormVisible = true;
            this.addForm = {
                name: '',
                content: ''
            };
            //获取记者列表
            this.getJournalists();
        },
        //编辑
        editSubmit: function() {
            this.$refs.editForm.validate((valid) => {
                if (valid) {
                    this.$confirm('确认提交吗？', '提示', {}).then(() => {
                        this.editLoading = true;
                        //NProgress.start();
                        let para = Object.assign({}, this.editForm);
                        para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                        editUser(para).then((res) => {
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
        //评论新增
        addSubmit: function() {
            this.$refs.chooseJournalists.validate((valid) => {
                if (valid) {
                    this.$confirm('确认提交吗？', '提示', {}).then(() => {
                        this.addLoading = true;
                        //NProgress.start();
                        let para = Object.assign({}, this.chooseJournalists);
                        publishView(para)
                            .then((res) => {
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
                                this.$confirm('用户未被认证', '提示', {})
                                this.$message.error(message);
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

            var userids = this.sels.map(item => item._id).toString();
            // var journalist = journalists.split(",")
            this.$confirm('确认删除吗', '提示', {}).then(() => {
                this.addLoading = true;
                //NProgress.start();
                let para = { "commentIds": userids, "status": "delete" };
                commentStatus(para)
                    .then((res) => {
                        this.addLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        })
                        this.getUsers();
                    }).catch(message => {
                        this.addLoading = false;
                        this.$message.error(message);
                    });;
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
    width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer
}

.sTitles {
    width: 0px;
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