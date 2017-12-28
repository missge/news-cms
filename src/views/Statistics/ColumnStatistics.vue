<template>
    <section>
        <myMenu @GetInfo="Init" :model="2" @EmitColumn="SetColumn"></myMenu>
        <!--<el-row>-->
        <!--<el-col :span="24" class="toolbar">-->
        <!--<el-form :inline="true" :model="filter">-->
        <!--<el-form-item>-->
        <!--<el-select v-model="filter.appId" placeholder="请选择应用" @change="Init">-->
        <!--<el-option v-for="app in this.appList" :key="app.value" :label="app.label"-->
        <!--:value="app.value"></el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item>-->
        <!--<el-select v-model="filter.channel" placeholder="请选择语言" @change="Init">-->
        <!--<el-option v-for="item in languageTypeOptions" :key="item.value" :label="item.label"-->
        <!--:value="item.value">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item>-->
        <!--<el-select v-model="filter.time" placeholder="请选择时间" @change="Init">-->
        <!--<el-option value="today" label="今天"></el-option>-->
        <!--<el-option value="yesterday" label="昨天"></el-option>-->
        <!--<el-option value="lastWeek" label="最近一周"></el-option>-->
        <!--<el-option value="lastMonth" label="最近一月"></el-option>-->
        <!--<el-option value="custom" label="自定义"></el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <!--<el-form-item v-if="filter.time==='custom'">-->
        <!--<el-date-picker-->
        <!--v-model="filter.customizeTime"-->
        <!--type="daterange"-->
        <!--@change="Init"-->
        <!--placeholder="日期范围">-->
        <!--</el-date-picker>-->
        <!--</el-form-item>-->

        <!--</el-form>-->
        <!--</el-col>-->
        <!--</el-row>-->
        <el-row v-loading="loading">
            <el-checkbox-group v-model="checkList">
                <el-checkbox v-for="(item,key) in columnList"  :key='key' :label="item.columnName"
                             class="column_item"></el-checkbox>
            </el-checkbox-group>
        </el-row>
        <el-row>
            <el-col :span="24" class="toolbar">
                <el-button @click="filterResult" size="small">完成</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-table :data="DataList" highlight-current-row v-loading="loading" @selection-change=""
                          style="width: 100%;" label-width="120" height="400">
                    <el-table-column prop="columnId" label="id">
                    </el-table-column>
                    <el-table-column prop="columnName" label="栏目">
                    </el-table-column>
                    <el-table-column prop="readCount" label="阅读数">
                    </el-table-column>
                    <el-table-column prop="shareCount" label="分享数">
                    </el-table-column>
                    <el-table-column prop="fagaoCount" label="发稿数">
                    </el-table-column>
                    <el-table-column prop="subscribeCount" label="订阅数">
                    </el-table-column>
                    <el-table-column prop="collectCount" label="收藏数">
                    </el-table-column>
                    <el-table-column prop="collectCount" label="取消收藏数">
                    </el-table-column>
                    <el-table-column prop="" label="详情">
                        <template slot-scope="scope">
                            <el-button size="small" @click="ShoeDetail(scope.row)">查看详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>

            </el-col>
        </el-row>
        <section style="margin-top: 10px" v-if="chartInfo">
            <h4>图表</h4>
            <chart :chartdata="chartInfo" :xLabel="'统计指标'" :yLabel="'数量'"></chart>
        </section>
        <el-dialog title="栏目详情" :visible.sync="dialogVisible" width="75%">

            <el-form :inline="true" :model="filter2">
                <el-form-item>
                    <el-select v-model="filter2.searchType" placeholder="请选择应用" @change="Init22">
                        <el-option value="1" label="按文章"></el-option>
                        <el-option value="2" label="按日期"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filter2.time" placeholder="请选择时间" @change="Init22">
                        <el-option value="today" label="今天"></el-option>
                        <el-option value="yesterday" label="昨天"></el-option>
                        <el-option value="lastWeek" label="最近一周"></el-option>
                        <el-option value="lastMonth" label="最近一月"></el-option>
                        <el-option value="custom" label="自定义"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="filter2.searchType==='1'">
                    <el-input v-model="filter2.keyWord"></el-input>
                    <el-button @click="Init22">查询</el-button>
                </el-form-item>
                <el-form-item v-if="filter2.time==='custom'">
                    <el-date-picker
                            v-model="filter2.customizeTime"
                            type="daterange"
                            @change="Init22"
                            placeholder="日期范围">
                    </el-date-picker>
                </el-form-item>
            </el-form>

            <el-table :data="DataList2" v-show="this.filter2.searchType==='2'" style="width:100%;"
                      label-width="120" height="400">
                <el-table-column prop="columnId" label="栏目id">
                </el-table-column>
                <el-table-column prop="columnName" label="栏目名称">
                </el-table-column>
                <el-table-column prop="readCount" label="阅读数">
                </el-table-column>
                <el-table-column prop="shareCount" label="分享数">
                </el-table-column>
                <el-table-column prop="fagaoCount" label="发稿数">
                </el-table-column>
                <el-table-column prop="subscribeCount" label="订阅数">
                </el-table-column>
                <el-table-column prop="cancelCollectCount" label="取消收藏数" width="140">
                </el-table-column>
                <el-table-column prop="collectCount" label="收藏数">
                </el-table-column>
                <el-table-column prop="cancelSubscribeCount" label="取消订阅数" width="140">
                </el-table-column>
            </el-table>

            <el-table :data="DataList3" highlight-current-row
                      v-show="this.filter2.searchType==='1'"
                      style="width: 100%;" label-width="120" height="400">
                <el-table-column prop="articleTitle" label="栏目标题">
                </el-table-column>
                <el-table-column prop="articleId" label="文章id">
                </el-table-column>

                <el-table-column prop="dateString" label="统计时间" :formatter="dateFormat">
                </el-table-column>
                <el-table-column prop="shareCount" label="分享数">
                </el-table-column>
                <el-table-column prop="cancelCollectCount" label="取消收藏数" width="140">
                </el-table-column>
                <el-table-column prop="collectCount" label="收藏数">
                </el-table-column>
                <el-table-column prop="readCount" label="阅读数">
                </el-table-column>

            </el-table>
            <el-pagination layout="prev, pager, next" @current-change="Init2" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
            <span slot="footer" class="dialog-footer">
                 <el-button @click="dialogVisible = false">关 闭</el-button>
            </span>
        </el-dialog>
    </section>
</template>
<script>
    import {InitMenu, dateFormat, getLastMonthTime} from '../../common/js/util';
    import {ColumnStats, articleStats} from '../../api/api.js'
    import chart from '../../components/columnChart.vue'
    import myMenu from './AppandDate.vue'

    export default {
        components: {chart, myMenu},
        data() {
            return {
                size: 14,
                total: 1,
                dialogVisible: false,
                checkList: [],
                appList: [],
                loading: true,
                filter: {
                    appId: '',
                    time: 'today',
                    channel: 'zh',
                    customizeTime: ''
                },
                filter2: {
                    searchType: '1',
                    time: 'today',
                    customizeTime: '',
                    keyWord: ''
                },
                languageTypeOptions: [
                    {
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
                        label: '俄文'
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
                columnList: [],
                DataList2: [],
                DataList3: [],
                DataList: [],
                Result: [],
                currentRow: null,
                chartInfo: '',
                currentAppId: '',
                currentLanguage: ''
            };
        },
        methods: {
            dateFormat: dateFormat,
            setMenu() {
//                this.listLoading = true
                let _this = this;
                InitMenu(this.appList, function (menulist) {
                    menulist.forEach(x => {
                        if (x.label === '中国网') {
                            _this.filter.appId = x.value;
                        }
                    })
                })
            },
            Init(para) {
                /*if (!this.filter.appId || !this.filter.channel) {
                    return
                }
                let para = {appID: this.filter.appId, language: this.filter.channel};
                this.SetDate(this.filter, para);
                para.startDate = para.startDate.getTime();
                para.endDate = para.endDate.getTime();*/
                this.loading=true;
                this.currentLanguage = para.language;
                this.currentAppId = para.appID;
//                console.log('请求数据参数', para);
//                if (para.time) delete para.time
                if (para.columnId === 'all') delete para.columnId
                console.log('请求数据参数', para);

                this.checkList = [],
                    ColumnStats(para).then(
                        data => {
                            console.log(data)
                            this.checkList.length = 0;

                            this.columnList = data.result

                            this.Result = data.result
                            this.filterResult()
                            this.loading = false
                        }
                    ).catch()
            },
            SetColumn(columnList) {
//                console.log('收到列表了')
//                this.columnList = columnList
            },
            Init22() {
                this.Init2(1)
            },
            Init2(page = 1) {
                let para = {
                    searchType: Number(this.filter2.searchType),
//                    language: this.filter.channel,
                    language: this.currentLanguage,
//                    appID: this.filter.appId,
                    appID: this.currentAppId,
                    columnId: this.currentRow.columnId,
                    page: page
                };
                console.log('请求数据参数', para);
                if (para.searchType === 1) {
                    para.keyword = this.filter2.keyWord
                }
                this.SetDate(this.filter2, para);
                para.startDate = para.startDate.getTime();
                para.endDate = para.endDate.getTime();

                articleStats(para).then(
                    data => {
                        console.log(data)
                        var c = data.count * 14 - 14
                        this.total = c < 0 ? 1 : c
                        if (para.searchType - 2) {
                            console.log(3)
                            this.DataList3 = data.result
                        } else {
                            console.log(2)
                            this.DataList2 = data.result
                        }

                    }
                ).catch()
            },

            SetDate(filter, para) {
                switch (filter.time) {
                    case 'lastMonth':
                        para.startDate = getLastMonthTime(new Date());
                        para.endDate = new Date();
                        break;
                    case 'lastWeek':
                        para.startDate = new Date(new Date().getTime() - 518400000 - 86400000);
                        para.endDate = new Date();
                        break;
                    case 'yesterday':
                        para.endDate = new Date(new Date().getTime() - 86400000);
                        para.startDate = new Date(para.endDate.getFullYear(), para.endDate.getMonth(), para.endDate.getDate(), 0, 8, 0, 0);
                        para.endDate = new Date(para.startDate.getTime());
                        break;
                    case 'today':
                        /* para.endDate = new Date();
                         para.startDate = new Date(para.endDate.getFullYear(), para.endDate.getMonth(), para.endDate.getDate(), 0, 0, 0, 0);*/
                        para.endDate = new Date();
                        para.startDate = para.endDate
                        break;
                    case 'custom':
                        if (filter.customizeTime && filter.customizeTime[0] && filter.customizeTime[1]) {
                            para.startDate = filter.customizeTime[0];
                            para.endDate = filter.customizeTime[1];
                        } else {
                            return;
                        }
                        break;
                }
            },
            /*getLastMonthTime(date) {
                let mon = date.getMonth() - 1;
                if (mon === -1) {
                    date.setUTCFullYear(date.getUTCFullYear() - 1);
                    date.setUTCMonth(11)
                } else {
                    date.setUTCMonth(mon)
                }
                return date
            },*/
            filterResult() {
                if (this.checkList.length === 0) {
                    this.DataList = this.Result
                    this.chartInfo = null;
                } else {
                    this.DataList = this.Result.filter(x => {
                        return this.checkList.includes(x.columnName)
                    })
                    this.chartInfo = this.DataList;
                }
            },
            ShoeDetail(row) {
                this.dialogVisible = true
                this.currentRow = row
                this.Init2()
            }
        },
        mounted() {
            this.setMenu()
        }
    }
</script>
<style scoped>
    .column_item {
        width: 14%;
        margin-left: 0 !important;
    }
</style>