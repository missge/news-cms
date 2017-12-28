<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.articleId" placeholder="输入id"></el-input>
				</el-form-item>
	
				<el-form-item>
					开始时间：
					<el-date-picker v-model="filters.startTime" type="date" placeholder="开始时间">
					</el-date-picker>
				</el-form-item>
				<el-form-item>
					结束时间：
					<el-date-picker v-model="filters.endTime" type="date" placeholder="结束时间">
					</el-date-picker>
				</el-form-item>
	
				<el-form-item>
					<el-button type="primary" v-on:click="getUsers">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>
	
		<!--列表-->
		<el-table :data="monitorList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="index" label="序号" width="80">
			</el-table-column>
			<el-table-column prop="articleId" label="视频id" width="180" >
			</el-table-column>
			 <el-table-column prop="videoUrl" label="视频url" min-width="240" >
				 <template slot-scope="scope">
					<el-tooltip class="item" effect="light" placement="top-end">
						<div slot="content"> 视频url：
							<br/> {{scope.row.videoUrl}} </div>
						<div class="sTitle"> {{scope.row.videoUrl}} </div>
					</el-tooltip>
				</template>
			</el-table-column> 
			<el-table-column prop="reportTime" label="上报时间" :formatter="dateFormat" width="150" >
			</el-table-column>
			<el-table-column prop="reportCount" label="该url的上报数量" width="180" >
			</el-table-column>
			<el-table-column label="详情" width="140">
				<template slot-scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">监控详情</el-button>
				</template>
			</el-table-column>
		</el-table>
	
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size" :total="total" style="float:right;">
			</el-pagination>
		</el-col>
	</section>
</template>

<script>
import util, { dateFormat } from '../../common/js/util';
import { getVideoReportList } from "../../api/api";

export default {
	data() {
		return {
			filters: {
				articleId: '',
				startTime: new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000)),
				endTime: new Date(),
			},
			monitorList: [],
			total: 0,
			page: 1,
			size: 10,
			listLoading: false,
			sels: [],//列表选中列

		}
	},
	methods: {
		//时间戳改成标准时间
		dateFormat: dateFormat,
		handleCurrentChange(val) {
			this.page = val;
			this.getUsers();
		},
		//获取用户列表
		getUsers() {
			let filters = {};
			for (let name in this.filters) {
				if (this.filters[name]) {
					filters[name] = this.filters[name];
					filters.startTime = new Date(this.filters.startTime).getTime();
					filters.endTime = new Date(this.filters.endTime).getTime();
				}
			};
			let para = {
				page: this.page -1,
				size: this.size,
				...filters
			};
			this.listLoading = true;
			getVideoReportList(para).then((data) => {

				this.total = data.total;
				this.monitorList = data.monitorList;
				this.listLoading = false;
			}).catch(message => {
				this.listLoading = false;
				this.$message.error(message);
			});
		},
		//显示编辑界面
		handleEdit: function (index, row) {

			this.$router.push(`/VideoReport/monitor/${row.articleId}`);
		},
		selsChange: function (sels) {
			this.sels = sels;
		}
	},
	mounted() {
		this.getUsers();
	}
}

</script>

<style scoped lang="scss">
.sTitle {
	width: 300px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	cursor: pointer
}
</style>