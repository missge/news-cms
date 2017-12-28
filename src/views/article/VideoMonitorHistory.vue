<template>
    <section>
         <el-col :span="24" class="toolbar">
                    <el-button type="primary" > 
                        <router-link :to="{ path: '/article/monitor/'+ids}" style=" color:#fff; text-decoraction: none;">返回上一级</router-link>
                    </el-button>            
        </el-col> 
        <el-table :data="monitorList" highlight-current-row v-loading="listLoading" style="width: 100%;">
            <el-table-column prop="videoline" label="线路"  width="180" sortable>
                <template slot-scope="scope">
                    <div v-if="scope.row.videoline === ''">-------</div>
                    <div v-else>{{scope.row.videoline}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="url" label="视频url" min-width="300" sortable>
               <template slot-scope="scope">
                    <el-tooltip class="item" effect="dark" :content="scope.row.url" placement="top-end">
                        <div class="sTitle"> {{scope.row.url}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="monitorStatus" label="监控状态" width="180" sortable>
                 <template slot-scope="scope">
                        <div v-if="scope.row.monitorStatus === 'success'">正常</div>
                        <div style="color:red" v-if="scope.row.monitorStatus === 'error'">错误</div>
                    </template>  
            </el-table-column>
            <el-table-column prop="logTime" label="错误时间" :formatter="dateFormat" min-width="160" sortable>
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
import { getVideoMonitorHistory } from "../../api/api";

export default {
    data() {
        return {
            filters: {
                articleId: ''
            },
            ids:0,
            monitorList: [],
            total: 0,
            page: 1,
            size: 10,
            listLoading: false,
            sels: [],//列表选中列
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
           this.ids = id;
            let para = {
                page: this.page-1,
                size: this.size,
                ...filters
            };
            this.listLoading = true;
            getVideoMonitorHistory(id, para).then((data) => {
                this.total = data.total;
                this.monitorList = data.monitorList;
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

<style scoped lang="scss">
.sTitle {
    width: 350px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer
}
</style>
