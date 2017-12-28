<template>
    <section>
         <el-col :span="24" class="toolbar" style="margin-left:20%;width: 60%;">
            <el-row :gutter="20">
                <el-col :span="6">
                    <div style="font-size: 15px">
                        <b>文章Id:{{articleId}}</b>
                    </div>
                </el-col>
                <el-col :span="4" :offset="14">
                    <el-button type="primary" size="small"> 
                        <router-link :to="{ path: '/article/monitor/'+ids}" style=" color:#fff; text-decoraction: none;">返回上一级</router-link>
                    </el-button>
                </el-col>
            </el-row>
        </el-col>
        <el-table :data="updateList" highlight-current-row v-loading="listLoading" style="margin-left:20%;width: 60%;height: 400px">
            <el-table-column prop="updateStartTime" label="更新开始时间" :formatter="dateFormat" width="240" sortable>
            </el-table-column>
            <el-table-column prop="updateEndTime" label="更新结束时间" :formatter="dateFormat" width="240" sortable>
            </el-table-column>
            <el-table-column prop="liveStatus" label="文章状态" min-width="240" sortable>
                <template slot-scope="scope">
                    <div v-if="scope.row.liveStatus === '1'">直播中</div>
                    <div v-if="scope.row.liveStatus === '2'">预告</div>
                    <div v-if="scope.row.liveStatus === '3'">回顾</div>
                </template>
            </el-table-column>
        </el-table>
         <!--工具条-->
        <el-col :span="24" class="toolbar" style="margin-left:20%;width: 60%;">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size" :total="total" style="float:right;">
            </el-pagination>
        </el-col>
    </section>
</template>

<script>
import util, { dateFormat } from '../../common/js/util';
import { getArticleStatusHistory } from "../../api/api";

export default {
    data() {
        return {
            articleId: '',
            updateList: [],
            total: 0,
            page: 0,
            size: 10,
            listLoading: false,
            sels: [],//列表选中列
            ids:""
        }
    },
    methods: {
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
                }
            };
            const id = this.$route.params.id;
            this.ids= id;
            let para = {
                page: this.page,
                size: this.size,
                ...filters
            };
            this.listLoading = true;
            getArticleStatusHistory(id, para).then((data) => {

                this.total = data.total;
                this.updateList = data.updateList;
                this.articleId = data.updateList[0].articleId;
                this.listLoading = false;
            }).catch(message => {
                this.listLoading = false;
                this.$message.error(message);
            });
        }

    },
    mounted() {
        this.getUsers();
    }
}

</script>