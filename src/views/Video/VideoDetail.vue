<template>
    <section>
          <el-col :span="24" class="toolbar">
            <el-row :gutter="20">
                <el-col :span="8">
                    <div style="font-size: 18px;margin-top:2px">
                        <b>视频Id:{{articleId}}</b>
                    </div>
                </el-col>
                <el-col :span="4" :offset="12">
                    <el-button type="primary" size="small"> 
                        <router-link to="/VideoReport" style=" color:#fff; text-decoraction: none;">返回上一级</router-link>
                    </el-button>
                </el-col>
            </el-row>
        </el-col>
        <el-table :data="monitorList" highlight-current-row v-loading="listLoading" style="width: 100%;">
            <el-table-column type="index" label="序号" width="80">
            </el-table-column>
            <el-table-column prop="reportTime" label="上报时间" :formatter="dateFormat" width="140" sortable>
            </el-table-column>
            <el-table-column prop="platform" label="平台" width="90" sortable>
                <template slot-scope="scope">
                    <div v-if="scope.row.platform == null">------</div>
                    <div v-else>{{scope.row.platform}}</div>
                </template>
            </el-table-column>
            <el-table-column label="视频url" min-width="120" sortable>
                <template slot-scope="scope">
                    <el-tooltip class="item" effect="light" placement="top-end">
                        <div slot="content"> 视频url：
                            <br/> {{scope.row.videoUrl}} </div>
                        <div class="sTitle"> {{scope.row.videoUrl}} </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="userHost" label="用户host" width="140" sortable>
            </el-table-column>
            <el-table-column prop="appVersion" label="app版本" width="110" sortable>
                <template slot-scope="scope">
                            <div v-if="scope.row.appVersion == null">------</div>
                            <div v-else>{{scope.row.appVersion}}</div>
                        </template>
            </el-table-column>
            <el-table-column prop="serverRes" label="服务器返回信息" min-width="160" sortable>
                <template slot-scope="scope">
                    <div>{{scope.row.serverRes.message}}</div>
                </template>
            </el-table-column>
        </el-table>
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size" :total="total" style="float:right;">
            </el-pagination>
        </el-col>
    </section>
</template>

<script>
import util, { dateFormat } from '../../common/js/util'
import { getMonitorVideoDetail } from "../../api/api";
export default {
    data() {
        return {
            articleId: '',
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
            const id = this.$route.params.id;
            let para = {
                id,
                page: this.page-1,
                size: this.size,
            };
            this.listLoading = true;
            //NProgress.start();
            getMonitorVideoDetail(para).then((data) => {

                this.total = data.total;
                this.monitorList = data.monitorList;
                this.articleId = data.monitorList.length > 0 ? data.monitorList[0].articleId : '';
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
<style lang="scss" scoped>
.sTitle {
    width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer
}
</style>

