<template>
    <section>
        <myMenu @GetInfo="Init" :model="true"></myMenu>
        <el-row>
            <el-col :span="12" class="toolbar">
                平台选择：
                <el-radio-group v-model="lfilter.systemType" @change="lInit">
                    <el-radio label="ios">ios</el-radio>
                    <el-radio label="android">Android</el-radio>
                    <el-radio label="all">ios&Android</el-radio>
                </el-radio-group>
            </el-col>
            <el-col :span="12" class="toolbar">
                统计类型:
                <el-radio-group v-model="lfilter.showType" @change="lInit">
                    <el-radio label="Add">新增设备</el-radio>
                    <el-radio label="Active">活跃设备</el-radio>
                    <el-radio label="Launch">启动次数</el-radio>
                    <el-radio label="Total" v-if="!isToday">累计设备</el-radio>
                </el-radio-group>

            </el-col>
        </el-row>
        <chart :chartdata="chartInfo" :xLabel="'时间'" :yLabel="chartLabel" :Two="isToday"></chart>
        <el-table :data="list" height="400" v-loading="loading">
            <el-table-column label="时间" prop="createDateString" min-width="140"></el-table-column>
            <el-table-column label="新增设备" prop="newDevice" min-width="140"></el-table-column>
            <el-table-column label="活跃设备" prop="activeDevice" min-width="140"></el-table-column>
            <el-table-column label="启动次数" prop="bootTime" min-width="140"></el-table-column>
            <el-table-column label="累计设备" prop="totalDevice" min-width="140"
                             v-if="!isToday"></el-table-column>
        </el-table>
    </section>
</template>
<script>
    import {InitMenu, getLastMonthTime} from '../../common/js/util';
    import chart from '../../components/LineChart.vue'
    import myMenu from './AppandDate.vue'
    import {DeviceStats} from '../../api/api'

    export default {
        components: {chart, myMenu},
        data() {
            return {
                loading: true,
                chartInfo: null,
                da: 0,
                lfilter: {
                    systemType: 'ios',
                    showType: 'Add'
                },
                list: [],
                list2: [],
                localDate: {},
                isToday: false,
                chartLabel: '',
                otherDay: {},
                isYesterday: false
            };
        },
        methods: {
            Init(para) {
                this.list = []
                DeviceStats(para).then(
                    data => {
                        console.log(data);
                        if (data.list) {
                            this.localDate = data.list;
                            this.isToday = false;
                        }
                        if (data.result) {
                            this.localDate = (para.time === 'today') ? data.result.currentDay : data.result.otherDay;
                            this.otherDay = (para.time !== 'today') ? data.result.currentDay : data.result.otherDay;
                            this.isToday = true;
                            this.isYesterday = (para.time === 'yesterday')
                            console.log(333333333333)
                        }
                        this.lInit();
                        this.loading = false
                    }
                ).catch(
                    message => {
                        console.log(message)
                        this.loading = false
                    }
                )
            },
            lInit() {
                let para = Object.assign({}, this.lfilter)
                this.list = [];
                this.chartInfo = []
                console.log('处理本地的数据', para)
                if (this.localDate) {
                    var dateCache = this.localDate;
                    if (!this.isToday) {
                        switch (para.systemType) {
                            case 'all':
                                this.list = dateCache.map(x => {
                                    return {
                                        createDateString: x.createDateString,
                                        ...x.ios_android
                                    }
                                });
                                console.log(dateCache);
                                console.log(this.list);
                                break;
                            case 'android':
                                this.list = dateCache.map(x => {
                                    return {
                                        createDateString: x.createDateString,
                                        ...x.android
                                    }
                                });
                                break;
                            case 'ios':
                                this.list = dateCache.map(x => {
                                    return {
                                        createDateString: x.createDateString,
                                        ...x.ios
                                    }
                                });
                                break;

                        }
                    } else {
                        console.log(dateCache)
                        switch (para.systemType) {
                            case 'all':
                                this.list = dateCache.ios_android.map((x, index) => {
                                    return {
                                        createDateString: index,
                                        ...x
                                    }
                                });
                                if (this.isToday)
                                    this.list2 = this.otherDay.ios_android.map((x, index) => {
                                        return {
                                            createDateString: index,
                                            ...x
                                        }
                                    });
                                break;
                            case 'android':
                                this.list = dateCache.android.map((x, index) => {
                                    return {
                                        createDateString: index,
                                        ...x
                                    }
                                });
                                if (this.isToday)
                                    this.list2 = this.otherDay.android.map((x, index) => {
                                        return {
                                            createDateString: index,
                                            ...x
                                        }
                                    });
                                break;
                            case 'ios':
                                this.list = dateCache.ios.map((x, index) => {
                                    return {
                                        createDateString: index,
                                        ...x
                                    }
                                });
                                if (this.isToday)
                                    this.list2 = this.otherDay.ios.map((x, index) => {
                                        return {
                                            createDateString: index,
                                            ...x
                                        }
                                    });
                                break;

                        }
                    }

                    switch (para.showType) {
                        case 'Add':
                            this.chartInfo = this.list.map(x => {
                                return {
                                    x: x.createDateString,
                                    y: x.newDevice
                                }
                            });
                            if (this.isToday) {
                                this.chartInfo = [this.chartInfo, this.list2.map(x => {
                                    return {
                                        x: x.createDateString,
                                        y: x.newDevice
                                    }
                                })]
                                if (this.isYesterday) {
                                    this.chartInfo = this.chartInfo.reverse()
                                }
                            } else {
                                this.chartInfo = this.chartInfo.reverse()
                            }
                            this.chartLabel = '新增设备'
                            break;
                        case 'Active':
                            this.chartInfo = this.list.map(x => {
                                return {
                                    x: x.createDateString,
                                    y: x.activeDevice
                                }
                            });
                            if (this.isToday) {
                                this.chartInfo = [this.chartInfo, this.list2.map(x => {
                                    return {
                                        x: x.createDateString,
                                        y: x.activeDevice
                                    }
                                })]
                                if (this.isYesterday) {
                                    this.chartInfo = this.chartInfo.reverse()
                                }
                            } else {
                                this.chartInfo = this.chartInfo.reverse()
                            }
                            this.chartLabel = '活跃设备';

                            break;
                        case 'Launch':
                            this.chartInfo = this.list.map(x => {
                                return {
                                    x: x.createDateString,
                                    y: x.bootTime
                                }
                            });
                            if (this.isToday) {
                                this.chartInfo = [this.chartInfo, this.list2.map(x => {
                                    return {
                                        x: x.createDateString,
                                        y: x.bootTime
                                    }
                                })]
                                if (this.isYesterday) {
                                    this.chartInfo = this.chartInfo.reverse()
                                }
                            } else {
                                this.chartInfo = this.chartInfo.reverse()
                            }
                            this.chartLabel = '启动次数';
                            break;
                        case 'Total':
                            this.chartInfo = this.list.map(x => {
                                return {
                                    x: x.createDateString,
                                    y: x.totalDevice
                                }
                            });
                            if (this.isToday) {
                                this.chartInfo = [this.chartInfo, this.list2.map(x => {
                                    return {
                                        x: x.createDateString,
                                        y: x.totalDevice
                                    }
                                })]
                                if (this.isYesterday) {
                                    this.chartInfo = this.chartInfo.reverse()
                                }
                            } else {
                                this.chartInfo = this.chartInfo.reverse()
                            }
                            this.chartLabel = '累计设备';
                            break;
                    }
                }
            }
        }
    }
</script>