<!--Created by Goodluck 2017.10.26-->
<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <template>
                    <el-select v-model="filters.appId" placeholder="请选择应用" @change="">
                        <el-option v-for="item in Applist" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <template>
                    <el-select v-model="filters.language" placeholder="请选择语言" @change="">
                        <el-option v-for="item in languageTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <el-form-item>
                    <el-button type="primary" v-on:click="Search">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <el-table :data="popularSearchList" v-loading="listLoading"
                  style="width: 100%;">
            <el-table-column type="index" label="搜索排名" width="120">
            </el-table-column>
            <el-table-column prop="keyword" label="搜索词" width="120">
            </el-table-column>
            <el-table-column prop="searchCount" label="搜索次数" width="120" >
            </el-table-column>

            <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                    <el-button size="small" @click="Edit(scope.$index, scope.row,1)">修改</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="cao'zuo" label="操作记录" min-width="140">
                <template slot-scope="scope">
                    <el-button size="small" @click="showHistory(scope)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div :span=24 class="toolbar">
            <el-button @click="Edit()" type="primary">
                添加
            </el-button>
        </div>

        <el-dialog :title="addOrEditForm.title" v-model="AddOrEditDialog" :close-on-click-modal="false">
            <!--{{addOrEditForm}}-->
            <el-form :model="addOrEditForm" label-width="100px">
                <el-form-item label="选择应用">
                    <el-select v-model="addOrEditForm.appId" placeholder="请选择应用">
                        <el-option v-for="item in Applist" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="请选择语言">
                    <el-select v-model="addOrEditForm.language" placeholder="请选择语言">
                        <el-option v-for="item in languageTypeOptions" :value="item.value"
                                   :label="item.label" :key="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="热门搜索词">
                    <el-input v-model="addOrEditForm.keyword"></el-input>
                </el-form-item>
                <el-form-item label="热门搜量">
                    <el-input v-model="addOrEditForm.searchCount"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click.native="submit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--操作记录弹框-->
        <operationRecord ref="operhis"></operationRecord>

    </section>
</template>
<script>
    import {getHotSearch, addSearchWord, updateSearchWord, getAppList} from '../../api/api'
    import {InitMenu} from '../../common/js/util';
    //组件引入
    import operationRecord from '../../components/OperationRrecord'

    export default {
        components: {operationRecord},

        data() {
            return {
                editLoading: false,
                AddOrEditDialog: false,
                popularSearchList: [],
                listLoading: false,
                addOrEditForm: {
                    keyword: null,
                    searchCount: null,
                    title: null,
                    appId: null,
                    language: null
                },
                Applist: [
//                    {
//                    value: 'chinaApp',
//                    label: '中国网'
//                }
                ],
                languageTypeOptions: [
//                    {
//                        value: '',
//                        label: '全部'
//                    },
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
                        label: '俄文'//俄文
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
                filters: {
                    appId: '',
                    language: 'zh'
                }
            }
        },
        methods: {
            /*展示操作记录*/
            showHistory(scope) {
//                let _this = this;
                this.$refs.operhis.showOperation(scope.row)
            },
            Edit(index = 0, row = 0, option = 0) {
                if (option) {
//修改
                    this.addOrEditForm.keyword = row.keyword;
                    this.addOrEditForm.searchCount = row.searchCount;
                    this.addOrEditForm.appId = row.appId;
                    this.addOrEditForm.language = row.language;
                    this.addOrEditForm.title = '修改';
                    console.log(this.addOrEditForm)
                } else {
                    this.addOrEditForm.keyword = '';
                    this.addOrEditForm.searchCount = '';
                    this.addOrEditForm.appId = 'chinaApp';
                    this.addOrEditForm.language = 'zh';
                    this.addOrEditForm.title = '增加';
                }
                this.AddOrEditDialog = true
            },
            submit() {
                this.editLoading = true;
                let para = {
                    appId: this.addOrEditForm.appId,
                    language: this.addOrEditForm.language,
                    keyword: this.addOrEditForm.keyword,
                    searchCount: this.addOrEditForm.searchCount
                }
                console.log(para)
                if (this.addOrEditForm.title === '增加') {
                    addSearchWord(para).then(
                        data => {
                            if (!data.code) {
                                this.$message.success(`增加成功`)
                                this.Init()
                            } else {
                                this.$message.error(`失败`)
                            }
                            this.editLoading = false;
                        }
                    ).catch(
                        () => {
                            this.$message.error(`失败`)
                            this.editLoading = false;
                        }
                    )
                    this.AddOrEditDialog = false

                } else if (this.addOrEditForm.title === '修改') {
                    updateSearchWord(para).then(
                        data => {
                            if (!data.code) {
                                this.$message.success(`修改成功`)
                                this.Init()
                            } else {
                                this.$message.error(`失败`)
                            }
                            this.editLoading = false;
                        }
                    ).catch(
                        () => {
                            this.$message.error(`失败`)
                            this.editLoading = false;
                        }
                    )
                    this.AddOrEditDialog = false
                }
            },
            getSelectList() {
                let _this = this;
                InitMenu(this.Applist, function (menulist) {
                    menulist.forEach(x => {
                        if (x.label === '中国网') {
                            _this.filters.appId = x.value;
                        }
                    })
                })
            },
            Init() {
                this.listLoading = true;
                this.getSelectList()
                let para = {
                    page: 0,
                    size: 10,
                    ...this.filters
                };
                para.appId = para.appId === '' ? 'chinaApp' : para.appId
                getHotSearch(para).then(
                    data => {
                        console.log(data)
                        this.popularSearchList = data.list;
                        this.listLoading = false;
                    }
                ).catch(
                    message => {
                        console.log(message);
                        this.listLoading = false;
                    }
                )
            },
            Search() {
//                console.log(this.filters)
                this.Init()
            },
        },
        mounted() {
            this.Init()
        }
    };
</script>
<style>

</style>