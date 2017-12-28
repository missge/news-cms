<template>
  <section>
    <!--列表-->
    <el-table :data="groupList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
      <el-table-column type="index" label="序号" width="70">
      </el-table-column>
      <el-table-column prop="groupName" label="权限组名称" min-width="180" >
      </el-table-column>
      <el-table-column prop="groupId" label="权限组Id" min-width="150" >
      </el-table-column>
      <el-table-column prop="groupInstruction" label="权限组简介" min-width="140" >
      </el-table-column>
      <el-table-column label="详情" min-width="180">
        <template slot-scope="scope">
          <el-button @click="handleResource(scope.$index, scope.row)">查询群组资源</el-button>
          <el-button @click="handleEdit(scope.$index, scope.row)">查看</el-button>
          <!-- <el-button @click="handleDel(scope.$index, scope.row)">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button @click.native="batchRemove" :disabled="this.sels.length===0" :loading="listLoading">删除</el-button>
    </el-col>
    <!--资源界面-->
    <el-dialog title="资源" v-model="resourceFormVisible" :close-on-click-modal="false">
      <el-table :data="resourceList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
        <el-table-column prop="resourceName" label="资源名称" min-width="140" sortable>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-form-item prop="groupId" label="权限组Id">
          <el-input v-model="editForm.groupId"></el-input>
        </el-form-item>
        <el-form-item prop="groupName" label="权限组名称">
          <el-input v-model="editForm.groupName"></el-input>
        </el-form-item>
        <el-form-item prop="groupInstruction" label="权限组简介">
          <el-input v-model="editForm.groupInstruction"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
        <el-form-item label="权限组名称" prop="groupName">
          <el-input v-model="addForm.groupName" auto-complete="off" placeholder="单行输入"></el-input>
        </el-form-item>
        <el-form-item label="权限简介" prop="groupInstruction">
          <el-input v-model="addForm.groupInstruction" auto-complete="off" placeholder="单行输入"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">添加</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import util, { dateFormat } from '../../common/js/util';
import { getGroupList, addGroup, updateGroup, delGroup, assignGroup, assignResources, searchGroupId } from "../../api/api";
import md5 from 'blueimp-md5';

export default {
  data() {
    return {
      resourceList: [],
      uname: "",
      filters: {
        userId: '',
        userName: ''
      },
      groupList: [],
      total: 0,
      page: 0,
      size: 10,
      listLoading: false,
      sels: [],//列表选中列

      resourceFormVisible: false,//群组资源
      resourceLoading: false,
      resourceFormRules: {
        userName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ]
      },
      //群组资源
      resourceForm: {

      },

      editFormVisible: false,//编辑界面是否显示
      editLoading: false,
      editFormRules: {
        userName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ]
      },
      //编辑界面数据
      editForm: {
        groupId: '',
        groupName: "",
        groupInstruction: "",
      },

      addFormVisible: false,//新增界面是否显示
      addLoading: false,
      addFormRules: {
        userName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
      },
      //新增界面数据
      addForm: {
        groupName: "",
        groupInstruction: "",
      }

    }
  },
  methods: {
    dateFormat: dateFormat,
    //性别显示转换
    handleCurrentChange(val) {
      this.page = val;
      this.getUsers();
    },
    //获取用户列表
    getUsers() {
      //筛选
      let filters = {};
      for (let name in this.filters) {
        if (this.filters[name]) {
          filters[name] = this.filters[name];
        }
      }
      let para = {
        page: this.page,
        size: this.size,
        ...filters
      };
      this.listLoading = true;
      //NProgress.start();
      getGroupList(para).then((data) => {
        this.total = data.total;
        // this.total = 100;
        this.groupList = data.groupList;
        this.listLoading = false;
        //NProgress.done();

      }).catch(message => {
        this.listLoading = false;
        this.$message.error(message);
      });
    },
    //删除
    handleDel: function(index, row) {
      this.$confirm('确认删除该群组吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        let para = { groupIds: row.groupId };
        delGroup(para).then((res) => {
          this.listLoading = false;
          //NProgress.done();
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.getUsers();
        });
      }).catch(() => {

      });
    },
    //显示群组资源界面
    handleResource: function(index, row) {
      this.resourceFormVisible = true;
      this.resourceForm = {

      };
      this.getGroupRS(row.groupId);
    },
    getGroupRS(groupId) {
      let para = {
        page: this.page,
        size: this.size,
      };
      this.listLoading = true;

      searchGroupId(groupId, para).then((data) => {
        this.total = data.total;
        this.resourceList = data.resourceList;
        this.listLoading = false;
        //NProgress.done();

      }).catch(message => {
        this.listLoading = false;
        this.$message.error(message);
      });
    },
    //显示编辑界面
    handleEdit: function(index, row) {
      this.editFormVisible = true;
      this.editForm = {
        groupId: row.groupId,
        groupName: row.groupName,
        groupInstruction: row.groupInstruction,
      };
    },
    //显示新增界面
    handleAdd: function() {
      this.addFormVisible = true;
      this.addForm = {
        groupName: "",
        groupInstruction: "",
      };
    },
    //编辑
    editSubmit: function() {
      this.$refs.editForm.validate((valid) => {

        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true;

            let para = Object.assign({}, this.editForm);

            updateGroup(para).then((res) => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              });
              this.$refs['editForm'].resetFields();
              this.editFormVisible = false;
              this.getUsers();
            }).catch((message) => {
              this.$confirm('请输入完整信息', '提示')
              this.editLoading = false;
              this.$message.error(message);
            });
          });

        }
      });
    },
    //新增
    addSubmit: function() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {

          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.addLoading = true;
            //NProgress.start();

            let para = Object.assign({}, this.addForm);

            addGroup(para).then((res) => {
              this.addLoading = false;
              //NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              });
              this.$refs['addForm'].resetFields();
              this.addFormVisible = false;
              this.getUsers();
            });
          });
        }
      });
    },
    selsChange: function(sels) {
      this.sels = sels;
    },
    //批量删除
    batchRemove: function() {
      var userIds = this.sels.map(item => item.groupId).toString();
      var ids = userIds.split(",")
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();
        let para = { groupIds: ids };
        delBackStageUser(para).then((res) => {
          this.listLoading = false;
          //NProgress.done();
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.getUsers();
        });
      }).catch(() => {

      });
    }
  },
  mounted() {
    this.getUsers();
  }
}

</script>

<style scoped lang="scss">
.sTitle {
  width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer
}
</style>