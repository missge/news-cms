<!--Created by Goodluck 2017.11.09-->
<template>
    <section>
        <!--工具栏-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="search">
                <el-form-item>
                    <el-date-picker
                            v-model="search.time"
                            type="daterange"
                            placeholder="日期范围">
                    </el-date-picker>
                </el-form-item>

                <el-form-item>
                    <el-input v-model="search.articleId" placeholder="文章Id"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="Search">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <el-table :data="RewardInfoList" style="width: 100%" v-loading="isLoading">
            <el-table-column label="文章id" prop="_id" width="150">
            </el-table-column>
            <el-table-column label="文章标题" prop="product.title" min-width="150">
            </el-table-column>
            <el-table-column label="打赏总金额" :formatter="MoneyFormat" prop="appreciateAmount" width="150">
            </el-table-column>
            <el-table-column label="打赏次数" prop="appreciateCount" width="150">
            </el-table-column>
            <el-table-column label="详情" width="150">
                <template slot-scope="scope">
                    <el-button size="small" @click="goToDetail(scope)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="Init" :page-size="size"
                           :total="total" style="float:right;" :current-page.sync="currentPage">
            </el-pagination>
        </el-col>


    </section>
</template>
<script>
    import {RewardListMessage, RewardInfo} from '../../api/api'
    import {trim} from '../../common/js/util';

    export default {
        data() {
            return {
                currentPage: 1,
                size: 10,
                total: 60,
                search: {
                    articleId: '',
                    time: null
                },
                RewardInfoList: [],
                isLoading: false
            }
        },

        methods: {
            /*  goToPage(val) {
                  this.Init(val)
              },*/
            /**
             *获取table内数据
             * */
            Init(page = 1) {
                if (page === 1) this.currentPage = 1;
                this.isLoading = true;
                let para = {
                    page: page - 1,
                    size: this.size,
                };
                if (this.search.time && this.search.time[0] && this.search.time[1]) {
                    para.startTime = new Date(this.search.time[0]).getTime();
                    para.endTime = new Date(this.search.time[1]).getTime()
                }
                if (trim(this.search.articleId)) {
                    para.articleId = trim(this.search.articleId)
                }
                console.log(`打赏列表页面获取列表传参`, para);

                RewardInfo(
                    para
                ).then(
                    data => {
//                        console.log(data)
                        this.RewardInfoList = data.list;
                        this.total = data.total
                        this.isLoading = false;
                    }
                ).catch(
                    message => {
                        console.log(message);
                        this.isLoading = false;
                    }
                )
            },
            MoneyFormat(row, column, cellValue) {
                cellValue = Number(cellValue) / 100
                return `${cellValue}元`;
            },
            /**
             * 搜索
             **/
            Search() {
                this.Init()
            },
            /**
             * 跳转到详情页
             * @param scope
             */
            goToDetail(scope) {
                console.log(scope.row)
                let id = scope.row._id
                this.$router.push({
//                    path: `/Order/RewardDetail/${id}/${scope.row.appreciateAmount}/${scope.row.appreciateCount}`,
                    path: `/Order/RewardDetail/${id}`,
                })
            }
        },
        mounted() {
            this.Init()
        }
    }
</script>