<template>
    <section>
        <br>
        <el-collapse>
            <el-collapse-item title="审发状态切换">
                <div>
                    <span style="display:inline-block;margin-right:40px" v-if="this.commentconfig =='firstCheck'">当前状态：先审后发</span>
                    <span style="display:inline-block;margin-right:40px" v-if="this.commentconfig =='afterCheck'">当前状态：先发后审</span>
                    <el-button type="info" v-if="this.commentconfig =='firstCheck'" @click.native="checkStatus">先发后审
                    </el-button>
                    <el-button type="info" v-if="this.commentconfig =='afterCheck'" @click.native="checkStatus">先审后发
                    </el-button>
                </div>
            </el-collapse-item>
        </el-collapse>

        <el-col :span="24" class="toolbar" style="min-width:910px">
            <el-form :inline="true" :model="filters">
                <template>
                    <el-select v-model="filters.appId" placeholder="请选择应用" @change="getColumnMenu">
                        <el-option v-for="item in newTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <template>
                    <el-select v-model="filters.channel" placeholder="选择语言" @change="getColumnMenu">
                        <el-option v-for="item in languageTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <!--{{filterColumn}}-->
                <template>
                    <el-select v-model="filterColumn" placeholder="选择栏目" :disabled="Column.length===0"
                               @change="getUsers" multiple>
                        <el-option v-for="item in Column" :key="item.value" :label="item.title" :value="item.columnId">
                        </el-option>
                    </el-select>
                </template>
                <template>
                    <el-select v-model="filters.status" placeholder="请选择" @change="getStatus">
                        <el-option v-for="item in statusTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
            </el-form>
        </el-col>
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">

                <el-form-item>
                    <el-input v-model="filters.title" placeholder="标题"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.articleId" placeholder="文章Id"></el-input>
                </el-form-item>

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
                <el-form-item>
                    待审核：{{waitingCheckNum}}条，通过：{{passCheckNum}}条，删除：{{deleteCheckNum}}条，共{{totalCheckNum}}条
                </el-form-item>
            </el-form>
        </el-col>

        <br>
        <!--{{commentList.length !== 0}}-->
        <el-table :data="commentList" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="70">
            </el-table-column>
            <el-table-column prop="commentTime" label="时间" :formatter="dateFormat" width="120">
            </el-table-column>

            <el-table-column :data="commentList" label="评论内容" min-width="120">
                <template slot-scope="scope">
                    <div>
                        <b>评论内容：</b>{{scope.row.content}}
                    </div>
                    <!-- <div v-if="scope.row.parentCommentId!=='-1'">                                                                                                <b>回复对象id：</b>{{scope.row.origin[0].userId}}
                                                                                                </div> -->
                    <div v-if="scope.row.parentCommentId!=='-1'">
                        <b>回复内容：</b>{{scope.row.origin[0].content}}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="blockType" label="评论类型" width="150">
                <template slot-scope="scope">
                    <div v-if="scope.row.blockType === 'senstiveBlock'" style="color:red"> 包含敏感词</div>
                    <div v-else-if="scope.row.blockType ==='deviceBlock'" style="color:red"> 封禁设备 </div>
                    <div v-else-if="scope.row.blockType ==='userBlock'" style="color:red"> 黑名单用户 </div>
                    <div v-else-if="scope.row.blockType ==='normal'"> 正常</div>
                    <div v-else>------</div>
                </template>
            </el-table-column>
            <el-table-column :data="commentList" label="文章" min-width="120">
                <template slot-scope="scope">
                    <div>
                        <b>文章Id：</b>{{scope.row.articleId}}
                    </div>
                    <div>
                        <b>标题：</b>{{scope.row.articleTitle}}
                    </div>
                </template>
            </el-table-column>
            <el-table-column :data="commentList" label="用户名" min-width="180">
                <template slot-scope="scope">
                    <div>
                        <b>用户名：</b>{{scope.row.user.username || ''}}
                    </div>
                    <div>
                        <b>用户Id：</b>{{scope.row.user._id}}
                    </div>
                    <div>
                        <b>设备Id：</b>{{scope.row.deviceId}}
                    </div>
                </template>
            </el-table-column>
            <!--  <el-table-column label="审核人" prop="commentTime" width="140">

              </el-table-column>-->
            <el-table-column label="操作记录" width="140">
                <template slot-scope="scope">
                    <el-button size="small" @click="showHistory(scope)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button v-if="this.labels !=='通过数'" type="success" @click.native="batchRecover"
                       :disabled="this.sels.length===0" :loading="addLoading">通过
            </el-button>
            <el-button v-if="this.labels !=='删除数'" type="danger" @click.native="batchRemove"
                       :disabled="this.sels.length===0" :loading="addLoading">删除
            </el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>
        <!--操作记录弹框-->
        <operationRecord ref="operhis"></operationRecord>
    </section>
</template>

<script>
    import util, {dateFormat, InitMenu} from '../../common/js/util'
    //import NProgress from 'nprogress'
    import {removeUser, batchRemoveUser, editUser, addUser, getAppList, getColumnsList} from '../../api/api';
    import {
        getAllComment,
        publishView,
        getJournalist,
        commentStatus,
        checkStatus,
        getCommentConfig,
        commentCount,
        updateAd
    } from "../../api/api";
    //组件引入
    import operationRecord from '../../components/OperationRrecord'


    export default {
        components: {operationRecord},

        data() {
            return {
                languageTypeOptions: [
                    {
                        value: '',
                        label: '全部'
                    }, {
                        value: 'zh',
                        label: '中文'
                    }, {
                        value: 'en',
                        label: '英文'
                    }, {
                        value: 'fr',
                        label: '法文'
                    },
                    {
                        value: 'ar',
                        label: '阿拉伯文'
                    }, {
                        value: 'ru',
                        label: '俄文'//俄文
                    }, {
                        value: 'sp',
                        label: '西班牙文'
                    }, {
                        value: 'de',
                        label: '德文'
                    }, {
                        value: 'ko',
                        label: '韩文'
                    }, {
                        value: 'ja',
                        label: '日文'
                    }],
                newTypeOptions: [],
                Column: [],
                waitingCheckNum: 0,
                passCheckNum: 0,
                deleteCheckNum: 0,
                totalCheckNum: 0,
                type: '',
                c: '通过数',
                d: '',
                commentType: [
                    {
                        value: 'senstiveBlock',
                        label: '包含敏感词'
                    }, {
                        value: 'deviceBlock',
                        label: '封禁设备'
                    }, {
                        value: 'userBlock',
                        label: '黑名单用户'
                    }, {
                        value: 'normal',
                        label: '正常'
                    }
                ],
                statusTypeOptions: [{
                    value: 'waitCheck',
                    label: '等待审核'
                }, {
                    value: 'checked',
                    label: '通过'
                }, {
                    value: 'delete',
                    label: '删除'
                }],
                value: '',

                id: '',
                title: '',
                status: '',
                totals: '',
                labels: "待审核数",

                filters: {
                    appId: '',
                    channel: '',
                    BlockType: '',
                    title: '',
                    articleId: '',
                    status: "waitCheck",
                    // startTime: new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000)),
                    startTime: 1504195200000,
                    endTime: new Date(),
                    Column: null

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
                        {required: true, message: '请输入姓名', trigger: 'blur'}
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
                        {required: true, message: '请输入姓名', trigger: 'blur'}
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
                url: '',
                contentType: '',
                commentconfig: '',
                checkonfig: '',
                filterColumn: null
            }
        },
        methods: {
            /*展示操作记录*/
            showHistory(scope) {
//                let _this = this;
                this.$refs.operhis.showOperation(scope.row, 'AllReviewList')
            },
            getconfig() {
                this.listLoading = true;
                getCommentConfig().then((data) => {
                    this.commentconfig = data.config.commentAudit;
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });

            },
            checkStatus() {

                this.$confirm('确认修改吗', '提示', {}).then(() => {
                    this.addLoading = true;
                    if (this.commentconfig == "firstCheck") {
                        this.checkonfig = "afterCheck"
                    } else if (this.commentconfig == "afterCheck") {
                        this.checkonfig = "firstCheck"
                    }
                    ;
                    // NProgress.start();
                    let para = {
                        "type": "comment",
                        "config": {
                            commentAudit: this.checkonfig,
                            hasAsk: "true",
                            isComment: "true"
                        }
                    };
                    checkStatus(para).then((res) => {
                        this.addLoading = false;
                        //NProgress.done();
                        this.getconfig();
                        this.$message({
                            message: '修改成功',
                            type: 'success',
                        });
                    }).catch(message => {
                        this.addLoading = false;
                        this.$message.error(message);
                    });
                    this.getconfig();
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
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
            //时间戳改成标准时间
            dateFormat: dateFormat,
            handleCurrentChange(val) {
                this.page = val;
                this.getUsers();
            },
            //获取用户列表
            getUsers() {
                this.getStatistics();
                const id = this.$route.params.id;
                const title = this.$route.params.title;
                let filters = {};
                for (let name in this.filters) {
                    if (this.filters[name]) {
                        filters[name] = this.filters[name];
                        //时间改为时间戳
                        filters.startTime = new Date(this.filters.startTime).getTime();
                        filters.endTime = new Date(this.filters.endTime).getTime();
                    }
                    ;
                }
                let para = {
                    page: this.page - 1,
                    size: this.size,
                    ...filters
                };
//                console.log(para);
                if (para.Column) {
                    para.Column = para.Column
                    console.log('para.menuids ', typeof para.Column)
                }

                var para2 = {
                    articleId: para.articleId,
                    title: para.title,
                    status: para.status,
                    startTime: para.startTime,
                    endTime: para.endTime,
                    page: para.page,
                    size: para.size,
                }
//                if (para.Column) {
//                    para2.menuids = para.menuids
//                }
//                para2.menuIds = `[${this.filterColumn.join(',')}]`


                para2.menuIds = this.filterColumn.join(',')


                console.log(para2)
                this.listLoading = true;
                getAllComment(para2).then((data) => {

                    this.total = data.total;
                    this.commentList = data.commentList;
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error('获取数据出现错误');
                });
            },

            //批量删除
            batchRemove: function () {

                var userids = this.sels.map(item => item._id).toString();
                // var journalist = journalists.split(",")
                this.$confirm('确认删除吗', '提示', {}).then(() => {
                    this.addLoading = true;
                    //NProgress.start();
                    let para = {"commentIds": userids, "status": "delete"};
                    commentStatus(para).then((res) => {
                        this.addLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                });

            },
            batchRecover: function () {

                var userids = this.sels.map(item => item._id).toString();
                this.$confirm('确认恢复吗', '提示', {}).then(() => {
                    this.addLoading = true;
                    //NProgress.start();
                    let para = {"commentIds": userids, "status": "checked"};
                    commentStatus(para).then((res) => {
                        this.addLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '恢复成功',
                            type: 'success'
                        });
                        this.getStatistics();
                        this.getUsers();
                    });
                });
            },

            getSelectList() {
                let _this = this;
                InitMenu(this.newTypeOptions, function (menulist) {
                    menulist.forEach(x => {
                        if (x.label === '中国网') {
                            _this.filters.appId = x.value;
                        }
                    })
                })
            },
            getColumnMenu() {
                console.log({skip: 0, limit: 100, language: this.filters.channel, appID: this.filters.appId})
                getColumnsList({
                    skip: 0,
                    limit: 100,
                    language: this.filters.channel,
                    appID: this.filters.appId
                }).then((data) => {
//                    this.filters.Column = [];
                    this.Column = data.list
                    this.Column.unshift({title: '全部', columnId: ''})
                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message, '33333333333');
                });
            }
            ,
            /**
             * 获取统计信息
             */
            getStatistics() {
                console.log('获取统计信息');
                commentCount({
                    /*startTime: new Date(this.filters.startTime).getTime(),
                    endTime: new Date(this.filters.endTime).getTime()*/
                }).then(
                    data => {
                        this.waitingCheckNum = data.waitCheck ? data.waitCheck : 0;
                        this.passCheckNum = data.checked;
                        this.deleteCheckNum = data.delete;
                        this.totalCheckNum = this.waitingCheckNum + this.passCheckNum + this.deleteCheckNum
                    }
                ).catch()

            }
        },
        mounted() {

            this.getUsers();
            this.getSelectList();
            this.getconfig();
        }
    }

</script>

<style scoped lang="scss">

</style>