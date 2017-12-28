<!--Created by Goodluck 2017.11.08-->
<template>
    <section>
        <!--搜索栏-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="search">
                <el-form-item>
                    <el-select v-model="search.areaOrNet" placeholder="" @change="">
                        <el-option :label="'地区'" :value="'area'"></el-option>
                        <el-option :label="'网站'" :value="'web'"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="search.chineseOrEnglish" placeholder="" @change="">
                        <el-option :label="'中文'" :value="'zh'"></el-option>
                        <el-option :label="'英文'" :value="'en'"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="search.message" placeholder="查询内容"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="Search()">搜索</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--表格展示区-->
        <el-table :data="ReportInfoList" style="width: 100%" @selection-change="SelectionChange" v-loading="isLoading">
            <el-table-column
                    type="selection"
                    width="55">
            </el-table-column>
            <el-table-column label="排序" prop="index" width="150">
            </el-table-column>
            <el-table-column label="名称" prop="itemName" width="150">
            </el-table-column>
            <el-table-column label="电话" prop="phone" min-width="150">
                <template slot-scope="scope">
                    <span v-for="(item,index) in scope.row.tel">{{item.iphone}}<span
                            v-if="index+1!==scope.row.tel.length">,</span></span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button size="small" @click="showForm('edit',scope)">查看/修改</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--分页，增加，删除-->
        <div :span=24 class="toolbar">
            <el-button @click="showForm('add')" type="primary">
                新增
            </el-button>
            <el-button @click="del" type="danger" :disabled="currentChooseItem.length===0">
                删除
            </el-button>
            <el-pagination layout="prev, pager, next" @current-change="goToPage" :page-size="size"
                           :total="total" style="float:right;" :current-page.sync="currentPage">
            </el-pagination>
        </div>

        <!--弹出操作框，用于新增和修改-->
        <el-dialog :visible.sync="FormVisible" :title="`${currentOption?'新增':'查看/修改'}举报`">
            <el-form ref="ReportForm" :model="ReportForm" label-width="80px"
                     :rules="rules">
                <el-form-item label="名称" prop="name">
                    <el-input placeholder="名称"
                              v-model="ReportForm.name"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="phone">
                    <el-input placeholder="电话，多个使用‘，’分隔"
                              v-model="ReportForm.phone"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-col :span="11">
                        语言：{{search.chineseOrEnglish | formatChineseOrEnglish}}
                    </el-col>
                    <el-col :span="11">
                        类型： {{search.areaOrNet | formatAreaOrWeb}}
                    </el-col>
                </el-form-item>
                <el-form-item label="排序" prop="order">
                    <el-input placeholder="排序"
                              v-model="ReportForm.order"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="Reset('ReportForm')">重置</el-button>
                <el-button @click="Submit('ReportForm')" :loading="buttonLoading">
                    <span v-if="currentOption">提交</span>
                    <span v-else>保存</span>
                </el-button>
            </div>
        </el-dialog>
        <!--{{currentSearchFilter}}-->
    </section>
</template>
<script>
    import {ReportList, ReportAdd, ReportRemove, ReportUpdate} from '../../api/api'
    import {trim} from '../../common/js/util';

    export default {
        data() {
            return {
                currentPage: 1,
                size: 10,
                total: 60,
                currentOption: null,//当前操作时增加还是修改
                currentChooseItem: [],
                buttonLoading: false,
                ReportForm: {
                    name: '',
                    phone: '',
                    order: ''
                },
                appList: [],
                rules: {
                    name: [
                        {required: true, message: '请输入名称', trigger: 'blur'},
                    ],
                    phone: [
                        {required: true, message: '请输入电话', trigger: 'blur'},
                    ],
                    order: [
                        {required: true, message: '请输入排序', trigger: 'blur'},
                    ]
                },
                FormVisible: false,
                search: {
                    message: '',
                    chineseOrEnglish: 'zh',
                    areaOrNet: 'area'
                },
                ReportInfoList: [],
                currentSearchFilter: {},
                currentId: '',
                isLoading: false
            }
        },
        filters: {
            formatChineseOrEnglish(value) {
                return (value === 'zh') ? '中文' : '英文'
            },
            formatAreaOrWeb(value) {
                return (value === 'area') ? '地区' : '网络'
            }
        },
        methods: {
            /**
             * 表单的提交包含新增和修改
             * @param formName
             * @constructor
             */
            Submit(formName) {
                this.buttonLoading = true;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (this.currentOption) {
                            console.log(`增加操作`, this.ReportForm);
//                            this.$message.success('增加成功')
                            let para = {
                                itemName: this.ReportForm.name,
                                tel: this.ReportForm.phone.replace(/，/g, ",").split(',').map(x => {
                                    return {iphone: x}
                                }),
                                language: this.currentSearchFilter.chineseOrEnglish,
                                type: this.currentSearchFilter.areaOrNet,
                                index: this.ReportForm.order,
                            };
                            console.log(para);
                            /*   this.buttonLoading = false;

                               return*/
                            ReportAdd(para).then(
                                data => {
                                    console.log('add return data', data)
                                    this.Init();
                                }
                            ).catch(
                                message => {
                                    console.log(message)
                                }
                            )
                        } else {
                            console.log(`修改操作`, this.ReportForm)
//                            this.$message.success('保存成功')
                            let para = {
                                itemName: this.ReportForm.name,
//                                tel: this.ReportForm.phone,
                                tel: this.ReportForm.phone.replace(/，/g, ",").split(',').map(x => {
                                    return {iphone: x}
                                }),
                                language: this.currentSearchFilter.chineseOrEnglish,
                                type: this.currentSearchFilter.areaOrNet,
                                index: this.ReportForm.order,
                                _id: this.currentId
                            };
                            ReportUpdate(para).then(
                                data => {
                                    console.log('update return', data)
                                    this.Init();
                                }
                            ).catch(
                                message => {
                                    console.log(message)
                                }
                            )
                        }
                        this.FormVisible = false;
                        this.Init()
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
            },
            /**
             * 分页跳转
             * @param val
             */
            goToPage(val) {
                this.Init(val)
            },
            /**
             * 获取table里的数据
             * @param page
             * @param change 为true时表示根据当前搜索form的条件进行搜索，否则使用上次的搜索条件进行搜索
             * @constructor
             */
            Init(page = 1, change = false) {
                this.isLoading = true;
                if (page === 1) this.currentPage = 1;
                if (change) {
                    this.currentSearchFilter = {...this.search}
                    console.log('更新缓存')

                }
                let para = {
                    page: page - 1,
                    size: this.size,
                    language: this.currentSearchFilter.chineseOrEnglish,
                    type: this.currentSearchFilter.areaOrNet
                };

                if (trim(this.currentSearchFilter.message)) {
                    para.keyword = trim(this.currentSearchFilter.message)
                }

                para.skip = para.page * para.size;
                para.limit = 10;
                console.log(`搜索数据`, para);
                ReportList(para).then(
                    data => {
                        console.log(data);
                        this.total = data.count;
                        this.ReportInfoList = data.list.filter(x => !x.delete);
                        this.ReportInfoList = data.list;
                        this.isLoading = false;
                    }
                ).catch(
                    message => {
                        console.log(message);
                        this.isLoading = false;
                    }
                )
            },
            /**
             * 搜索
             * @constructor
             */
            Search() {
                this.Init(1, true)
            },
            /**
             * 对table进行选择时触发
             * @param value 数组，包含当前选中的对象
             * @constructor
             */
            SelectionChange(value) {
                this.currentChooseItem = value
            },
            /**
             * 删除currentChooseItem里的对象
             */
            del() {
                this.$confirm('确定执行删除操作', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(
                    () => {
                        console.log(`删除的信息`, this.currentChooseItem);
                        let para = {
                            _idArr: this.currentChooseItem.map(x => x._id)
                        };
                        ReportRemove(para).then(
                            data => {
                                if (!data.code) {
                                    this.$message.success(`成功删除了${data.successArr.length}条`);
                                    this.currentChooseItem = [];
                                    this.Init()
                                }
                            }
                        ).catch(
                            message => {
                                console.log(message);
                                this.$message.error('删除失败')
                            }
                        )

                    }
                ).catch(
                    () => {
                        this.$message('您已经取消操作')
                    }
                );
            },
            /**
             * 展示表单
             * @param option add：添加；否则为修改
             * @param scope
             */
            showForm(option, scope = null) {
                if (option === 'add') {
                    this.ReportForm = {};
                    this.currentOption = true
                } else {
                    this.currentOption = false;
                    this.ReportForm = {
                        name: scope.row.itemName,
                        phone: (scope.row.tel.map(x => x.iphone)).join(","),
                        order: String(scope.row.index)
                    };
                    this.currentId = scope.row._id;
                }
                this.FormVisible = true;
                this.buttonLoading = false
            }
        },
        mounted() {
            this.Init(1, true)
        }
    }
</script>