<template>
    <section>
        <h2>{{id}} 上一级评论内容：{{this.$route.params.content}}</h2>
        <h3>{{this.a}}：{{this.b}}</h3>
        <!-- <el-col :span="24" class="toolbar">
                                                            <el-button type="primary" > 
                                                                <router-link :to="{ name: '评论列表', params:'id'}" style=" color:#fff; text-decoraction: none;">返回上一级</router-link>
                                                            </el-button>            
                                                </el-col>  -->
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
        <el-table :data="replyList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="70">
            </el-table-column>
            <el-table-column prop="_id" width="1" >
                <template slot-scope="scope">
                    <div class="sTitles"> {{scope.row._id}} </div>
                </template>
            </el-table-column>
            <el-table-column prop="userId" label="用户id" min-width="120" >
            </el-table-column>
            <el-table-column prop="user.username" label="用户名" width="120" >
            </el-table-column>
            <!-- <el-table-column prop="user.ip" label="ip" width="120" sortable>
                    </el-table-column> -->
            <el-table-column prop="content" label="评论内容" min-width="120" >
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="dark" :content="scope.row.content" placement="top-end">
                        <div class="scontent"> {{scope.row.content}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="commentTime" label="评论时间" :formatter="dateFormat" width="120" >
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
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
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
import { getReplyList, getViewList, publishView, getJournalist, commentStatus } from "../../api/api";

//moment.js库
import moment from 'moment'

export default {
    data() {
        return {
            a: '通过数',
            b: '',
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
            journalists: [],
            activeName2: 'first',

            value: '',
            id: '',
            totals: '',
            labels: "通过数",

            filters: {
                commentId: this.$route.params.commentId,
                articleId: this.$route.params.articleId,
                status: "checked",
                // startTime: new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000)),
                startTime: 1504195200000,
                endTime: new Date(),
            },
            replyList: [],
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
            chooseJournalists: {
                articleId: "",//6059
                userId: "", //发帖人用户id
                targetUserId: "", //当type=3或4时候传，其他类型不需要,要回复的帖子用户id
                commentId: "", //当type=3或4时候传，其他类型不需要,要回复的帖子id
                mainCommentId: "", //要回复的帖子i,当type=3或4时候传，要回复的帖子的主贴id（如果是回复类型且没有传，认为要回复的帖子为主帖）
                articleTitle: "",//文章标题
                menuId: "",//栏目id
                menuName: "",//栏目名称
                content: "",//提问／评论内容
                type: "4",  // 1:提问、2、普通评论、3:用户回复、4:记者回复
                extra: ""
            },
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
            this.a = this.labels;
            this.getUsers()
        },
        chooseJournalist(index, row) {
            var extrass = ""
            extrass = JSON.parse(sessionStorage.getItem('extrass'))
            this.chooseJournalists = {
                articleId: this.$route.params.articleId,
                userId: row._id,
                targetUserId: this.$route.params.userId,
                commentId: this.$route.params.commentId,
                mainCommentId: this.$route.params.commentId,
                articleTitle: this.$route.params.title,
                menuId: this.$route.params.menuId,
                menuName: this.$route.params.titles,
                content: "",
                type: "4",
                extra: JSON.stringify({ "articleId": this.$route.params.articleId, "title": this.$route.params.title, "url": extrass.artUrl, "contentType": extrass.contentType, "images": extrass.images })
            }
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
        getUsers(value) {

            const id = this.$route.params.id;
            this.id = id;
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
                ...filters
            };
            this.listLoading = true;
            //NProgress.start();
            getReplyList(para).then((data) => {

                console.log("----------");
                console.log(data);
                console.log("----------");

                this.b = data.total;
                this.total = data.total;
                //  this.total = 100;
                this.replyList = data.replyList;
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
                removeUser(para).then((res) => {
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                })
            });
        },
        //显示编辑界面
        handleEdit: function(index, row) {
            //this.editFormVisible = true;

            this.$router.push(`/article/monitor/${row.articleId}`);
        },
        //显示新增界面
        handleAdd: function() {
            this.addFormVisible = true;
            this.addForm = {
                name: '',
                content: ''
            };
            this.getJournalists();
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
        //新增
        addSubmit: function() {
            this.$refs.chooseJournalists.validate((valid) => {
                if (valid) {
                    this.$confirm('确认提交吗？', '提示', {}).then(() => {
                        this.addLoading = true;
                        //NProgress.start();
                        let para = Object.assign({}, this.chooseJournalists);
                        publishView(para).then((res) => {
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
                commentStatus(para).then((res) => {
                    this.addLoading = false;
                    //NProgress.done();
                    this.$message({
                        message: '删除成功',
                        type: 'success'
                    });
                    this.getUsers();
                }).catch(message => {
                    this.addLoading = false;
                    this.$message.error(message);
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
    width: 180px;
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