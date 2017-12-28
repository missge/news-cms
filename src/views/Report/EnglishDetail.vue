<template>
    <section>
        <el-col class="toolbar" :span="24">

            <el-button type="primary" size="small" @click="gaoBack" style="float:right">
                返回上一级
            </el-button>
            <el-form :inline="true" :model="search">
                <el-form-item>
                    <el-input v-model="search.chineseKeyWord" placeholder="中文查找"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="search.EnglishKeyWord" placeholder="英文查找"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="Init()">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <el-table :data="WordList" style="width: 100%">
            <el-table-column label="id" prop="id" width="100">
            </el-table-column>
            <el-table-column label="中文" prop="cName" width="140">
            </el-table-column>
            <el-table-column label="英文" prop="eName" width="140">
            </el-table-column>
            <el-table-column label="中文例句" prop="cSentence" min-width="120">
            </el-table-column>
            <el-table-column label="英文例句" prop="eSentence" min-width="120">
            </el-table-column>
            <el-table-column label="背景" prop="BackGround" width="100">
                <template slot-scope="scope">
                    <el-button size="small" @click="showDetail(scope.row.BackGround)">查看</el-button>
                </template>
            </el-table-column>
            <el-table-column label="示例" prop="note" min-width="100">
                <template slot-scope="scope">
                    <el-button size="small" @click="showDetail(scope.row.note)">查看</el-button>
                </template>
            </el-table-column>
            <el-table-column label="视频链接" prop="videoUrl" min-width="120">
            </el-table-column>
            <el-table-column label="视频背景图" prop="videopicUrl" min-width="120">
            </el-table-column>
        </el-table>
        <el-col class="toolbar" :span="24">
            <el-pagination layout="prev, pager, next" @current-change="Init" :page-size="size"

                           :total="total" style="float:right;">
                <!--:current-page.sync="currentPage"-->
            </el-pagination>
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

    export default {
        data() {
            return {
                search: {
                    chineseKeyWord: '',
                    EnglishKeyWord: ''
                },
                WordList: [],
                WordListAll: [],
                currentDetailVisibility: false,
                currentDetail: '',
                size: 10,
                total: 0
            }
        },
        methods: {
            showDetail(text) {
                this.currentDetail = text;
                this.currentDetailVisibility = true;
            },
            Init(page = 1) {
                if (trim(this.search.chineseKeyWord)) {
                    this.WordList = this.WordListAll.filter((x) => {
                        return x.cName === trim(this.search.chineseKeyWord)
                    });
                } else if (trim(this.search.EnglishKeyWord)) {
                    this.WordList = this.WordListAll.filter((x) => {
                        return x.eName === trim(this.search.EnglishKeyWord)
                    });
                } else {
                    this.WordList = this.WordListAll
                }
                this.WordList = this.WordList.slice(10 * (page - 1), 10 * page)
            },
            gaoBack() {
                this.$router.push('/Report/English')
            }
        },
        mounted() {
            this.list_id = this.$route.params.id;
            this.WordListAll = JSON.parse(window.sessionStorage.getItem('key')).list;
            this.total = this.WordListAll.length
            this.Init();
        }
    };
</script>