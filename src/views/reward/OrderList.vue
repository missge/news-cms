<!--Created by Goodluck 2017.11.09-->
<template>
    <section>
        <!--工具栏-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="search">
                <el-form-item>
                    <el-input v-model="search.orderId" placeholder="订单编号"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="search.payStatus" placeholder="订单状态">
                        <el-option label="全部状态" value="status-all"></el-option>
                        <el-option label="等待支付" value="waiting"></el-option>
                        <el-option label="支付成功" value="paySuccess"></el-option>
                        <el-option label="支付失败" value="payFailed"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-date-picker
                            v-model="search.time"
                            type="daterange"
                            placeholder="日期范围">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="search.productId" placeholder="打赏道具" @change="list=[]">
                        <el-option label="全部" value="appreciate-all"></el-option>
                        <el-option v-for="(item,key) in rewardPropList" :key='key' :label="item.showDescribe"
                                   :value="item.productId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="search.userName" placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="Search()">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <el-table :data="OrderRewardList" style="width: 100%" v-loading="isLoading">
            <el-table-column label="订单编号" prop="_id" width="230">
            </el-table-column>
            <el-table-column label="时间" :formatter="dateFormat" prop="orderStartTime" width="170">
            </el-table-column>
            <el-table-column label="支付状态" prop="payStatus" width="100">
                <template slot-scope="scope">
                    <span v-if="scope.row.payStatus==='payFailed'" style="color: #f00;">支付失败</span>
                    <span v-if="scope.row.payStatus==='paySuccess'">支付成功</span>
                    <span v-if="scope.row.payStatus==='waiting'">等待支付</span>
                </template>
            </el-table-column>
            <el-table-column label="金额" :formatter="MoneyFormat" prop="amount" width="100">
            </el-table-column>
            <el-table-column label="打赏道具" prop="productId" :formatter="formatProp" width="140">
            </el-table-column>
            <el-table-column label="用户名称" prop="userName" width="180">
            </el-table-column>
            <el-table-column label="文章id" prop="" width="90">
                <template slot-scope="scope">
                    <span>{{getArticalId(scope)}}</span>
                </template>
            </el-table-column>
            <el-table-column label="文章名称" prop="" min-width="150">
                <template slot-scope="scope">
                    <span>{{getArticalTitle(scope)}}</span>
                </template>
            </el-table-column>
        </el-table>
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="Init" :page-size="size"
                           :current-page.sync="currentPage"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>
    </section>
</template>
<script>
    import {RewardListOrder, RewardResource} from '../../api/api'
    import {trim, dateFormat} from '../../common/js/util';

    export default {
        data() {
            return {
                currentPage: 1,
                size: 10,
                total: 70,
                search: {
                    articleId: '',
                    time: null,
                    orderId: '',
                    userName: '',
                    productId: '',
                    payStatus: ''
                },
                OrderRewardList: [],
                isLoading: false,
                rewardPropList: []
            };
        },
        methods: {
            dateFormat: dateFormat,
            formatProp(row, column, cellValue) {
                let cache = this.rewardPropList.filter(x => {
                    return x.productId === cellValue
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
            getArticalId(scope) {
                return JSON.parse(scope.row.productExtra).articleId
            },
            getArticalTitle(scope) {
                return JSON.parse(scope.row.productExtra).title
            },
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
                if (trim(this.search.orderId)) {
                    para.orderId = trim(this.search.orderId)
                }
                if (this.search.productId && this.search.productId !== 'appreciate-all') {
                    para.productId = trim(this.search.productId)
                }

                if (this.search.payStatus && this.search.payStatus !== 'status-all') {
                    para.payStatus = trim(this.search.payStatus)
                }
                if (trim(this.search.userName)) {
                    para.userName = trim(this.search.userName)
                }

                console.log(`打赏平台页面传参`, para)
                RewardListOrder(para).then(
                    data => {
                        this.OrderRewardList = data.list
                        this.total = data.total
                        this.isLoading = false;
                    }
                ).catch(
                    message => {
                        console.log(message)
                        this.isloading = false;
                    }
                )
            },
            /**
             * 搜索
             **/
            Search() {
                this.Init()
            },
            /* geoToPage(page) {
                 this.Init(page)
             }*/
        }
        ,
        mounted() {
            this.Init()
            RewardResource().then(
                data => {
                    console.log(data);
                    this.rewardPropList = data.products
                }
            ).catch()
        }
    }
    ;
</script>