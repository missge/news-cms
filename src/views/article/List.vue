<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.title" placeholder="标题"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filters.articleId" placeholder="文章Id"></el-input>
                </el-form-item>
                <!-- 下拉菜单筛选 -->
                <template>
                    <el-select v-model="filters.articleType" placeholder="请选择">
                        <el-option v-for="item in articleTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <template>
                    <el-select v-model="filters.liveStatus" placeholder="请选择">
                        <el-option v-for="item in liveStatusOptions" :key="item.value" :label="item.label" :value="item.value">
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
        <el-table :data="articleList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="index" label="序号" width="70">
            </el-table-column>
            <el-table-column prop="articleId" label="文章id" width="120">
            </el-table-column>
            <el-table-column label="标题" min-width="170">
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="dark" :content="scope.row.title" placement="top-end">
                        <div class="sTitle"> {{scope.row.title}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="articleType" label="文章类型" :formatter="checkArticleType" width="120">
            </el-table-column>
            <el-table-column prop="videoStatus" label="监控状态" width="120">
            </el-table-column>
            <el-table-column prop="activityStatus" label="活动异常" width="120">
                <template slot-scope="scope">
                    <div v-if="scope.row.activityStatus === 'normal'">正常</div>
                    <div style="color:red" v-if="scope.row.activityStatus === 'error'">异常</div>
                </template>
            </el-table-column>
    
            <el-table-column prop="liveStatus" label="文章状态" :formatter="checkLiveStatus" width="120">
            </el-table-column>
            <el-table-column prop="latestFetchTime" label="最后抓取时间" :formatter="dateFormat" width="180">
            </el-table-column>
            <el-table-column label="详情" width="100">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">监控详情</el-button>
    
                </template>
            </el-table-column>
        </el-table>
    
        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size" :total="total" style="float:right;">
            </el-pagination>
        </el-col>
    
        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="性别">
                    <el-radio-group v-model="editForm.sex">
                        <el-radio class="radio" :label="1">男</el-radio>
                        <el-radio class="radio" :label="0">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="年龄">
                    <el-input-number v-model="editForm.age" :min="0" :max="200"></el-input-number>
                </el-form-item>
                <el-form-item label="生日">
                    <el-date-picker type="date" placeholder="选择日期" v-model="editForm.birth"></el-date-picker>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input type="textarea" v-model="editForm.addr"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
    
        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="性别">
                    <el-radio-group v-model="addForm.sex">
                        <el-radio class="radio" :label="1">男</el-radio>
                        <el-radio class="radio" :label="0">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="年龄">
                    <el-input-number v-model="addForm.age" :min="0" :max="200"></el-input-number>
                </el-form-item>
                <el-form-item label="生日">
                    <el-date-picker type="date" placeholder="选择日期" v-model="addForm.birth"></el-date-picker>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input type="textarea" v-model="addForm.addr"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
import util, { dateFormat } from '../../common/js/util'
import { getArticleList } from "../../api/api";
import moment from 'moment'

export default {
    data() {
        return {
            //下拉菜单
            articleTypeOptions: [{
                value: '7',
                label: '直播'
            }, {
                value: '8',
                label: '直播专题'
            }, {
                value: '9',
                label: '直击'
            }],
            liveStatusOptions: [{
                value: '1',
                label: '直播中'
            }, {
                value: '2',
                label: '预告'
            }, {
                value: '3',
                label: '回顾'
            }],
            value: '',

            filters: {
                title: '',
                articleId: '',
                articleType: '',
                liveStatus: '',
                startTime: new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000)),
                endTime: new Date(),
            },
            articleList: [],
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
            timeValue: ""

        }
    },
    methods: {
        selsChange: function(sels) {
            this.sels = sels;
        },
        //时间戳改成标准时间
        dateFormat: dateFormat,
        handleCurrentChange(val) {
            this.page = val;
            this.getUsers();
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
                page: this.page-1,
                size: this.size,
                ...filters
            };
            this.listLoading = true;
            //NProgress.start();
            getArticleList(para).then((data) => {

                console.log("----------");
                console.log(data);
                console.log("----------");

                this.total = data.total;
                //  this.total = 100;
                this.articleList = data.articleList;
                this.listLoading = false;
                //NProgress.done();

            }).catch(message => {
                this.listLoading = false;
                this.$message.error(message);
            });
        },
      
        //显示编辑界面
        handleEdit: function (index, row) {
            this.$router.push(`/article/monitor/${row.articleId}`);
        },
        // 字符替换
        checkLiveStatus: function (row, column) {
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
        checkArticleType: function (row, column) {
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
    width: 100%;
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