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
        <el-table :data="monitorList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="index" label="序号" width="80">
            </el-table-column>
            <el-table-column prop="articleId" label="文章id" width="100" >
            </el-table-column>
            <el-table-column prop="videoline" label="线路名称" :formatter="checkVideoLine" width="115" >
            </el-table-column>
            <el-table-column label="标题" width="260" >
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="dark" :content="scope.row.title" placement="top-end">
                        <div class="sTitle"> {{scope.row.title}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="url" label="视频url" min-width="180" >
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="light"  placement="top-end">
                        <div slot="content"> 视频url：
                            <br/> {{scope.row.url}} </div>
                         <div class="sTitle"> {{scope.row.url}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="liveStatus" label="文章状态" :formatter="checkLiveStatus" width="120" >
            </el-table-column>
            <el-table-column prop="logTime" label="最后异常时间" :formatter="dateFormat" width="140" >
            </el-table-column>
        </el-table>
    
        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size" :total="total" style="float:right;">
            </el-pagination>
        </el-col>
    </section>
</template>

<script>
import util, { dateFormat } from '../../common/js/util'
import { getAbnormalVideoList } from "../../api/api";

export default {
    data() {
        return {
            filters: {
                title: '',
                articleId: '',
                startTime: new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000)),
                endTime: new Date(),
            },
            monitorList: [],
            total: 0,
            page: 1,
            size: 10,
            listLoading: false,
            sels: [],//列表选中列

        }
    },
    methods: {
        //时间戳改成标准时间
        dateFormat: dateFormat,
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
                    filters.startTime = new Date(this.filters.startTime).getTime();
                    filters.endTime = new Date(this.filters.endTime).getTime();
                }
            }
            let para = {
                page: this.page -1,
                size: this.size,
                ...filters
            };
            this.listLoading = true;
            //NProgress.start();
            getAbnormalVideoList(para).then((data) => {

                this.total = data.total;
                this.monitorList = data.monitorList;
                this.listLoading = false;
            });
        },
       
        selsChange: function (sels) {
            this.sels = sels;
        },
        //字符串替换
        checkLiveStatus: function (row, column) {
            let status = row[column.property];
            switch (status) {
                case '1':
                    return "直播";
                case '2':
                    return "预告";
                case '3':
                    return "回顾";
            }
        },
        checkVideoLine: function (row, column) {
            let status = row[column.property];
            switch (status) {
                case '线路1':
                    return "线路1";
                case '线路2':
                    return "线路2";
                default :
                    return "-------"
            }
        },
    },
    mounted() {
        this.getUsers();
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