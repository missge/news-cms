<template>
    <div class="main_content">
        <div id="chart"></div>
    </div>
</template>
<script>
    import echarts from 'echarts'

    export default {
        props: ['chartdata', 'xLabel', 'yLabel', 'Two'],
        data() {
            return {
                dat: [],
                XLabel: '',
                YLabel: '',
            }
        },
        methods: {
            getSeries() {
                var cache = [];
                return this.dat.map(x => {
                    return {
                        name: x.columnName,
                        type: 'bar',
                        stack: '总量',
                        label: {
                            normal: {
                                show: true,
                                position: 'insideRight'
                            }
                        },
                        data: [x.flushCount, x.readCount, x.collectCount, x.shareCount, x.subscribeCount, x.fagaoCount]
                    }
                })
            },
            getXAxisLabel() {
                return ['栏目浏览量', '文章阅读量', '收藏量', '转发量', '订阅量', '发稿量']
            },
            getLegend() {
                return this.dat.map(x => x.columnName)
            },
            drawPie(id) {
                this.chart = echarts.init(document.getElementById(id))
                var option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'line'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    legend: {
                        type: 'scroll',
                        data: this.getLegend()
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    yAxis: {
                        type: 'value',
                        name: this.YLabel,
                        nameLocation: 'end',
                    },
                    xAxis: {
                        name: this.XLabel,
                        nameLocation: 'center',
                        type: 'category',
                        data: this.getXAxisLabel()
                    },
                    series: this.getSeries()
                };
                this.chart.setOption(option)
            }
            ,
            Init() {
                if (this.chartdata) this.dat = JSON.parse(JSON.stringify(this.chartdata));
                console.log(1111111111111, this.chartdata)
                this.XLabel = this.xLabel;
                this.YLabel = this.yLabel;
                window.asd = this.dat;
                this.drawPie('chart')
            }
        },
        watch: {
            chartdata() {
                this.Init()
            }
        }
        ,
        mounted() {
            this.Init();
        }
    }
</script>
<style scoped>
    #chart {
        position: relative;
        left: 50%;
        margin-left: -400px;
        margin-bottom: 70px;
        width: 800px;
        height: 400px;
        /*border: solid #D01257 1px;*/
        /*box-shadow: 0 0 8px #FB90B7;*/
        /*border-radius: 10px;*/
    }
</style>
