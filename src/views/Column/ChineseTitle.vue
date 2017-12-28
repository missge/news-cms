<!--Created by Goodluck-->
<template>
    <section>
        <!--{{select}}-->
        <el-table :data="list" highlight-current-row v-loading="isloading" @current-change="SelectOneItem">
            <el-table-column prop="title" label="类型" width="180">
            </el-table-column>
            <el-table-column prop="describe" label="描述" min-width="180">
            </el-table-column>
            <el-table-column prop="url" label="URL" width="180">
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                    <el-button @click="Edit(1,scope)" size="small">修改</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="Edit(0)">新增</el-button>
            <el-button type="danger" :disabled="select instanceof Array" @click="Remove">删除</el-button>
        </el-col>

        <el-dialog :title="FormTitle" v-model="FormVisible" :close-on-click-modal="false"
                   @close="resetForm('FormValue')">
            <!--{{FormValue}}-->
            <el-form :model="FormValue" label-width="100px" ref="FormValue" :rules="rules">

                <el-form-item label="类型：" prop="title">
                    <el-input v-model="FormValue.title" placeholder="类型："></el-input>
                </el-form-item>
                <el-form-item label="选择应用：" prop="appId">
                    <el-select v-model="FormValue.appId" placeholder="选择应用">
                        <el-option v-for="item in this.appList" :label="item.label" :value="item.value"
                                   :key="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Code：" prop="code">
                    <el-input v-model="FormValue.code" placeholder="Code："></el-input>
                </el-form-item>
                <el-form-item label="描述：" prop="describe">
                    <el-input v-model="FormValue.describe" placeholder="描述："></el-input>
                </el-form-item>
                <el-form-item label="URL：" prop="url">
                    <el-input v-model="FormValue.url" placeholder="URL："></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="FormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="FormSubmit('FormValue')">提交
                </el-button>
            </div>
        </el-dialog>
        <!--{{select instanceof Array}}-->
    </section>
</template>
<script>

    import {
        categoryUpdate,
        categoryDel,
        categories,
        categoryAdd,
        getAppList
    } from '../../api/api'
    import {InitMenu} from '../../common/js/util';

    export default {
        data() {
            return {
                isloading: true,
                rules: {
                    title: [{required: true, message: '请输入类型', trigger: 'blur'}],
                    url: [{required: true, message: '请输入URL', trigger: 'blur'}],
                    describe: [{required: true, message: '请输入描述', trigger: 'blur'}],
                    code: [{required: true, message: '请输入Code', trigger: 'blur'}],
                    appId: [{required: true, message: '请选择应用', trigger: 'blur'}],
                },
                list: [],
                select: [],
                currentStatus: '',
                FormValue: {
                    title: '',
                    url: '',
                    describe: '',
                    code: '',
                    appId: ''
                },
                FormTitle: '',
                FormVisible: false,
                appList: []
            }
        },
        methods: {
            SelectOneItem(currentRow, oldCurrentRow) {
                console.log(currentRow, oldCurrentRow)
                this.select = currentRow
            },
            Edit(option, scope) {
                if (option) {
                    //修改
                    this.FormTitle = '修改';
                    this.FormValue.title = scope.row.title;
                    this.FormValue.describe = scope.row.describe;
                    this.FormValue.url = scope.row.url;
                    this.FormValue.appId = scope.row.appId;
                    this.FormValue._id = scope.row._id;
                    this.FormValue.code = scope.row.code;
                    this.currentStatus = 'update'

                } else {
                    this.FormTitle = '添加';
                    this.FormValue.title = '';
                    this.FormValue.describe = '';
                    this.FormValue.url = '';
                    this.FormValue.appId = 'chinaApp';
                    this.FormValue._id = '';
                    this.FormValue.code = '';
                    this.currentStatus = 'edit'
                }
                this.FormVisible = true;
            },
            Remove() {
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    console.log(this.select)
                    let para = {appId: this.select._id};
                    categoryDel({
                        categoryId: this.select._id
                    }).then(
                        () => {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            })
                            this.Init();
                        }
                    ).catch()
                }).catch(() => {
                    this.listLoading = false;
                });

            },
            FormSubmit(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (this.currentStatus === 'edit') {
                            categoryAdd({
                                title: this.FormValue.title,
                                appId: this.FormValue.appId,
                                describe: this.FormValue.describe,
                                url: this.FormValue.url,
                                code: this.FormValue.code,

                            }).then(
                                data => {
                                    this.$message.success(`成功`)
                                    this.Init()
                                }
                            ).catch()
                        } else if (this.currentStatus === 'update') {
                            categoryUpdate({
                                title: this.FormValue.title,
                                appId: this.FormValue.appId,
                                describe: this.FormValue.describe,
                                url: this.FormValue.url,
                                _id: this.FormValue._id,
                                code: this.FormValue.code,
                            }).then(
                                data => {
                                    this.$message.success(`成功`)
                                    this.Init()
                                }
                            ).catch()
                        }
                        this.FormVisible = false;
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                })
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            Init() {
                categories({
                    appId: 'chinaApp'
                }).then(
                    data => {
                        console.log(data)
                        this.list = data.list
                        this.isloading = false;
                    }
                ).catch(
                    () => {
                        this.isloading = false;
                    }
                )
            },
            getSelectList() {
                InitMenu(this.appList);
            }
        },
        mounted() {
            this.getSelectList()
            this.Init()
        }
    }
</script>
<style>

</style>