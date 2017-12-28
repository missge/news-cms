<!--Created by Goodluck 2017.11.13-->
<template>
    <section>
        <!--操作记录-->
        <!--&lt;!&ndash; {{operation_list}}-->
        <!--{{showOrhidden}}&ndash;&gt;-->

        <el-dialog title="操作记录" v-model="show">
            <el-table :data="list" highlight-current-row>
                <el-table-column prop="operationName" label="操作人" width="180"></el-table-column>
                <el-table-column prop="operationTime" label="操作时间" width="180"></el-table-column>
                <el-table-column prop="operationContent" label="操作内容" min-width="180"></el-table-column>
            </el-table>
            {{a}}
            <div slot="footer" class="dialog-footer">
                <el-button @click="show = false">关闭</el-button>
            </div>
        </el-dialog>
    </section>
</template>
<script>
    import {OptionHistory} from './../api/api'

    export default {
        data() {
            return {
                a: '',
                show: false,
                list: [
                    {
                        operationName: 111,
                        operationTime: 2222,
                        operationContent: '操作内容'
                    }
                ]
            }
        },
        methods: {
            /**
             * 父组件调用，展示操作记录
             * @param data
             * @param page
             */
            showOperation(data, page = "") {
                var entityKey = ''
                if (data) {
                    this.show = true;
                    this.a = data;
//                    console.log(data)
                }
//                console.log(page);
                if (page === 'AllReviewList') {
//                    console.log(data._id)
                    entityKey = data._id;
                }
                console.log(entityKey)
                OptionHistory(entityKey).then(
                    data => {
                        console.log(data)
                    }
                ).catch(
                    message => {
                        console.log(message)
                    }
                )
            }
        }

    };

</script>
<style>

</style>