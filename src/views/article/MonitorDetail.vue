<template>
    <section>
        <el-col :span="24" class="toolbar">
            <el-row :gutter="20">
                <el-col :span="6">
                    <div style="font-size: 18px;margin-top:4px">
                        <b>Id:{{articleId}}</b>
                    </div>
                </el-col>
                <el-col :span="4" :offset="14">
                    <el-button type="primary" size="small">
                        <router-link to="/article/ArticleList" style=" color:#fff; text-decoraction: none;">返回上一级
                        </router-link>
                    </el-button>
                </el-col>
            </el-row>
        </el-col>
        <el-table :data="tableData" border style="width: 100%">
            <el-table-column prop="name" label="名称" width="180">
            </el-table-column>
            <el-table-column prop="url" label="地址">
                <template slot-scope="scope">
                    <a v-if="parseInt(scope.$index)<6" :href="scope.row.url" target="_black">{{scope.row.url}}</a>
                    <img class="shareQsCode" v-else-if="scope.$index ===9 " :src="shareQsCode" alt="">
                    <div v-else>{{scope.row.url}}</div>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                    <!-- 详情接口按钮  -->
                    <el-button v-if="scope.$index === 0" size="small" @click="handleShowDetail(scope.row)">详情
                    </el-button>
                    <!-- 原始接口按钮  -->
                    <el-button v-else-if="scope.$index === 1" size="small" @click="handleShowOrigin(scope.row)">详情
                    </el-button>
                    <!-- 指令接口按钮  -->
                    <el-button v-else-if="scope.$index === 2" size="small" @click="handleShowinstruction(scope.row)">详情
                    </el-button>
                    <!-- 视频监控状态 -->
                    <el-button v-else-if=" scope.$index === 3" type="primary" size="small"
                               @click="handleVideoMonitorHistory(scope.$index, scope.row)">查看
                    </el-button>
                    <!-- 文章同步历史 -->
                    <el-button v-else-if=" scope.$index === 4" type="primary" size="small"
                               @click="handleSyncHistory(scope.$index, scope.row)">查看
                    </el-button>
                    <!-- 文章状态变化按钮 -->
                    <el-button v-else-if=" scope.$index === 5" type="primary" size="small"
                               @click="handleArticleStatusHistory(scope.$index, scope.row)">查看
                    </el-button>

                </template>
            </el-table-column>
        </el-table>

        <el-dialog title="查看详情" :visible.sync="detailShow" size="large" top="25%">
            <div>
                <tree-view :data="detailUrlCode" :options="{maxDepth: 8}"></tree-view>
            </div>
        </el-dialog>
        <!-- 原始接口 -->
        <el-dialog title="查看详情" :visible.sync="originShow" size="large" top="25%">
            <div>
                <tree-view :data="originUrlCode" :options="{maxDepth: 8}"></tree-view>
            </div>
        </el-dialog>
        <!-- 指令接口 -->
        <el-dialog title="查看详情" :visible.sync="instructionShow" size="large" top="25%">
            <div>
                <tree-view :data="instructionUrlCode" :options="{maxDepth: 8}"></tree-view>
            </div>
        </el-dialog>

    </section>
</template>

<script>

    import {getMonitorArticleDetail} from "../../api/api";
    //二维码
    import {shareQsCodeUrl} from "../../api/api";
    import TreeView from "vue-json-tree-view";
    import axios from 'axios';

    export default {
        data() {
            return {

                total: 0,
                page: 0,
                size: 0,
                maxDepth: 4,
                rootObjectKey: "root",
                tableData: [],
                //三级列表显示
                detailShow: false,
                originShow: false,
                instructionShow: false,
                detailUrl: "",
                articleId: "",
                //三级列表数据
                shareQsCode: "",
                detailUrlCode: "",
                originUrlCode: "",
                instructionUrlCode: ""
            }
        },

        methods: {

            handleShowDetail(row) {
                this.detailShow = true;
            },
            handleShowOrigin(row) {
                this.originShow = true;
            },
            handleShowinstruction(row) {
                this.instructionShow = true;
            },

            getDetail() {
                const id = this.$route.params.id;
                this.articleId = id;
                getMonitorArticleDetail(id).then(data => {
                    console.log(data)
                    let detail = "";
                    let list = [];
                    let para = {
                        size: this.size,
                    };

                    let that = this;
                    axios.get(data["detailUrl"])
                        .then(function (detailUrlCode) {
                            that.detailUrlCode = detailUrlCode;
                        });
                    list.push({
                        name: "详情接口",
                        url: data["detailUrl"],
                    });

                    axios.get(data["originUrl"])
                        .then(function (originUrlCode) {
                            that.originUrlCode = originUrlCode;
                        });
                    list.push({
                        name: "原始接口",
                        url: data["originUrl"]
                    });

                    axios.get(data["instructionUrl"])
                        .then(function (instructionUrlCode) {
                            that.instructionUrlCode = instructionUrlCode;
                        });
                    list.push({
                        name: "指令接口",
                        url: data["instructionUrl"]
                    });

                    list.push({
                        name: "视频监控状态",
                        url: data["videoMonitorHistoryUrl"]
                    });
                    list.push({
                        name: "同步历史",
                        url: data["updateHistoryUrl"]
                    });
                    list.push({
                        name: "文章状态变化历史",
                        url: data["articleLiveStatusChangeHistoryUrl"]
                    });
                    list.push({
                        name: "数据创建原因",
                        url: data["dataCreateReason"]
                    });
                    list.push({
                        name: "点击数",
                        url: "真实点击数:  " + data.clickCount.realClickCount +
                        "   虚拟点击数:   " + data.clickCount.virtualClickCount +
                        "   总点击数:   " + data.clickCount.allClickCount
                    });
                    list.push({
                        name: "点赞数",
                        url: data["upvoteCount"]["upvoteCount"]
                    });

                    shareQsCodeUrl(id).then(data => {
                        this.shareQsCode = data;
                        this.listLoading = false;

                    });
                    list.push({
                        name: "web页二维码",
                        url: ""
                    });

                    this.tableData = list;
                })
            },

            handleVideoMonitorHistory(index, row) {
                this.$router.push(`/article/VideoMonitorHistory/${this.$route.params.id}`);
            },
            handleSyncHistory(index, row) {
                this.$router.push(`/article/syncHistory/${this.$route.params.id}`);
            },
            handleArticleStatusHistory(index, row) {
                this.$router.push(`/article/ArticleStatusHistory/${this.$route.params.id}`);
            },
        },
        mounted() {
            this.getDetail();
        }
    }

</script>
<style scoped>
    .shareQsCode {
        padding: 0;
        margin: 0;
        width: 180px;
        height: 180px;
    }
</style>
