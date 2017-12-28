<template>
    <section>
        <myMenu @GetInfo="Init" :model="1"></myMenu>
        <!--<span>图表待完成</span>-->

        <chart :chartdata="chartInfo" :xLabel="'时间'" :yLabel="'阅读量'" :Two="isToday"></chart>
        <el-table :data="list" height="400" v-loading="loading">
            <el-table-column label="阅读排行" type="index" width="140"></el-table-column>
            <el-table-column label="文章ID" prop="articleId" width="140"></el-table-column>
            <el-table-column label="文章标题" prop="title" min-width="140"></el-table-column>
            <el-table-column label="阅读次数" prop="scanCount" width="140"></el-table-column>
            <el-table-column label="栏目名称" prop="columnName" width="140"></el-table-column>
            <el-table-column label="栏目id" prop="columnId" width="140"></el-table-column>
            <el-table-column label="语言" prop="language" :formatter="languageformat"
                             width="140"></el-table-column>
        </el-table>
        {{isToday}}
    </section>
</template>
<script>
    import myMenu from './AppandDate.vue'
    import chart from '../../components/LineChart.vue'
    import {ReadStats} from '../../api/api'

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
                isToday: false,
                chartInfo: {}
            }
        },
        methods: {
            Init(para) {
                this.chartInfo = []
                this.isToday = (para.time === 'today') || (para.time === 'yesterday')
                console.log('请求数据参数', para);
                ReadStats(para).then(
                    data => {
                        console.log(data)
                        this.list = data.topList
                        if (data.list.currentDay) {
                            this.chartInfo = [
                                data.list.currentDay.map(x => {
                                    return {
                                        x: x.dateHoursIndex,
                                        y: x.scanCount,
                                        time: 'today'
                                    }
                                }),
                                data.list.otherDay.map(x => {
                                    return {
                                        x: x.dateHoursIndex,
                                        y: x.scanCount,
                                        time: 'yesterday'
                                    }
                                })
                            ]
                        } else {
                            this.chartInfo = data.list.map(x => {
                                return {
                                    x: x.dateString,
                                    y: x.scanCount
                                }
                            })
                        }
                        this.loading = false;
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