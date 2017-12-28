<template>
    <section style="min-width: 660px">
        <!--工具栏-->
        <el-col :span="24" class="toolbar" style="width: 100%">
            <el-form :inline="true" :model="search" :rules="searchRules" ref="search">
                <el-form-item prop="type">
                    <el-select v-model="search.type" placeholder="选择类型" @change="list=[]">
                        <el-option label="视频文章" value="video_click"></el-option>
                        <el-option label="直播文章" value="live_click"></el-option>
                        <el-option label="点赞数" value="upvote"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="id">
                    <el-input v-model="search.id" placeholder="输入文章id/视频Url"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button class="primary" @click="GetClickCount"
                               :disabled="!search.id||!search.type">查询
                    </el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="list" style="width: 100%" :show-header="false" v-loading="loading"
                  :highlight-current-row="false">
            <el-table-column prop="title" label="" width="180">
            </el-table-column>
            <el-table-column prop="number" label="" width="180">
            </el-table-column>
            <el-table-column label="" min-width="180">
                <template slot-scope="scope">
                    <el-button size="small" @click="showUpdate(scope)"
                               v-if="scope.row.mark!=='real'&&scope.row.mark!=='sum'">修改
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog title="修改数据" :visible="dialogVisible" :show-close="false">
            <el-form label-width="120" ref="clickCountUpdate" :model="clickCountUpdate" :rules="rules">
                <el-form-item prop="currentNum">
                    <el-input type="number" v-model="clickCountUpdate.currentNum"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="UpdateClickCount">保 存</el-button>
            </span>
        </el-dialog>
        <!--{{currentId}}-->
    </section>
</template>
<script>

    import {ClickCountGet, ClickCountUpdate, ClickCountGetRealSum, ClickCountGetRealSum2} from '../../api/api'
    import md5 from 'blueimp-md5';

    export default {
        data() {
            /*输入数字验证*/
            let checkNumber = (rule, value, callback) => {
                value = Number(value)
                console.log(this.clickCountUpdate.currentMark === 'baseClickCount')
                console.log(value)
                console.log(this.currentbaseClickCount)
                if (value < 0) {
                    callback(new Error('值需要为正数'));
                }
                if (Math.floor(value) !== value) {
                    callback(new Error('值需要是整数'));
                }
                if (this.clickCountUpdate.currentMark === 'baseClickCount' && value < this.currentbaseClickCount) {
                    callback(new Error('基础点击数修改值不能小于其修改前值'));
                }
                if (this.clickCountUpdate.currentMark === 'baseN' && value === 0) {
                    callback(new Error('随机倍数不可以为零'));
                }
                callback();
            };
            return {
                rules: {
                    currentNum: [
                        {required: true, message: '输入值不能为空', trigger: 'blur'},
                        {validator: checkNumber, trigger: 'blur'}
                    ]
                },
                searchRules: {
                    /* id: [{required: true, message: '请输入Id'}],
                     type: [{required: true, message: '请选择类型'}]*/
                },
                clickCountUpdate: {
                    currentMark: '',
                    currentNum: ''
                },
                dialogVisible: false,
                message: '点击数查询',
                search: {
//                    id: 'http://mp42.china.com.cn/video_tide/video/2017/11/14/201711141510621891371_366.mp4',
                    id: '',
                    type: '',
                    url: ''
                },
                list: null,
                currentId: '',
                currentType: '',
                currentbaseClickCount: '',
                currentbaseN: '',
                loading: false
            };
        },
        methods: {
            /**
             * 获取点击数
             * @constructor
             */
            GetClickCount() {
                this.$refs['search'].validate((valid) => {
                    if (valid) {
                        this.loading = true;
                        let a = false, b = false;
                        let para = (this.search.type !== 'live_click') ? {
                            type: this.search.type,
                        } : {};
                        this.list = [];
                        ClickCountGet(this.search.id, para).then(
                            data => {
                                console.log('点击总数和真实数据获取返回数据', data)
                                let ss = data
                                this.currentId = ss.key || ss.articleId;
                                this.currentbaseClickCount = ss.baseClickCount;
                                this.currentbaseN = ss.baseN
                                this.list.push({
                                    order: 2,
                                    mark: 'baseClickCount',
                                    title: '基础点击数',
                                    number: data.baseClickCount
                                });
                                if (this.search.type !== 'upvote') {
                                    this.list.push({
                                        order: 3,
                                        mark: 'baseN',
                                        title: '随机倍数',
                                        number: data.baseN
                                    });
                                }
                                a = true;
                                if (a && b) {
                                    this.loading = false;
                                    this.list.sort(function (a, b) {
                                        return a.order > b.order
                                    })
                                }
                            }
                        ).catch(
                            message => {
                                let cache = JSON.parse(message);
                                console.log('点击总数和真实数据获取错误', cache);
                                this.$message.error(cache.message)
                                this.list = [];
                                this.loading = false;
                            }
                        );
                        let para2 = (this.search.type !== 'live_click') ? {
                            type: this.search.type
                        } : {};

                        if (this.search.type === 'video_click' || this.search.type === 'upvote') {
                            ClickCountGetRealSum2(
                                {
                                    key: this.search.id,
                                    event: 'count',
                                    ...para2
                                }
                            ).then(
                                data => {
                                    console.log('查询总数和真实点击数数据', data)
                                    this.list.push({
                                        order: 1,
                                        title: '真实点击数',
                                        mark: 'real',
                                        number: data.data.realClickCount
                                    });
                                    this.list.push({
                                        order: 4,
                                        mark: 'sum',
                                        title: '总数',
                                        number: data.data.totalClickCount
                                    });
                                    b = true;
                                    if (a && b) {
                                        this.loading = false;
                                        this.list.sort(function (a, b) {
                                            return a.order > b.order
                                        })
                                    }
                                }
                            ).catch(
                                message => {
                                    console.log('点击总数和真实数据获取错误', message)
                                    this.list = []
                                    if (!a) {
                                        this.loading = false;
                                    }
                                }
                            );
                        } else {
                            ClickCountGetRealSum(
                                this.search.id, para
                            ).then(
                                data => {
                                    console.log('查询总数和真实点击数数据', data)
                                    this.list.push({
                                        order: 1,
                                        title: '真实点击数',
                                        mark: 'real',
                                        number: data.realClickCount
                                    });
                                    this.list.push({
                                        order: 4,
                                        mark: 'sum',
                                        title: '总数',
                                        number: data.allClickCount
                                    });
                                    b = true;
                                    if (a && b) {
                                        this.loading = false;
                                        this.list.sort(function (a, b) {
                                            return a.order > b.order
                                        })
                                    }
                                }
                            ).catch(
                                message => {
                                    let cache = JSON.parse(message);
                                    console.log('点击总数和真实数据获取错误', cache);
                                    this.$message.error(cache.message)
                                    this.list = [];
                                    if (!a) {
                                        this.loading = false;
                                    }
                                }
                            );
                        }
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            /**
             * 修改点击数
             * @constructor
             */
            UpdateClickCount() {
                this.$refs['clickCountUpdate'].validate((valid) => {
                    if (valid) {
                        console.log('submit!');
                        let para = {
                            articleId: this.currentId,
                            baseClickCount: Number((this.clickCountUpdate.currentMark === 'baseClickCount') ? this.clickCountUpdate.currentNum : this.currentbaseClickCount),
                            baseN: Number((this.clickCountUpdate.currentMark === 'baseN') ? this.clickCountUpdate.currentNum : this.currentbaseN),
                        };
                        if (this.search.type === 'video_click') {
                            para.type = 'video_click'
                        }
                        if (this.search.type === 'upvote') {
                            para.type = 'upvote'
                        }
                        console.log(para)
                        this.dialogVisible = false;
                        ClickCountUpdate(para.articleId, para).then(
                            data => {
                                console.log(data)
                                this.GetClickCount()
                            }
                        ).catch(message => {
                            console.log(message)
                            this.$message.error('修改出错啦')
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            /**
             * 展示修改点击数
             * @param scope
             */
            showUpdate(scope) {
                console.log(scope.row)
                this.clickCountUpdate = {
                    currentMark: scope.row.mark,
                    currentNum: scope.row.number,
                }
                this.dialogVisible = true;
            }

        }

    }
</script>
<style>

</style>