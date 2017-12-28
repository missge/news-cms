<template>
    <div>
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="Search">
                <el-form-item label="">
                    <el-input type="text" v-model="Search.IdNumber" placeholder="用户Id"></el-input>
                </el-form-item>
                <el-form-item label="">
                    <el-input type="text" v-model="Search.userName" placeholder="用户名"></el-input>
                </el-form-item>
                <el-button @click.stop="SearchUser">查询</el-button>
            </el-form>
        </el-col>
        <el-table :data="userList" highlight-current-row v-loading="listLoading"
                  style="width: 100%; ">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column prop="_id" label="用户ID" width="220">
            </el-table-column>
            <el-table-column prop="username" label="用户名" min-width="140">
            </el-table-column>
            <el-table-column prop="" label="是否实名" width="160">
                <template slot-scope="scope">
                    <span v-if="scope.row.isVerify">是</span>
                    <span v-if="!scope.row.isVerify">否</span>
                </template>
            </el-table-column>
            <el-table-column prop="isTest" label="是否测试用户" :formatter="TestForMatter" width="160">
            </el-table-column>
            <el-table-column prop="" label="修改">
                <template slot-scope="scope">
                    <el-button size="small" @click="changeStatus(scope.row)">修改</el-button>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                    <el-button size="small" @click="showUserDetail(scope)"> 查看</el-button>
                </template>
            </el-table-column>

            <el-table-column prop="createTime" :formatter="dateFormat" label="注册时间" width="180">
            </el-table-column>
        </el-table>
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>
        <!--{{userList}}-->
        <el-dialog title="实名认证" :visible.sync="showDialog" size="tiny">
            <div>姓名：{{UserConfirm.userName}}</div>
            <div>身份证号：{{UserConfirm.IdNumber}}</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showDialog= false">关闭</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script>

    import util, {dateFormat} from '../../common/js/util';
    import {getCommentUserList, setUserIsTest} from '../../api/api'

    export default {
        data() {
            return {
                listLoading: false,
                showDialog: false,
                size: 10,
                total: 10,
                userList: null,
                UserConfirm: {
                    userId: null,
                    userName: null,
                    IdNumber: null
                },
                Search: {
                    userName: '',
                    IdNumber: ''
                }
            }
        },
        methods: {
            changeStatus(row) {
                let para = {
                    userId: row._id,
                    isTest: !row.isTest
                };
                let str = para.isTest ? '确定要更改用户为测试用户' : '确定要更改用户为非测试用户';
                this.$confirm(str, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                        setUserIsTest(para).then(
                            data => {
                                console.log(data);
                                this.Init()
                            }
                        ).catch(
                            message => {
                                console.log(message)
                            }
                        )
                    }
                ).catch(
                    () => {
                        this.$message('已经取消操作')
                    }
                )
            },
            TestForMatter(a, b, c) {
//                console.log(c)
                if (!c) {
                    return '不是'
                } else {
                    return '是'
                }
            },
            showUserDetail(scope) {
                console.log(scope)
                if (!scope.row.isVerify) {
                    this.$message.error('您查询的用户没有实名认证')
                    return
                }
                this.UserConfirm.userId = scope.row.verify.userId
                this.UserConfirm.userName = scope.row.verify.realName
                this.UserConfirm.IdNumber = scope.row.verify.idCard
                this.showDialog = true
            },
            handleCurrentChange(page) {
                console.log(page);
//                Init(page);
                getCommentUserList(
                    {
                        page: page,
                        size: 10
                    }
                ).then(
                    data => {
                        this.userList = data.list
                        console.log(this.userList)
                        this.total = data.total
                    }
                ).catch()
            },
            dateFormat: dateFormat,
            SearchUser() {
                let name = this.Search.userName
                let number = this.Search.IdNumber
                this.listLoading = true;
                getCommentUserList(
                    {
                        _id: number,
                        username: name,
                        page: 0,
                        size: 10
                    }
                ).then(
                    data => {
                        this.userList = data.list
                        console.log(this.userList)
                        this.total = data.total
                        this.listLoading = false;
                    }
                ).catch(message => {
                    this.listLoading = false;
                })
            },
            Init(page = 0) {
                this.listLoading = true;
                getCommentUserList(
                    {
                        page: page,
                        size: 10
                    }
                ).then(
                    data => {
                        this.userList = data.list
                        console.log(this.userList)
                        this.total = data.total;
                        this.listLoading = false;
                    }
                ).catch(
                    message => {
                        this.listLoading = false;
                    }
                )
            }
        },
        mounted() {
            this.Init()
        }
    };
</script>
<style>

</style>