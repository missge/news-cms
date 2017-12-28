<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <template>
                    <el-select v-model="filters.appId" placeholder="请选择应用">
                        <el-option v-for="item in newTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <template>
                    <el-select v-model="filters.platform" placeholder="请选择平台">
                        <el-option v-for="item in platform" :key="item.value" :label="item.label" :value="item.value">
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

        <!--列表-->
        <el-table :data="feedbackList" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="index" label="序号" width="70">
            </el-table-column>
            <el-table-column prop="feedbackTime" :formatter="dateFormat" label="反馈时间" min-width="120" >
            </el-table-column>
            <el-table-column prop="feedbackMsg" label="反馈内容" width="180" >
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="light" placement="top-end">
                        <div slot="content"> 反馈内容：
                            <br/> {{scope.row.feedbackMsg}}
                        </div>
                        <div class="sTitle"> {{scope.row.feedbackMsg}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column label="反馈内容" width="100">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">详情</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="appVersion" label="应用版本" width="140" >
            </el-table-column>
            <el-table-column prop="osName" label="设备名称" width="220" >
            </el-table-column>
            <el-table-column prop="osVersion" label="系统版本" width="140" >
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="反馈详情" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <div prop="feedbackMsg">
                    <tree-view :data="editForm.feedbackMsg" :options="{maxDepth: 8}"></tree-view>
                </div>
            </el-form>
        </el-dialog>

    </section>
</template>

<script>
    import util, {dateFormat, InitMenu} from '../../common/js/util';
    //用户反馈
    import {feedBack, getAppList} from "../../api/api";
    import TreeView from "vue-json-tree-view";

    export default {
        data() {
            return {
                newTypeOptions: [{
                    value: '1501141078',
                    label: '礼拜助手'
                }, {
                    value: '1481620977745',
                    label: '中国网新闻'
                },
                    {
                        value: 'jpnews',
                        label: '中日最前线'
                    }
                ],
                platform: [{
                    value: '',
                    label: '全部'
                }, {
                    value: 'iOS',
                    label: 'iOS'
                }, {
                    value: 'Android',
                    label: 'Android'
                }, {
                    value: 'h5',
                    label: 'h5'
                }],
                value: '',

                filters: {
                    appId: '',
                    platform: '',
                    startTime: new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000)),
                    endTime: new Date(),
                },
                feedbackList: [],
                total: 0,
                page: 1,
                size: 10,
                listLoading: false,
                sels: [],//列表选中列
                feedbackMsg: "",

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

            }
        },
        methods: {
            dateFormat: dateFormat,
            handleCurrentChange(val) {
                this.page = val;
                this.getUsers();
            },
            //获取用户列表
            getUsers(row) {
                //筛选
                let filters = {};
                for (let name in this.filters) {
                    if (this.filters[name]) {
                        filters[name] = this.filters[name];
                        filters.startTime = new Date(this.filters.startTime).getTime();
                        filters.endTime = new Date(this.filters.endTime).getTime();
                    }
                }
//                const appId = this.filters.appId;
                let para = {
                    page: this.page - 1,
                    size: this.size,
                    ...filters,
                };

                para.appId = para.appId === '' ? 'chinaApp' : para.appId;
                const appId = para.appId;
                this.listLoading = true;
                feedBack(appId, para).then((data) => {

                    this.total = data.total;
                    this.feedbackList = data.feedbackList;
                    this.listLoading = false;

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = {
                    feedbackMsg: JSON.parse(row.feedbackMsg),

                };
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            getSelectList() {
//                InitMenu(this.newTypeOptions);
                let _this = this;
                InitMenu(this.newTypeOptions, function (menulist) {
                    menulist.forEach(x => {
                        if (x.label === '中国网') {
                            _this.filters.appId = x.value;
                        }
                    })
                })
            },
        },
        mounted() {
            this.getSelectList()
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