<template>
    <section>
        <el-col class="toolbar" :span="24">
            <el-form :inline="true" :model="search">
                <el-form-item>
                    <el-date-picker v-model="search.time" type="daterange" placeholder="日期范围" @change="Init()">
                    </el-date-picker>
                </el-form-item>
                <!-- <el-form-item>
                     <el-input v-model="search.chineseKeyWord" placeholder="中文查找"></el-input>
                 </el-form-item>
                 <el-form-item>
                     <el-input v-model="search.EnglishKeyWord" placeholder="英文查找"></el-input>
                 </el-form-item>-->
                <el-form-item>
                    <el-button @click="Init()">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <el-table :data="WordList" style="width: 100%" v-loading="loading">
            <el-table-column label="同步时间" prop="time" :formatter="dateFormat" width="180">
            </el-table-column>
            <el-table-column label="同步内容" prop="" width="120">
                <template slot-scope="scope">
                    <el-button size="small" @click="goToDetail(scope.row)">查看</el-button>
                </template>
            </el-table-column>
            <el-table-column label="单词数" prop="list" :formatter="formateSize" width="120">
            </el-table-column>
            <el-table-column label="同步方式" prop="type" :formatter="typeFormate" min-width="120">
            </el-table-column>
            <el-table-column label="操作人" prop="eSentence" min-width="120">
                <template slot-scope="scope">
                    <el-button size="small" @click="showOptionPeople(scope.row)" v-if="scope.row.type==='from_import'">
                        查看
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-col class="toolbar" :span="24">
            <el-upload
                    style="float:left"
                    class="avatar-uploader"
                    action="https://jsonplaceholder.typicode.com/posts/"
                    :show-file-list="false"
                    :before-upload="UploadJsonFile">
                <el-button>上传JSON文件</el-button>
            </el-upload>
            <el-pagination layout="prev, pager, next" @current-change="Init" :page-size="size"

                           :total="total" style="float:right;">
                <!--:current-page.sync="currentPage"-->
            </el-pagination>
        </el-col>
        <el-col class="toolbar" :span="24">
            <a class='el-button' href="/static/wordList.xlsx" download="单词上传模板"
               style="text-decoration-line: none">下载模板</a>
            <a href="https://www.bejson.com/json/col2json/" target="_blank">Excel转换json链接：https://www.bejson.com/json/col2json/</a>
        </el-col>
        <el-dialog title="详情" :visible.sync="currentDetailVisibility" width="60%">
            {{currentDetail}}
            <span slot="footer" class="dialog-footer">
                 <el-button @click="currentDetailVisibility = false">关 闭</el-button>
            </span>
        </el-dialog>
    </section>
</template>

<style scoped></style>

<script>
    import {trim, dateFormat} from '../../common/js/util';
    import {QueryWordList, UploadJsonFile, OptionHistory} from '../../api/api'

    export default {
        data() {
            return {
                appId: 'english',
                search: {
                    time: [new Date(new Date().getTime() - 518400000 - 518400000), new Date(new Date().getTime() + 100000000)],
                    chineseKeyWord: '',
                    EnglishKeyWord: ''
                },
                WordList: [],
                currentDetailVisibility: false,
                currentDetail: '',
                size: 10,
                total: 0,
                loading: false
            }
        },
        methods: {
            dateFormat: dateFormat,
            typeFormate(row, column, cellValue) {
                return {
                    from_init: '初始化导入',
                    from_video_list: '视频同步',
                    from_import: '手动导入',
                }[cellValue]
            },
            formateSize(row, column, cellValue) {
                return cellValue.length
            },
            showDetail(text) {
                this.currentDetail = text;
                this.currentDetailVisibility = true;
            },
            goToDetail(row) {
                var a = JSON.stringify(row)
                window.sessionStorage.setItem('key', a);
                this.$router.push({
//                    path: `/Order/RewardDetail/${id}/${scope.row.appreciateAmount}/${scope.row.appreciateCount}`,
                    path: `/Report/EnglishDetail/${row._id}`,
                })
            },
            Init(page = 1) {
                this.loading = true
                if (page === 1) console.log('查询')
                let para = {
                    startTime: new Date(this.search.time[0]).getTime(),
                    endTime: new Date(this.search.time[1]).getTime(),
                    appId: this.appId,
                    page: page - 1,
                    size: 10
                };
                if (trim(this.search.chineseKeyWord)) {
                    para.chineseKeyWord = trim(this.search.chineseKeyWord)
                }
                if (trim(this.search.EnglishKeyWord)) {
                    para.EnglishKeyWord = trim(this.search.EnglishKeyWord)
                }
                console.log('查询参数', para)
                QueryWordList(para).then(
                    data => {
                        console.log(data)
                        /* let cache = data.data
                         cache.map(x => {
                             this.WordList = this.WordList.concat(x.list)
                         })*/
                        this.WordList = data.data
                        this.total = data.total
                        this.loading = false
                    }
                ).catch(message => {
                    console.log(message)
                    this.loading = false
                })
            },
            /**
             * @return {boolean}
             */
            UploadJsonFile(file) {
                console.log(file)
                console.log(file.type)
                /* if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                     console.log('是excel文件')
                     this.$message.error('上传文件格式不正确')
                     return false;
                 } else if ((file.name).indexOf('.json') >= 0) {
                     console.log('是json文件')
                 }*/
                if ((file.name).indexOf('.json') === -1) {
                    this.$message.error('上传文件格式不正确');
                    return false;
                }
                let formDate = new FormData();
                formDate.append('file', file);
                UploadJsonFile(this.appId, formDate).then(data => {
                    console.log(data);
                    if (data._id) {
                        this.$message.success('上传json文件完成');
                        this.Init()
                    }
                }).catch(
                    message => {
                        this.$message.error('json文件上传失败，请检查上传文件内容是否正确')
                    }
                );
                return false
            },
            showOptionPeople(row) {
                this.$alert('这是一段内容', '标题名称', {
                    confirmButtonText: '取消',
                    callback: action => {
                        console.log('已经取消');
                    }
                });
                OptionHistory(row._id).then().catch()
            }
        },
        created() {
            this.Init()
        }
    };
</script>