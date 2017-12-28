<template>
    <section>
        <myMenu @GetInfo="Init" :model="true"></myMenu>
        <el-row>
            <el-col :span="24" class="toolbar">
                <el-radio-group v-model="userType" @change="lInit">
                    <el-radio label="Add">新增用户</el-radio>
                    <el-radio label="Active">活跃用户</el-radio>
                    <el-radio label="Total" v-if="!isToday">累计用户</el-radio>
                </el-radio-group>
            </el-col>
        </el-row>
        <chart :chartdata="chartInfo" :xLabel="'时间'" :yLabel="chartLabel" :Two="isToday"></chart>
        <el-table :data="list" height="400" v-loading="loading">
            <el-table-column label="日期" prop="createDateString" min-width="140"></el-table-column>
            <el-table-column label="新增用户" prop="newUser" min-width="140"></el-table-column>
            <el-table-column label="活跃用户" prop="activeUser" min-width="140"></el-table-column>
            <el-table-column v-if="!isToday" label="累计用户" prop="totalUser" min-width="140"></el-table-column>
        </el-table>
    </section>
</template>
<script>
    import myMenu from './AppandDate.vue'
    import {dateFormat} from '../../common/js/util';
    import chart from '../../components/LineChart.vue'
    import {UserStats} from '../../api/api'

    export default {
        components: {chart, myMenu},
        data() {
            return {
                loading: true,
                userType: 'Add',
                list: [
                    {
                        name: '这是假数据'
                    }
                ],
                isToday: false,
                localData: {},
                chartInfo: {},
                chartLabel: '',
                otherData: '',
                list2: [],
                isYesterday: false
            }
        },
        methods: {
            dateFormat: dateFormat,
            Init(para) {
                console.log('请求数据参数', para);
                UserStats(para).then(
                    data => {
                        console.log(data);
                        if (data.list) {
                            this.localData = data.list;
                            this.isToday = false;
                        }
                        if (data.result) {
                            this.localData = (para.time === 'today') ? data.result.currentDay : data.result.otherDay;
                            this.otherData = (para.time !== 'today') ? data.result.currentDay : data.result.otherDay;
                            this.isYesterday = (para.time === 'yesterday')
                            this.isToday = true;
                            console.log(333333333333)
                        }
                        this.lInit();
                        this.loading = false;
                    }
                ).catch(message => {
                    console.log(message)
                    this.loading = false
                })
            },
            lInit() {
                console.log('本地处理数据')
                if (!this.isToday) {
                    this.list = this.localData
                } else {
                    this.list = this.localData.map((x, index) => {
                        return {
                            createDateString: index,
                            ...x
                        }
                    })
                    this.list2 = this.otherData.map((x, index) => {
                        return {
                            createDateString: index,
                            ...x
                        }
                    })
                }
                switch (this.userType) {
                    case "Add":
                        this.chartInfo = this.list.map(x => {
                            return {
                                x: x.createDateString,
                                y: x.newUser
                            }
                        });
                        if (this.isToday) {
                            this.chartInfo = [this.chartInfo, this.list2.map(x => {
                                return {
                                    x: x.createDateString,
                                    y: x.newUser
                                }
                            })]
                            if (this.isYesterday) {
                                this.chartInfo = this.chartInfo.reverse()
                            }
                        }else {
                            this.chartInfo = this.chartInfo.reverse()
                        }
                        this.chartLabel = '新增用户'
                        break;
                    case "Active":
                        this.chartInfo = this.list.map(x => {
                            return {
                                x: x.createDateString,
                                y: x.activeUser
                            }
                        });
                        if (this.isToday) {
                            this.chartInfo = [this.chartInfo, this.list2.map(x => {
                                return {
                                    x: x.createDateString,
                                    y: x.activeUser
                                }
                            })]
                            if (this.isYesterday) {
                                this.chartInfo = this.chartInfo.reverse()
                            }
                        }else {
                            this.chartInfo = this.chartInfo.reverse()
                        }
                        this.chartLabel = '活跃用户'
                        break;
                    case "Total":
                        this.chartInfo = this.list.map(x => {
                            return {
                                x: x.createDateString,
                                y: x.totalUser
                            }
                        });
                        if (this.isToday) {
                            this.chartInfo = [this.chartInfo, this.list2.map(x => {
                                return {
                                    x: x.createDateString,
                                    y: x.totalUser
                                }
                            })]
                            if (this.isYesterday) {
                                this.chartInfo = this.chartInfo.reverse()
                            }
                        }else {
                            this.chartInfo = this.chartInfo.reverse()
                        }
                        this.chartLabel = '活跃用户'
                        break;
                }

            }
        }
    }
</script>