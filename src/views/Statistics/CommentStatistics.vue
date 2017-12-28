<template>
    <section>
        <myMenu @GetInfo="Init" :model="1"></myMenu>
        <!--<span>图表待完成</span>-->
        <chart :chartdata="chartInfo" :xLabel="'时间'" :yLabel="'评论量'" :Two="isToday"></chart>
        <el-table :data="list" height="400" v-loading="loading">
            <el-table-column label="评论排行" type="index" width="140"></el-table-column>
            <el-table-column label="文章ID" prop="articleId" width="140"></el-table-column>
            <el-table-column label="评论数" prop="commentCount" min-width="140"></el-table-column>
            <el-table-column label="栏目名称" prop="columnName" min-width="140"></el-table-column>
            <el-table-column label="栏目Id" prop="columnId" min-width="140"></el-table-column>
            <el-table-column label="语言" prop="language" :formatter="languageformat" min-width="140"></el-table-column>
        </el-table>
    </section>
</template>
<script>
    import myMenu from './AppandDate.vue'
    import chart from '../../components/LineChart.vue'
    import {CommentStats} from '../../api/api'

    export default {
        components: {chart, myMenu},
        data() {
            return {
                loading: true,
                list: [
                    {
                        name: '这是假数据'
                    }
                ],
                chartInfo: {},
                isToday: false
            }
        },
        methods: {
            Init(para) {
                this.isToday = (para.time === 'today') || (para.time === 'yesterday')
                console.log('请求数据参数', para);
                this.chartInfo = []
                CommentStats(para).then(
                    data => {
                        console.log(data)
                        this.list = data.topList
                        if (data.list.currentDay) {
                            this.chartInfo = [
                                data.list.currentDay.map(x => {
                                    return {
                                        x: x.dateHoursIndex,
                                        y: x.commentCount,
                                        time: 'today'
                                    }
                                }),
                                data.list.otherDay.map(x => {
                                    return {
                                        x: x.dateHoursIndex,
                                        y: x.commentCount,
                                        time: 'yesterday'
                                    }
                                })
                            ]
                        } else {
                            this.chartInfo = data.list.map(x => {
                                return {
                                    x: x._id,
                                    y: x.commentCount
                                }
                            })
                        }
                        this.loading = false
                    }
                ).catch(
                    message => {
                        console.log(message)
                        this.loading = false
                    }
                )
            },
            languageformat(row, column, cellValue) {
                if (cellValue)
                    return {
                        all: '所有语言',
                        zh: '中文',
                        en: '英文',
                        fr: '法文',
                        ar: '阿拉伯文',
                        ru: '俄文',
                        sp: '西班牙文',
                        de: '德文',
                        ko: '韩文',
                        ja: '日文'
                    }[cellValue];
            }
        }
    }
</script>