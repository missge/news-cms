<template>
    <section style="width: 100%;height: 400px; margin-bottom: 10px">
        <div id="chart"></div>
    </section>
</template>
<script>

    import echarts from 'echarts'

    export default {
        props: ['chartdata', 'xLabel', 'yLabel', 'Two'],
        data() {
            return {
                msg: '图表',
                XLabel: '',
                YLabel: '',
                dat: {},
                loading: true
            }
        },
        methods: {
            Init() {
                this.XLabel = this.xLabel;
                this.YLabel = this.yLabel;
                this.dat = JSON.parse(JSON.stringify(this.chartdata));
                this.drawPie('chart')
                window.aaa = this.dat
            },
            getX() {
                console.log('有两条线', this.Two);
                var c = (this.Two) ? this.dat[0] : this.dat
                if (c instanceof Array)
                    return c.map(x => {
                        return x.x
                    })
            },
            getY(index = 0) {
                var c = (this.Two) ? this.dat[index] : this.dat
                window.c = c;
                if (c instanceof Array)
                    return c.map(x => {
                        return x.y
                    })
            },
            getLabel(index = 0) {
                if (this.Two)
                    return index === 0 ? '今天' : '昨天'
                else
                    return this.YLabel
            },
            getLegend() {
                if (this.Two)
                    return ['今天', '昨天']
            },
            drawPie(id) {
                if (!this.chart)
                    this.chart = echarts.init(document.getElementById(id));
                var option = {
                    title: {
//                        text: '折线图',
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    legend: {
                        type: 'plain',
                        right: '20',
                        orient: 'vertical',
                        top: '20',
                        data: this.getLegend()
                    },
                    //右上角工具条
//                    toolbox: {
//                        show: true,
//                        feature: {
//                            mark: {
//                                show: true
//                            },
//                            dataView: {
//                                show: true,
//                                readOnly: false
//                            },
//                            magicType: {
//                                show: true, type: ['line', 'bar']
//                            },
//                            restore: {
//                                show: true
//                            },
//                            saveAsImage: {
//                                show: true
//                            }
//                        }
//                    }
//                    ,
                    calculable: true,
                    xAxis: [
                        {
                            name: this.XLabel,
                            nameLocation: 'end',
                            type: 'category',
                            boundaryGap: false,
                            data:
                                this.getX()
                        }
                    ],
                    yAxis: [
                        {
                            name: this.YLabel,
                            nameLocation: 'end',
                            type: 'value',
                            axisLabel: {
                                formatter: '{value}'
                            },
                            min: function () {
                                return 0;
                            }
                        }
                    ],
                    series:
                        [
                            {
                                name: this.getLabel(),
                                type: 'line',
                                data: this.getY(),
                                markPoint: {
                                    data: [
                                        {type: 'max', name: '最大值'},
                                        {type: 'min', name: '最小值'}
                                    ]
                                }
                            },
                            {
                                name: this.getLabel(1),
                                type: 'line',
                                data: this.getY(1),
                                markPoint: {
                                    data: [
                                        {type: 'max', name: '最大值'},
                                        {type: 'min', name: '最小值'}
                                    ]
                                }
                            }
                        ]
                };
                this.chart.setOption(option)
            }
        },
        watch: {
            chartdata() {
                console.log('更新图表')
                this.Init()
            }
        },
        mounted() {
            this.Init()
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