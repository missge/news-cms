<template>
    <section>
        <el-row>
            <el-col :span="24" class="toolbar">
                <el-form :inline="true">
                    <el-form-item>
                        <el-input v-model="editContent"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button @click="finish">完成</el-button>
                    </el-form-item>
                    <router-link class="el-button" style="float: right" :to="{name:'统计报表'}">返回上一级
                    </router-link>
                </el-form>
            </el-col>
        </el-row>
        <article>
            <h1>一.设备统计</h1>
            <ul>
                <li>新增设备:第一次打开应用的设备</li>
                <li>活跃设备:启动过应用的设备(去重),启动过一次应用的设备即为活跃设备,包括新设备与老设备</li>
                <li>启动次数:打开应用视为启动,完全退出或后台运行超过30s视为一次新的启动</li>
                <li>累计设备:截止到现在,所有启动过应用的设备(去重)</li>
            </ul>
            <h2>1.1 ios</h2>
            <el-table :data="iosList" v-loading="loading">
                <el-table-column label="日期" prop="dateString" min-width="140">
                </el-table-column>
                <el-table-column label="新增设备" prop="newDevice" min-width="140">
                </el-table-column>
                <el-table-column label="活跃设备" prop="activeDevice" min-width="140">
                </el-table-column>
                <el-table-column label="启动次数" prop="bootTime" min-width="140">
                </el-table-column>
                <el-table-column label="累计设备" prop="totalDevice" min-width="140">
                </el-table-column>
            </el-table>
            <h2>1.2 android</h2>
            <el-table :data="androidList" v-loading="loading">
                <el-table-column label="日期" prop="dateString" min-width="140">
                </el-table-column>
                <el-table-column label="新增设备" prop="newDevice" min-width="140">
                </el-table-column>
                <el-table-column label="活跃设备" prop="activeDevice" min-width="140">
                </el-table-column>
                <el-table-column label="启动次数" prop="bootTime" min-width="140">
                </el-table-column>
                <el-table-column label="累计设备" prop="totalDevice" min-width="140">
                </el-table-column>
            </el-table>
            <h1>二.用户统计</h1>
            <ul>
                <li>新增用户:第一次登录应用的用户</li>
                <li>活跃用户:启动过应用的用户(去重),启动过一次应用的用户即为活跃用户,包括新用户与老用户</li>
                <li>累计用户:截止到现在,所有登录过应用的用户(去重)</li>
            </ul>
            <el-table :data="userList">
                <el-table-column label="日期" prop="dateString" min-width="140">
                </el-table-column>
                <el-table-column label="新增用户" prop="newUser" min-width="140">
                </el-table-column>
                <el-table-column label="活跃用户" prop="activeUser" min-width="140">
                </el-table-column>
                <el-table-column label="累计用户" prop="totalUser" min-width="140">
                </el-table-column>
            </el-table>
            <h1>三.栏目</h1>
            <template v-for="(item,index) in columnList">
                <h2>{{index | languageFilter}}</h2>
                <h3>栏目统计</h3>
                <ul>
                    <li>阅读量:打开对应栏目的文章,则阅读量+1</li>
                    <li>发稿/编辑发稿:对应栏目总的发稿数以及其中编辑的发稿数</li>
                    <li>新增/取消/:登陆用户订阅栏目,取消订阅栏目即为新增/取消订阅量(一天内用户多次操作要去重)</li>
                    <li>净增订阅量:即为新增订阅减取消订阅</li>
                    <li>收藏量:用户收藏文章</li>
                    <li>转发量:用户转发文章</li>
                </ul>
                <h4>附注:这里栏目按照阅读量由高到低排列</h4>
                <el-table :data="Array.from(columnList[index])" v-loading="loading">
                    <el-table-column label="序号" type="index" width="80">
                    </el-table-column>
                    <el-table-column label="栏目" prop="columnName" min-width="140">
                    </el-table-column>
                    <el-table-column label="栏目浏览量" prop="flushCount" min-width="100">
                    </el-table-column>
                    <el-table-column label="文章阅读量" prop="readCount" min-width="100">
                    </el-table-column>
                    <el-table-column label="总发稿/编辑发稿量" prop="name" min-width="160">
                        <template slot-scope="scope">
                            {{scope.row.fagaoCount}}/{{scope.row.fagaoCountWithEditor}}
                        </template>
                    </el-table-column>
                    <el-table-column label="总订阅量" prop="allSubscribeCount" min-width="120">
                    </el-table-column>
                    <el-table-column label="新增/取消/净增订阅量" prop="name" min-width="180">
                        <template slot-scope="scope">
                            {{scope.row.subscribeCount}}/{{scope.row.cancelSubscribeCount}}/{{scope.row.pureSubscribeCount}}
                        </template>
                    </el-table-column>
                    <el-table-column label="收藏量" prop="collectCount" min-width="100">
                    </el-table-column>
                    <el-table-column label="转发量" prop="shareCount" min-width="100">
                    </el-table-column>
                </el-table>
                <h3>阅读TOP 10</h3>
                <ul>
                    <li>阅读数:一周内阅读量最多的前十篇文章</li>
                    <li>仅计算文章在一周内的阅读次数</li>
                </ul>
                <el-table :data="Array.from(article[index])" v-loading="loading">
                    <el-table-column label="排名" type="index" width="80">
                    </el-table-column>
                    <el-table-column label="文章标题" prop="title" min-width="140">
                    </el-table-column>
                    <el-table-column label="阅读数" prop="scanCount" width="180">
                    </el-table-column>
                    <el-table-column label="所属栏目" prop="columnName" width="180">
                    </el-table-column>
                </el-table>
            </template>
        </article>
    </section>
</template>
<script>
    import {weekDetailStats, updateWeekDetailDesc} from '../../api/api'

    export default {
        data() {
            return {
                msg: '报告详情页',
                weekId: '',
                editContent: '',
                list: [{
                    name: '假数据'
                }],
                androidList: [],
                iosList: [],
                userList: [],
                column: {},
                article: {},
                columnList: {},
                loading: true
            }
        },
        methods: {
            finish() {
//                console.log(this.editContent)
                this.$confirm('确定执行此操作', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    updateWeekDetailDesc(
                        {
                            weekId: this.weekId,
                            description: this.editContent
                        }
                    ).then(
                        data => {
                            console.log(data)
                            this.$message.success('成功')
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
            Init() {
                weekDetailStats({
                    appId: "chinaApp",
                    description: "",
                    language: "all",
                    weekId: this.weekId
                }).then(
                    data => {
                        this.androidList = data.device.android || [];
                        this.iosList = data.device.ios || [];
                        this.userList = data.user || [];
                        this.columnList = data.column || {}
                        this.article = data.article || {}
                        this.loading = false;
                        this.editContent = data.description.description || ''
                    }
                ).catch(
                    message => {
                        console.log(message)
                        this.loading = false
                    }
                )
            },
        },
        filters: {
            languageFilter(value) {
                console.log(value)
                if (value)
                    return {
                        'zh': '中文',
                        'en': '英文',
                        'fr': '法文',
                        'ar': '阿拉伯文',
                        'ru': '俄文',
                        'sp': '西班牙文',
                        'ge': '德文',
                        'ko': '韩文',
                        'ja': '日文'
                    }[value];
            }
        },
        created() {
            this.weekId = this.$route.query.weekId;
            this.Init()
            window.text = this
        }
    }
</script>
<style>
    h1 {
        font-size: 30px;
        text-align: center;
        font-weight: 500;
    }
</style>