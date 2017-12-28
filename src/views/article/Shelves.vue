<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.articleId" placeholder="文章Id"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onShelves">上架</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="offShelves">下架</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </section>
</template>
<script>
import { changeShelvesOn, changeShelvesOff } from "../../api/api";
export default {
    data() {
        return {
            filters: {
                articleId: ''
            },
            changeLoading: false
        }
    },
    methods: {
        onShelves() {
            this.$confirm('确定上架吗?', '提示', {
                type: 'warning'
            }).then(() => {
                this.changeLoading = true;
                //NProgress.start();
                let articleId = this.filters.articleId;
                changeShelvesOn(articleId)
                    .then((res) => {
                        this.changeLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '上架成功',
                            type: 'success'
                        });
                    }).catch(message => {
                        this.changeLoading = false;
                        this.$message.error(message);
                    });
            }).catch(() => {

            });
        },
        offShelves() {
            this.$confirm('确定下架吗?', '提示', {
                type: 'warning'
            }).then(() => {
                this.changeLoading = true;
                //NProgress.start();
                let articleId = this.filters.articleId;
                changeShelvesOff(articleId)
                    .then((res) => {
                        this.changeLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '下架成功',
                            type: 'success'
                        });
                    }).catch(message => {
                        this.changeLoading = false;
                        this.$message.error(message);
                    });
            }).catch(() => {

            });
        }
    }
}
</script>
<style scoped>

</style>
