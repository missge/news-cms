<!--Created by Goodluck 2017.11.10-->
<template>
    <section>
        <el-col :span="24" class="toolbar">
            <el-row :gutter="20">
                <el-col :span="6">
                    <div style="font-size: 18px;margin-top:4px">
                        <b>文章Id:{{articleId}}</b>
                    </div>
                </el-col>
                <el-col :span="4" :offset="14">
                    <el-button type="primary" size="small" @click="gaoBack">
                        返回上一级
                    </el-button>
                </el-col>
            </el-row>
        </el-col>
        <!--工具栏-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="search">
                <!-- <el-form-item>
                     <el-input v-model="search.orderId" placeholder="订单编号"></el-input>
                 </el-form-item>-->
                <el-form-item>
                    <el-date-picker
                            v-model="search.time"
                            type="daterange"
                            placeholder="日期范围">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="search.userName" placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="Search()">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <el-table :data="orderList" style="width: 100%" v-loading="isLoading">
            <el-table-column label="订单编号" prop="_id" width="220">
            </el-table-column>
            <el-table-column label="时间" :formatter="dateFormat" prop="appreciateTime" width="200">
            </el-table-column>
            <el-table-column label="打赏道具" prop="" :formatter="formatProp" width="140">
            </el-table-column>
            <el-table-column label="金额" :formatter="MoneyFormat" prop="amount" width="150">
            </el-table-column>
            <el-table-column label="用户名称" prop="userName" min-width="150">
            </el-table-column>
        </el-table>
        <el-col :span="24" class="toolbar">
            <span>合计：{{appreciateAmount}}元，{{appreciateCount}}次打赏</span>
            <el-pagination layout="prev, pager, next" @current-change="Init" :page-size="size"
                           :total="total" style="float:right;" :current-page.sync="currentPage">
            </el-pagination>
        </el-col>
    </section>
</template>
<script>
    import {RewardListOrder, RewardListMessage, RewardResource, RewardInfo} from '../../api/api'
    import {trim, dateFormat} from '../../common/js/util';

    export default {
        data() {
            return {
                currentPage: 1,
                articleId: '',
                size: 10,
                total: 60,
                search: {
                    userName: '',
                    time: null,
                    orderId: ''
                },
                orderList: [],
                isLoading: false,
                rewardPropList: [],
                appreciateAmount: '',
                appreciateCount: ''
            }
        },
        methods: {
            dateFormat: dateFormat,
            formatProp(val) {
                console.log('val', val.productId)
                let cache = this.rewardPropList.filter(x => {
                    return x.productId === val.product.productId
                })[0]
                return !!cache ? cache.showDescribe : ''
            },
            /**
             * @return {string}
             */
            MoneyFormat(row, column, cellValue) {
                cellValue = Number(cellValue) / 100
                return `${cellValue}元`;
            },
            /**
             *获取table内数据
             * */
            Init(page = 1) {
                if (page === 1) this.currentPage = 1;
                this.isLoading = true
                let para = {
                    page: page - 1,
                    size: this.size,
                    articleId: this.articleId
                };
                if (this.search.time && this.search.time[0] && this.search.time[1]) {
                    para.startTime = new Date(this.search.time[0]).getTime();
                    para.endTime = new Date(this.search.time[1]).getTime()
                }

                if (trim(this.search.orderId)) {
                    para.productId = trim(this.search.orderId)
                }
                if (trim(this.search.userName)) {
                    para.userName = trim(this.search.userName)
                }
                console.log(`打赏详情页传参`, para);
                RewardListMessage(
                    para
                ).then(
                    data => {
                        console.log(data);
                        this.orderList = data.list;
                        this.total = data.total;
                        this.isLoading = false
                    }
                ).catch(
                    message => {
                        this.isLoading = false
                    }
                )
                let para2 = {}
                if (this.search.time && this.search.time[0] && this.search.time[1]) {
                    para2.startTime = new Date(this.search.time[0]).getTime();
                    para2.endTime = new Date(this.search.time[1]).getTime()
                }
                RewardInfo({
                    page: 0,
                    size: 10,
                    articleId: this.articleId,
                    ...para2
                }).then(
                    data => {
                        this.appreciateCount = data.list[0].appreciateCount
                        this.appreciateAmount = Number(data.list[0].appreciateAmount)/100
                    }
                ).catch(
                    message => {
                        console.log(message);
                        this.isLoading = false;
                    }
                );
            },
            /**
             * 搜索
             **/
            Search() {
                this.Init()
            },
            gaoBack() {
                this.$router.push('/Order/RewardList')
            }
        },
        mounted() {
            this.articleId = this.$route.params.id
//            this.appreciateCount = Number(this.$route.params.appreciateCount)
//            this.appreciateAmount = Number(this.$route.params.appreciateAmount) / 100
            this.Init();
            RewardResource().then(
                data => {
                    console.log(data);
                    this.rewardPropList = data.products
                }
            ).catch(
                message => {
                    console.log(message)
                }
            )
        }
    }
</script>