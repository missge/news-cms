<template>
    <section>
        <el-col :span="24" class="toolbar">
                    <el-button type="primary" > 
                        <router-link :to="{ path: '/article/monitor/'+ids}" style=" color:#fff; text-decoraction: none;">返回上一级</router-link>
                    </el-button>            
        </el-col> 
        <el-table :data="updateList" highlight-current-row v-loading="listLoading" style="width: 100%;">
            <el-table-column prop="updateStartTime" label="同步开始时间" :formatter="dateFormat" width="240" sortable>
            </el-table-column>
            <el-table-column prop="updateEndTime" label="同步结束时间" :formatter="dateFormat" width="240" sortable>
            </el-table-column>
            <el-table-column prop="useTime" label="同步耗时/ms"  width="180" sortable>
                <template slot-scope="scope">
                    <div>{{scope.row.useTime+"ms"}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="isSuccess" label="同步结果" min-width="160" sortable>
                  <template slot-scope="scope">
                        <div v-if="scope.row.isSuccess === true">正常</div>
                        <div style="color:red" v-if="scope.row.isSuccess === false">异常</div>
                    </template>  
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
import { getSyncHistory } from "../../api/api";

export default {
    data() {
        return {
            filters: {

            },
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
            this.ids = id;

            let para = {
                page: this.page,
                size: this.size,
                ...filters
            };
            this.listLoading = true;
            getSyncHistory(id, para).then((data) => {

                this.total = data.total;
                this.updateList = data.updateList;
                this.listLoading = false;
            }).catch(message => {
                this.listLoading = false;
                this.$message.error(message);
            });
        },
    },
    mounted() {
        this.getUsers();
    }
}

</script>
<style scoped lang ="scss">
.active {
    color: #a00;
}
</style>
