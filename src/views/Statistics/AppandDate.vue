<!--筛选菜单-->
<template>
    <el-row>
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="filter">
                <el-form-item>
                    <el-select v-model="filter.appId" placeholder="请选择应用" @change="Emit">
                        <el-option v-for="app in this.appList" :key="app.value" :label="app.label"
                                   :value="app.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="model<3">
                    <el-select v-model="filter.channel" placeholder="语言" @change="Emit2">
                        <el-option v-for="app in this.languageTypeOptions" :key="app.value" :label="app.label"
                                   :value="app.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="model===1">
                    <el-select v-model="filter.columnId" placeholder="栏目" @change="Emit">
                        <el-option value="all" label="所有栏目"></el-option>
                        <el-option v-for="app in this.columnList" :key="app.columnId" :label="app.name"
                                   :value="app.columnId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filter.time" placeholder="请选择时间" @change="Emit">
                        <el-option value="today" label="今天"></el-option>
                        <el-option value="yesterday" label="昨天"></el-option>
                        <el-option value="lastWeek" label="最近一周"></el-option>
                        <el-option value="lastMonth" label="最近一月"></el-option>
                        <el-option value="custom" label="自定义"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="filter.time==='custom'">
                    <el-date-picker
                            v-model="filter.customizeTime"
                            type="daterange"
                            @change="Emit"
                            placeholder="日期范围">
                    </el-date-picker>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>
<script>
    import {InitMenu, getLastMonthTime} from '../../common/js/util';
    import {getColumnsList} from '../../api/api'
    //true,不显示栏目
    export default {
        props: ['model', 'model2'],
        data() {
            return {
                appList: [],
                filter: {
                    appId: '',
                    time: 'today',
                    customizeTime: '',
                    channel: 'all',
                    columnId: 'all'
                },
                columnList: [],
                languageTypeOptions: [
                    {
                        value: 'all',
                        label: '所有语言'
                    }, {
                        value: 'zh',
                        label: '中文'
                    },
                    {
                        value: 'en',
                        label: '英文'
                    },
                    {
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
                    }]
            }
        },
        methods: {
            /**
             *  初始化默认应用选择菜单
             */
            setMenu() {
                let _this = this;
                InitMenu(this.appList, function (menulist) {
                    menulist.forEach(x => {
                        if (x.label === '中国网') {
                            _this.filter.appId = x.value;
                        }
                    })
                })
            },
            Emit(emit = true) {
                let para = {appID: this.filter.appId};
                switch (this.filter.time) {
                    case 'lastMonth':
                        console.log('lastMonth');
                        para.startDate = getLastMonthTime(new Date());
                        para.endDate = new Date();
                        break;
                    case 'lastWeek':
                        console.log('lastWeek');
                        para.startDate = new Date(new Date().getTime() - 518400000 - 86400000);
                        para.endDate = new Date();
                        break;
                    case 'yesterday':
                        para.endDate = new Date(new Date().getTime() - 86400000);
                        para.startDate = new Date(para.endDate.getFullYear(), para.endDate.getMonth(), para.endDate.getDate(), 0, 8, 0, 0);
                        para.endDate = new Date(para.startDate.getTime());
                        para.time = 'yesterday';
                        break;
                    case 'today':
                        console.log('today');
                        para.endDate = new Date();
                        para.startDate = new Date(para.endDate.getFullYear(), para.endDate.getMonth(), para.endDate.getDate(), 0, 0, 0, 0);
                        para.time = 'today';
                        break;
                    case 'custom':
                        if (this.filter.customizeTime && this.filter.customizeTime[0] && this.filter.customizeTime[1]) {
                            para.startDate = this.filter.customizeTime[0];
                            para.endDate = this.filter.customizeTime[1];
                        } else {
                            return;
                        }
                        break;
                }

//                if (!this.model)
                para.language = this.filter.channel;
                console.log('==================================');
                console.log('para.startDate', para.startDate);
                console.log('para.endDate', para.endDate);
                console.log('==================================');

                para.startDate = para.startDate.getTime();
                para.endDate = para.endDate.getTime();
//                if (this.filter.columnId !== 'all')
                para.columnId = this.filter.columnId;
//                console.log('请求数据参数 zi', para);
                if (emit) this.$emit('GetInfo', para);
                return para;
            },
            Emit2() {
                let para = this.Emit(false);
                console.log('yuyan');

                getColumnsList({
                    appId: para.appID,
                    language: para.language
                }).then(
                    data => {
                        console.log(data);
                        this.columnList = data.list;
                        if (this.model === 2) {
                            this.$emit('EmitColumn', this.columnList);
                        }
                    }
                ).catch();

                this.Emit();
            }
        },
        created() {
            this.setMenu()
        },
        mounted() {
            if (this.model === 2) {
                this.filter.channel = 'zh';
                this.languageTypeOptions.shift()
//                this.Emit2()
            }
        }
    }

</script>