<template>
    <section>
        <el-table :data="list" v-loading="loading">
            <el-table-column label="时间范围" prop="dateString" min-width="140">
            </el-table-column>
            <el-table-column label="详情" prop="name" min-width="140">
                <template slot-scope="scope">
                    <el-button @click="Detail(scope.row)" size="small">查看</el-button>
                </template>
            </el-table-column>
            <el-table-column label="操作" prop="name" min-width="140">
                <template slot-scope="scope">
                    <el-button @click="Option(scope.row)" size="small">重新生成</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="Init" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>
    </section>
</template>
<script>
    import {weekListStats, weekGenerate} from '../../api/api';
    import {dateFormat} from '../../common/js/util';

    export default {
        data() {
            return {
                size: 10,
                total: 66,
                list: [],
                loading: true
            }
        },
        methods: {
            dateFormat: dateFormat,
            Detail(row) {
                this.$router.push({
                    path: '/Statistics/reportItem',
                    query: {weekId: row.weekId}
                })
            },
            Option(row) {
                this.$confirm('确定要重新生成?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    weekGenerate({
                        weekId: row.weekId
                    }).then(
                        data => {
                            console.log(data);
                            this.Init()
                        }
                    ).catch(
                        message => {
                            console.log(message)
                        }
                    )
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消'
                    });
                });
            },
            Init(page = 1) {
                weekListStats({page: page}).then(
                    data => {
                        console.log(data)
                        this.total = data.count * 10
                        this.list = data.result
                        this.loading = false
                    }
                ).catch(
                    message => {
                        console.log(message)
                        this.loading = false
                    }
                )
            }
        },
        created() {
            this.Init()
        }
    }
</script>