<template>
    <section>
        <!--工具栏-->
        <el-col :span="24" class="toolbar" style="">
            <el-form :inline="true" :model="search">
                <el-form-item>
                    <el-select v-model="search.currentApplication" placeholder="选择应用" @change="Init()">
                        <el-option v-for="app in this.appList" :key="app.value" :label="app.label"
                                   :value="app.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-date-picker
                            v-model="search.currentApplicationDateRange" @change="Init()"
                            type="daterange"
                            placeholder="选择日期范围">
                    </el-date-picker>
                </el-form-item>
            </el-form>
        </el-col>

        <div :span=24 class="toolbar">

        </div>

        <el-table :data="appUpdateList" style="width: 100%" v-loading="listLoading">
            <el-table-column label="更新时间" prop="createTime" :formatter="dateFormat" width="180">
            </el-table-column>
            <el-table-column label="更新版本号" prop="version" width="140">
            </el-table-column>
            <el-table-column label="更新对象" prop="type" width="140">
            </el-table-column>
            <el-table-column label="中文内容" prop="updateInfo.zh" width="140">
                <template slot-scope="scope">
                    <el-button size="small" @click="showInfo(scope.row.updateInfo.zh)">查看</el-button>
                </template>
            </el-table-column>
            <el-table-column label="英文内容" prop="updateInfo.en" width="140">
                <template slot-scope="scope">
                    <el-button size="small" @click="showInfo(scope.row.updateInfo.en)">查看</el-button>
                </template>
            </el-table-column>
            <el-table-column label="更新链接" prop="downloadUrl" min-width="140">
            </el-table-column>
            <el-table-column label="更新类型" :formatter="typeFormat" prop="updateType" width="140">
            </el-table-column>
            <el-table-column prop="operator_name" label="操作记录" width="140">
                <template slot-scope="scope">
                    <el-button size="small" @click="showHistory(scope)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--分页-->
        <div :span=24 class="toolbar">
            <el-button @click="updateFormVisible = true" type="primary">
                新增
            </el-button>
            <el-pagination layout="prev, pager, next" @current-change="Init" :page-size="size"
                           :total="total" style="float:right;" :current-page.sync="currentPage">
            </el-pagination>
        </div>
        <!--添加升级弹框-->
        <el-dialog :visible.sync="updateFormVisible" title="应用升级" @close="closeDialog" @open="openDialog">
            <el-form ref="updateAppForm" :model="updateAppForm" label-width="80px"
                     :rules="rules">
                <!--<el-form-item label-width="0">-->
                <!--<h3>应用升级</h3>-->
                <!--</el-form-item>-->
                <el-form-item label="更新类型">
                    <el-select v-model="updateAppForm.updateType" placeholder="更新类型">
                        <el-option label="不强制更新" value=1></el-option>
                        <el-option label="强制更新" value=2></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="更新对象">
                    <!-- <el-radio-group v-model="updateAppForm.SystemType" size="small">
                         <el-radio-button label="ios"></el-radio-button>
                         <el-radio-button label="android"></el-radio-button>
                      </el-radio-group>-->
                    <el-select v-model="updateAppForm.SystemType" placeholder="更新对象">
                        <el-option label="ios" value="ios"></el-option>
                        <el-option label="android" value="android"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="下载链接" prop="downloadUrl">
                    <el-autocomplete class="inline-input" v-model="updateAppForm.downloadUrl"
                                     :fetch-suggestions="getHistory"
                                     type="url" style="width: 100%"></el-autocomplete>
                </el-form-item>
                <el-form-item label="版本号" prop="versionNumber">
                    <el-input v-model="updateAppForm.versionNumber"></el-input>
                </el-form-item>
                <el-form-item label="更新说明">
                    <el-input type="textarea" placeholder="中文更新说明"
                              v-model="updateAppForm.ChineseDescription"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input type="textarea" placeholder="英文更新说明"
                              v-model="updateAppForm.EnglishDescription"></el-input>
                </el-form-item>
                <!--<el-form-item>
                    <el-button @click="Submit('updateAppForm')">提交</el-button>
                    <el-button @click="Reset('updateAppForm')">重置</el-button>
                </el-form-item> -->
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="Reset('updateAppForm')">重置</el-button>
                <el-button @click="Submit('updateAppForm')" :loading="buttonLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--操作记录弹框-->
        <operationRecord ref="operhis"></operationRecord>
        <el-dialog :visible.sync="InfoVisible" title="查看详情">
            <span>{{currentDetailInfo}}</span>
            <div slot="footer" class="dialog-footer">
                <el-button @click="InfoVisible=false">关闭</el-button>
            </div>
        </el-dialog>
        <!--{{updateAppForm}}-->
    </section>
</template>
<script>
    import {getAppList, ApplicationUpdate, ApplicationUpdateHistory} from '../../api/api'
    import {InitMenu, dateFormat} from '../../common/js/util';
    //组件引入
    import operationRecord from '../../components/OperationRrecord'

    export default {
        components: {operationRecord},
        data() {
//            let isUrl = (rule, value, callback) => {
//                let reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
//                if (!reg.test(value)) {
//                    callback(new Error('输入的格式有误'));
//                } else {
//                    callback()
//                }
//            };
            return {
                currentPage: 1,
                buttonLoading: false,
                updateAppForm: {
                    appId: 'chinaApp',
                    updateType: '',
                    downloadUrl: '',
                    versionNumber: '',
                    EnglishDescription: '',
                    ChineseDescription: '',
                    SystemType: 'ios'
                },
                appList: [],
                rules: {
                    downloadUrl: [
                        {required: true, message: '请输入应用下载地址', trigger: 'blur'},
                    ],
                    versionNumber: [
                        {required: true, message: '请输入应用的版本号', trigger: 'blur'},
                    ]
                },
                updateFormVisible: false,
                search: {
                    currentApplication: '',
                    currentApplicationDateRange: '',
                },
                appUpdateList: [],
                restaurants: [],
                total: 0,
                size: 10,
                listLoading: true,
                InfoVisible: false,
                currentDetailInfo: ''
            }
        },
        methods: {
            dateFormat: dateFormat,
            typeFormat(currentRow) {
                if (currentRow.updateType === '1') {
                    return '不强制更新'
                } else {
                    return '强制更新'
                }
            },
            /*展示操作记录*/
            showHistory(scope) {
//                let _this = this;
                this.$refs.operhis.showOperation(scope.row)
            },
            /**
             * 提交表单
             * @param formName
             * @constructor
             */
            Submit(formName) {
                this.buttonLoading = true;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let para = {
                            type: this.updateAppForm.SystemType,
                            appId: this.search.currentApplication,
                            version: this.updateAppForm.versionNumber,
                            updateType: parseInt(this.updateAppForm.updateType),
                            updateInfo: {
                                "en": this.updateAppForm.EnglishDescription,
                                "zh": this.updateAppForm.ChineseDescription
                            },
                            downloadUrl: this.updateAppForm.downloadUrl,
                            ch_Info: this.updateAppForm.ChineseDescription,
                            en_Info: this.updateAppForm.EnglishDescription
                        };
                        this.makeHistory(para.downloadUrl)
                        console.log(para)
//                        return
                        this.$confirm('确定更新应用?', '提示', {
                            type: 'warning'
                        }).then(() => {
                            ApplicationUpdate(para).then(
                                data => {
                                    if (data.status === "success") {
                                        this.$message.success(`操作成功`)
//                                        this.Reset('updateAppForm')
                                    } else {
                                        this.$message.error(`操作失败`)
                                    }
                                    this.updateFormVisible = false
                                    this.buttonLoading = false;
                                    this.Init()
                                }
                            ).catch()
                        }).catch(() => {
                            this.buttonLoading = false;
                        });
                    } else {
                        console.log('您填写的数据格式不正确，请检查');
                        this.buttonLoading = false;
                        return false;
                    }
                });
            },
            /**
             * 重置表单
             * @param formName
             * @constructor
             */
            Reset(formName) {
                this.$refs[formName].resetFields();
                this.updateAppForm.ChineseDescription = '';
                this.updateAppForm.EnglishDescription = '';
            },
            /**
             * 挂载时调用函数
             * @constructor
             */
            Init(page = 1) {
                if (page === 1) this.currentPage = 1;
                console.log(this.search);
                this.listLoading = true;
                let para = {page: page - 1, size: 10};
                para.appId = this.search.currentApplication === '' ? 'chinaApp' : this.search.currentApplication;
                if (this.search.currentApplicationDateRange && this.search.currentApplicationDateRange[0] && this.search.currentApplicationDateRange[1]) {
                    para.startTime = new Date(this.search.currentApplicationDateRange[0]).getTime();
                    para.endTime = new Date(this.search.currentApplicationDateRange[1]).getTime()
                }
                console.log(para.endTime - para.startTime)
                ApplicationUpdateHistory(para).then(
                    data => {
                        console.log(data)
                        this.appUpdateList = data.list
                        this.total = data.total
                        this.listLoading = false;
                    }
                ).catch(
                    message => {
                        this.listLoading = false;
                    }
                )
                /*this.appUpdateList = [{
                    type: '2123213',
                    appId: 123213213,
                    version: 2132132,
                    updateType: 21312312,
                    updateInfo: {
                        "en": 'Englist',
                        "zh": '中文'
                    },
                    downloadUrl: 214124214
                }]*/
            },
            /**
             * 打开弹出框调用
             */
            openDialog() {
                this.restaurants = this.loadAll();
                this.buttonLoading = false
            },
            /**
             * 关闭弹出框调用
             */
            closeDialog() {
//                this.Reset('updateAppForm')
            },
            /**
             * 将str存储到localStorage，没有重复，按时间排序，最大6项
             * @param str
             */
            makeHistory(str) {
                console.log('存储', str);
                let history = JSON.parse(window.localStorage.getItem('url-history')) || []
                console.log(history)
                history.length = history.some(x => x === str) ? 6 : 5;
                history.unshift(str)
                let historySet = new Set();
                history.forEach(x => historySet.add(x))
                window.localStorage.setItem('url-history', JSON.stringify(Array.from(historySet)))

            },
            /**
             * autocomplate 匹配输入框选项
             * @param queryString
             * @param cb
             */
            getHistory(queryString, cb) {
                var restaurants = this.restaurants;
                var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
                // 调用 callback 返回建议列表的数据
                cb(results);
            },
            /**
             * 匹配下拉框内容
             * @param queryString
             * @returns {function(*)}
             */
            createFilter(queryString) {
                return (restaurant) => {
                    return (restaurant.value.indexOf(queryString.toLowerCase()) === 0);
                };
            },
            /**
             * 获取localstorage里存储的数据
             * @returns {Array}
             */
            loadAll() {
                let b = [];
                let his = (JSON.parse(window.localStorage.getItem('url-history')))
                if (his) his.forEach(x => b.push({'value': x}))
                return b
            },
            setMenu() {
                this.listLoading = true
                let _this = this;
                InitMenu(this.appList, function (menulist) {
                    menulist.forEach(x => {
                        if (x.label === '中国网') {
                            _this.search.currentApplication = x.value;
                        }
                    })
                })
            },
            showInfo(scope) {
                this.currentDetailInfo = scope;
                this.InfoVisible = true
            }
        },
        mounted() {
            this.setMenu()
//            this.Init()
        }
    };
</script>
<style>

</style>