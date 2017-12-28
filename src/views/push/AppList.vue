<template>
    <section>
        <!--工具条-->
        <!--<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <template>
                    <el-select v-model="filters.appId" placeholder="请选择应用">
                        <el-option v-for="item in newTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <el-form-item>
                    <el-input v-model="filters.userName" placeholder="查询内容"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getUsers">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>-->
        <!--列表-->
        <el-table :data="list" highlight-current-row v-loading="listLoading" @current-change="SelectOneItem"
                  style="width: 100%;">
            <!--<el-table-column type="selection" width="55">-->
            <!--</el-table-column>-->
            <el-table-column prop="appName" label="应用名称" width="140">
            </el-table-column>
            <el-table-column prop="appID" label="AppID" width="140">
            </el-table-column>
            <el-table-column prop="appCode" label="appCode" width="140">
            </el-table-column>
            <el-table-column prop="" label="图标" width="100">
                <template slot-scope="scope">
                    <!--{{ getImageUrl(scope.row.currentMongooseDocument.imageUrl)}}-->
                    <img :src="getImageUrl(scope.row.imageUrl)"
                         width="55" height="55" style="margin-top: 5px">
                </template>
            </el-table-column>
            <el-table-column prop="systemType" label="系统类型" width="140">
            </el-table-column>
            <el-table-column prop="" label="应用状态" width="100">
                <template slot-scope="scope">
                    <span v-if="scope.row.isTop">上架</span>
                    <span v-else style="color: red">下架</span>
                </template>
            </el-table-column>
            <!--<el-table-column prop="email" label="下载" width="100">-->
            <!--<template slot-scope="scope">-->
            <!--<el-button size="small" @click="download">下载</el-button>-->
            <!--</template>-->
            <!--</el-table-column>-->

            <el-table-column label="详情" width="160">
                <template slot-scope="scope">
                    <!--<el-button size="small" @click="handleInfo(scope.$index, scope.row)"><span-->
                    <!--v-if="!!scope.row.onLine">修改</span>/查看-->
                    <!--</el-button>-->
                    <!--<el-button size="small" @click="handleDel(scope.$index, scope.row)" v-if="!scope.row.onLine">上架-->
                    <!--</el-button>-->
                    <el-button size="small" v-if="!scope.row.isTop" @click.stop="option(scope,2)">修改</el-button>
                    <el-button size="small" v-if="scope.row.isTop" @click.stop="option(scope,4)"> 查看</el-button>
                    <el-button size="small" v-if="!scope.row.isTop" @click.stop="option(scope,1)">上架</el-button>
                    <el-button size="small" v-if="scope.row.isTop" @click.stop="option(scope,3)">下架</el-button>
                </template>
            </el-table-column>

            <el-table-column prop="updateTime" :formatter="dateFormat" label="创建时间" width="170">
            </el-table-column>
            <!--<el-table-column prop="operator_name" label="操作员" min-width="140" sortable>
            </el-table-column>-->
            <el-table-column prop="operator_name" label="操作记录" min-width="100">
                <template slot-scope="scope">
                    <el-button size="small" @click="showHistory(scope)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="danger" @click="RemoveOneItem" :disabled="this.sels.length===0">删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面新-->
        <el-dialog :title="editTitle" v-model="editFormVisible" :close-on-click-modal="false" @close="clearForm">
            <!--{{editForm}}-->
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <el-form-item prop="appName" label="App名称：">
                    <el-input v-model="editForm.appName" placeholder="App名称" :disabled="editReadonly"></el-input>
                </el-form-item>
                <el-form-item prop="appName" label="AppID：">
                    <el-input v-model="editForm.appID" placeholder="AppID" disabled></el-input>
                </el-form-item>
                <el-form-item prop="appName" label="AppCode：">
                    <el-input v-model="editForm.appCode" placeholder="AppCode" :disabled="editReadonly"></el-input>
                </el-form-item>
                <el-form-item prop="appDescription" label="应用描述：">
                    <el-input type="textarea" :rows="4" v-model="editForm.appDescription" placeholder="应用描述"
                              :disabled="editReadonly"></el-input>
                </el-form-item>
                <!--{{systemList}}-->
                <el-form-item label="应用类型">
                    <el-checkbox-group v-model="systemList" :disabled="editReadonly">
                        <el-checkbox label="ios" :disabled="editReadonly">ios</el-checkbox>
                        <el-checkbox label="android" :disabled="editReadonly">安卓</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <el-form-item prop="" label="应用icon：">
                    <el-upload class="avatar-uploader" action="http://m.feawin.com/newchina/api/app/addApp"
                               :show-file-list="false" :on-success="handleAvatarSuccess" :disabled="editReadonly"
                               :before-upload="UploadFileIcon2">
                        <img v-if="currentEditImgUrl" :src="currentEditImgUrl" class="avatar">
                        <i v-else class="el-icon-plus
                    avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>

                <!--{{editForm.huawei_push_appSecret}}-->
                <template v-if="this.systemList[0] == 'ios'||this.systemList[1] == 'ios'">
                    <div class="android-ios-container">
                        <el-form-item label-width="0">
                            <el-input type="textarea" :rows="4" autosize v-model="editForm.apnIDs"
                                      placeholder="Ios设备白名单，格式：设备名，设备ID；" :disabled="editReadonly"></el-input>
                        </el-form-item>
                        <el-form-item prop="bundleID" label-width="0">
                            <el-input v-model="editForm.bundleID" placeholder="bundleID"
                                      :disabled="editReadonly"></el-input>
                        </el-form-item>
                        <!--<h3>证书</h3>
                        <el-form-item label-width="0">
                            <fieldset class="dev">
                                <legend>dev</legend>
                                <el-upload
                                        class="avatar-uploader certificate"
                                        action="https://jsonplaceholder.typicode.com/posts/"
                                        :show-file-list="false" :on-success="handleAvatarSuccess"
                                        :before-upload="UploadFileTestCert2" :disabled="editReadonly">
                                    <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                    <i v-else class="el-icon-plus
                avatar-uploader-icon">{{test_cert_pem_name}}</i>
                                </el-upload>
                                <el-upload
                                        class="avatar-uploader certificate"
                                        action="https://jsonplaceholder.typicode.com/posts/"
                                        :show-file-list="false" :on-success="handleAvatarSuccess"
                                        :before-upload="UploadFileTestKey2" :disabled="editReadonly">
                                    <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                    <i v-else class="el-icon-plus
                avatar-uploader-icon">{{test_key_pem_name}}</i>
                                </el-upload>
                            </fieldset>
                            <fieldset class="pro">
                                <legend>pro</legend>
                                <el-upload
                                        class="avatar-uploader certificate"
                                        action="https://jsonplaceholder.typicode.com/posts/"
                                        :show-file-list="false" :on-success="handleAvatarSuccess"
                                        :before-upload="UploadFileCert2" :disabled="editReadonly">
                                    <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                    <i v-else class="el-icon-plus
                                    avatar-uploader-icon">{{cert_pem_name}}</i>
                                </el-upload>
                                <el-upload
                                        class="avatar-uploader certificate"
                                        action="https://jsonplaceholder.typicode.com/posts/"
                                        :show-file-list="false" :on-success="handleAvatarSuccess"
                                        :before-upload="UploadFileKey2" :disabled="editReadonly">
                                    <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                    <i v-else class="el-icon-plus
                avatar-uploader-icon">{{key_pem_name}}</i>
                                </el-upload>
                            </fieldset>
                        </el-form-item>-->
                    </div>
                </template>
                <template v-if="this.systemList[0] == 'android'||this.systemList[1] == 'android'">
                    <div class="android-ios-container">
                        <el-form-item prop="" label="" label-width="0">
                            <el-input type="textarea" :rows="4" v-model="editForm.mqttIDs"
                                      placeholder="Android设备白名单，格式：设备名，设备ID；" :disabled="editReadonly"></el-input>
                        </el-form-item>
                        <el-form-item prop="" label-width="0">
                            <div class="android-key-container">
                                <el-input class="key-item" v-model="editForm.packageName" placeholder="应用包名"
                                          :disabled="editReadonly"></el-input>
                                <el-input class="key-item" v-model="editForm.xiaomi_push_appSecret"
                                          placeholder="小米key" :disabled="editReadonly"></el-input>
                            </div>
                            <div class="android-key-container">
                                <el-input class="key-item" v-model="editForm.huawei_push_appSecret.client_id"
                                          placeholder="华为id" :disabled="editReadonly"></el-input>
                                <el-input class="key-item" v-model="editForm.huawei_push_appSecret.client_secret"
                                          placeholder="华为key" :disabled="editReadonly"></el-input>
                            </div>
                        </el-form-item>
                    </div>
                </template>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button v-if="!editReadonly" @click.native="editFormVisible = false">取消</el-button>
                <el-button v-if="!editReadonly" type="primary" @click.native="editSubmit" :loading="editLoading">提交
                </el-button>
                <el-button v-if="editReadonly" @click.native="editFormVisible = false">关闭</el-button>
            </div>
        </el-dialog>
        <!--新增界面-->
        <el-dialog title="添加App" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form enctype="multipart/form-data" :model="addForm" label-width="100px" :rules="addFormRules"
                     ref="addForm">
                <el-form-item prop="" label="App名称：">
                    <el-input v-model="addForm.appName" placeholder="App名称"></el-input>
                </el-form-item>
                <el-form-item prop="" label="AppID：">
                    <el-input v-model="addForm.appID" placeholder="AppID"></el-input>
                </el-form-item>
                <el-form-item prop="" label="AppCode：">
                    <el-input v-model="addForm.appCode" placeholder="AppCode"></el-input>
                </el-form-item>
                <el-form-item prop="" label="应用描述：">
                    <el-input type="textarea" :rows="4" v-model="addForm.appDescription" placeholder="应用描述"></el-input>
                </el-form-item>
                <el-form-item label="应用类型">
                    <el-checkbox-group v-model="addForm.systemType">
                        <el-checkbox label="ios">IOS</el-checkbox>
                        <el-checkbox label="android">Android</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <el-form-item prop="" label="应用icon：">
                    <el-upload class="avatar-uploader" action="https://jsonplaceholder.typicode.com/posts/"
                               :show-file-list="false" :on-success="handleAvatarSuccess"
                               :before-upload="UploadFileIcon">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus
                    avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
                <template v-if="addForm.systemType.contains('ios')">
                    <div class="android-ios-container">
                        <el-form-item prop="" label-width="0" required>
                            <el-input type="textarea" v-model="addForm.apnIDs"
                                      placeholder="Ios设备白名单，格式：设备名，设备ID；"></el-input>
                        </el-form-item>
                        <el-form-item prop="" label-width="0">
                            <el-input v-model="addForm.bundleID" placeholder="bundleID"></el-input>
                        </el-form-item>
                        <!--  <h3>证书</h3>
                          <el-form-item prop="" label-width="0">
                              <fieldset class="dev">
                                  <legend>dev</legend>
                                  <el-upload
                                          class="avatar-uploader certificate"
                                          action="https://jsonplaceholder.typicode.com/posts/"
                                          :show-file-list="false" :on-success="handleAvatarSuccess"
                                          :before-upload="UploadFileTestCert">
                                      <img v-if="false" :src="imageUrl" class="avatar">
                                      <i v-else class="el-icon-plus
                  avatar-uploader-icon"></i>
                                  </el-upload>
                                  <el-upload
                                          class="avatar-uploader certificate"
                                          action="https://jsonplaceholder.typicode.com/posts/"
                                          :show-file-list="false" :on-success="handleAvatarSuccess"
                                          :before-upload="UploadFileTestKey">
                                      <img v-if="false" :src="imageUrl" class="avatar">
                                      <i v-else class="el-icon-plus
                  avatar-uploader-icon"></i>
                                  </el-upload>
                              </fieldset>
                              <fieldset class="pro">
                                  <legend>pro</legend>
                                  <el-upload
                                          class="avatar-uploader certificate"
                                          action="https://jsonplaceholder.typicode.com/posts/"
                                          :show-file-list="false" :on-success="handleAvatarSuccess"
                                          :before-upload="UploadFileCert">
                                      <img v-if="false" :src="imageUrl" class="avatar">
                                      <i v-else class="el-icon-plus
                  avatar-uploader-icon"></i>
                                  </el-upload>
                                  <el-upload
                                          class="avatar-uploader certificate"
                                          action="https://jsonplaceholder.typicode.com/posts/"
                                          :show-file-list="false" :on-success="handleAvatarSuccess"
                                          :before-upload="UploadFileKey">
                                      <img v-if="false" :src="imageUrl" class="avatar">
                                      <i v-else class="el-icon-plus
                  avatar-uploader-icon"></i>
                                  </el-upload>
                              </fieldset>
                          </el-form-item>-->
                    </div>
                </template>
                <template v-if="addForm.systemType.contains('android')">
                    <div class="android-ios-container">
                        <el-form-item prop="" label="" label-width="0" required>
                            <el-input type="textarea" v-model="addForm.mqttlDs"
                                      placeholder="Android设备白名单，格式：设备名，设备ID；"></el-input>
                        </el-form-item>
                        <el-form-item prop="" label-width="0">
                            <div class="android-key-container">
                                <el-input class="key-item" v-model="addForm.packageName" placeholder="应用包名"></el-input>
                                <el-input class="key-item" v-model="addForm.xiaomi_push_appSecret"
                                          placeholder="小米key"></el-input>
                            </div>
                            <div class="android-key-container">
                                <el-input class="key-item" v-model="addForm.huawei_push_client_id"
                                          placeholder="华为id"></el-input>
                                <el-input class="key-item" v-model="addForm.huawei_push_client_secret"
                                          placeholder="华为key"></el-input>
                            </div>
                        </el-form-item>
                    </div>
                </template>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">添加</el-button>
            </div>
        </el-dialog>
        <!--操作记录弹框-->
        <operationRecord ref="operhis"></operationRecord>

    </section>
</template>

<script>
    import util, {dateFormat} from '../../common/js/util';
    import axios from 'axios';
    //import NProgress from 'nprogress'
    import {removeUser, batchRemoveUser, editUser, addUser} from '../../api/api';
    import {getAppList, addApp, getAppInfo, updateAppInfo, deleteApp} from "../../api/api";
    import {editBackStageUser} from "../../api/api";
    //moment.js库
    import moment from 'moment';
    import md5 from 'blueimp-md5';
    //组件引入
    import operationRecord from '../../components/OperationRrecord'

    export default {
        components: {operationRecord},
        data() {
            return {
                showDoHistory: false,
                hostname: '',
                apptype: "ios",
                newTypeOptions: [{
                    value: '1501141078',
                    label: 'AppId'
                }, {
                    value: '1481620977745',
                    label: '应用类型'
                }],
                value: '',
                uname: "",
                filters: {
                    userId: '',
                    userName: ''
                },
                list: [],
                infoList: [],
                total: 0,
                page: 0,
                size: 10,
                listLoading: false,
                sels: [],//列表选中列
                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                editForm: {
                    appCode: '',
                    appID: "",
                    appName: "",
                    systemType: "",
                    appDescription: "",
                    bundleID: "",
                    operator_name: "",
                    apnIDs: "",
                    xiaomi_push_appSecret: "",
                    huawei_push_client_id: "",
                    mqttlDs: "",
                    test_cert_pem: "",
                    test_key_pem: "",
                    cert_pem: "",
                    key_pem: "",
                    packageName: "",
                    logo_png: "",
                    huawei_push_appSecret: {
                        client_id: '',
                        client_secret: ''
                    }
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    userName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ],
                },
                //应用添加数据
                addForm: {
                    appCode: '',
                    appID: "",
                    appName: "", //应用名称
                    systemType: [],  //应用类型可为ios，android，通用ios&android
                    appDescription: "",  //描述
                    bundleID: "",
                    operator_name: "",  //操作员
                    apnIDs: "",  //ios白名单，格式：设备名:设备ID;
                    xiaomi_push_appSecret: "",  //小米推送key
                    huawei_push_client_id: "",
                    huawei_push_client_secret: '',
                    mqttlDs: "",  //android白名单，格式：设备名:设备ID;
                    test_cert_pem: null,
                    test_key_pem: null,   //ios测试证书
                    cert_pem: null,
                    key_pem: null,    //ios发布证书
                    packageName: "",   //android包名
                    logo_png: null //应用icon ：file
                },
                imageUrl: "",
                infoId: "",
                systemList: [],
                apnIDsShow: "",
                mqttlDsShow: "",
                currentEditImgUrl: '',
                test_cert_pem_name: "",
                test_key_pem_name: "",
                cert_pem_name: "",
                key_pem_name: "",
                editReadonly: false,
                editTitle: ''
            }
        },
        methods: {
            /*展示操作记录*/
            showHistory(scope) {
                this.$refs.operhis.showOperation(scope.row)
            },
            clearForm() {
                console.log('clear form value')
                this.editForm = {
                    appID: "",
                    appName: "",
                    systemType: "",
                    appDescription: "",
                    bundleID: "",
                    operator_name: "",
                    apnIDs: "",
                    xiaomi_push_appSecret: "",
                    huawei_push_client_id: "",
                    mqttlDs: "",
                    test_cert_pem: "",
                    test_key_pem: "",
                    cert_pem: "",
                    key_pem: "",
                    packageName: "",
                    logo_png: "",
                    huawei_push_appSecret: {
                        client_id: '',
                        client_secret: ''
                    }
                }
            },
            handlePreview() {
            },
            handleRemove() {
            },
            handleInfo(index, row) {
                this.infoId = row.currentMongooseDocument.appID;
                console.log(this.infoId)
                this.getAppInfos();
            },
            getAppInfos() {
                //筛选
                let para = {
                    appID: this.infoId
                };
                this.listLoading = true;
                //NProgress.start();
                getAppInfo(para).then((data) => {

                    console.log("----------");
                    console.log(data);
                    console.log("----------");

                    // this.total = data.count;
                    // this.total = 100;
                    this.infoList = data.instance;
                    this.listLoading = false;
                    //NProgress.done();
                    this.handleEdit();
                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            getAds(value) {
                this.addForm.systemType = value;
                this.apptype = value;
            },
            handleAvatarSuccess(res, file) {
                this.imageUrl = URL.createObjectURL(file.raw);
            },
            beforeAvatarUpload(file) {
                this.addForm.test_cert_pem = file;
                return false;
            },
            dateFormat: dateFormat,
            handleCurrentChange(val) {
                this.page = val;
                this.getUsers();
            },
            //获取应用列表
            getUsers() {
                //筛选
                let filters = {};
                for (let name in this.filters) {
                    if (this.filters[name]) {
                        filters[name] = this.filters[name];
                    }
                }
                let para = {
                    skip: 0 + (this.page - 1) * 10,
                    limit: this.size,
                    ...filters
                };
                this.listLoading = true;
                //NProgress.start();
                getAppList(para).then((data) => {

                    console.log("----------");
                    console.log(data);
                    console.log("----------");

                    this.total = data.count;
                    // this.total = 100;
                    this.list = data.list;
                    this.listLoading = false;
                    //NProgress.done();

                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该用户吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {targetUserId: row.userId};
                    deleteApp(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {
                    this.listLoading = false;
                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = {
                    appID: this.infoList.appID,
                    appName: this.infoList.appName,
                    systemType: this.infoList.systemType,
                    appDescription: this.infoList.appDescription,
                    bundleID: this.infoList.bundleID,
                    operator_name: this.infoList.operator_name,
                    apnIDs: this.infoList.apnIDs,
                    mqttIDs: this.infoList.mqttIDs,
                    xiaomi_push_appSecret: this.infoList.xiaomi_push_appSecret,
                    huawei_push_appSecret: {
                        client_id: this.infoList.huawei_push_appSecret.client_id,
                        client_secret: this.infoList.huawei_push_appSecret.client_secret
                    },
                    mqttlDs: this.infoList.mqttlDs,
                    test_cert_pem: this.infoList.test_cert_pem,
                    test_key_pem: this.infoList.test_key_pem,
                    cert_pem: this.infoList.cert_pem,
                    key_pem: this.infoList.key_pem,
                    packageName: this.infoList.packageName,
                    logo_png: this.infoList.logo_png
                };
                this.systemList = this.infoList.systemType.split("&");
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    appID: "",
                    appName: "",
                    systemType: [],
                    appDescription: "",
                    bundleID: "",
                    operator_name: "",
                    apnIDs: "",
                    xiaomi_push_appSecret: "",
                    huawei_push_client_id: "",
                    mqttlDs: "",
                    test_cert_pem: "",
                    test_key_pem: "",
                    cert_pem: "",
                    key_pem: "",
                    packageName: "",
                    logo_png: ""
                };
            },
            //编辑
            editSubmit: function () {
                this.$confirm('保存对应用的修改？', '提示', {}).then(() => {
//                    this.editLoading = true;
                    let para = Object.assign({}, this.editForm);
                    para.huawei_push_client_id = para.huawei_push_appSecret.client_id;
                    para.huawei_push_client_secret = para.huawei_push_appSecret.client_secret;
                    para.operator_name = window.localStorage.getItem('username');
                    para.systemType = this.systemList.join('&')

                    console.log(para)
//                    return
                    let formData = new FormData();
                    formData.append("logo_png", this.editForm.logo_png);
                    formData.append("appName", para.appName);
                    formData.append("systemType", para.systemType);
                    formData.append("appDescription", para.appDescription);
                    formData.append("packageName", para.packageName);
                    formData.append("bundleID", para.bundleID);
                    formData.append("operator_name", para.operator_name);
                    formData.append("apnIDs", para.apnIDs);
                    formData.append("appCode", para.appCode);
                    formData.append("mqttIDs", para.mqttIDs);
                    formData.append("huawei_push_appSecret", {
                        client_id: para.huawei_push_appSecret.client_id,
                        client_secret: para.huawei_push_appSecret.client_secret
                    })
                    formData.append("huawei_push_client_id", para.huawei_push_client_id);
                    formData.append("huawei_push_client_secret", para.huawei_push_client_secret);
                    formData.append("appID", para.appID);
                    formData.append("cert_pem", para.cert_pem);
                    formData.append("key_pem", para.key_pem);
                    formData.append("test_cert_pem", para.test_cert_pem);
                    formData.append("test_key_pem", para.test_key_pem);
                    formData.append("xiaomi_push_appSecret", para.xiaomi_push_appSecret);

                    updateAppInfo(formData).then((res) => {
                        this.editFormVisible = false;
                        this.getUsers();
                        this.addLoading = false;
                        this.$message({
                            message: '更新成功',
                            type: 'success'
                        });

                    }).catch(
                        message => {
                            this.addLoading = false;
                            this.editFormVisible = false;
                            this.$message.error(message);
                            console.log(message)
                        }
                    );

                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            let para = Object.assign({}, this.addForm);
                            if (para.systemType.contains('ios') && para.systemType.contains('android')) {
                                para.systemType = 'ios&android'
                            } else if (para.systemType.contains('ios')) {
                                para.systemType = 'ios'
                            } else if (para.systemType.contains('android')) {
                                para.systemType = 'android'
                            }
                            para.huawei_push_appSecret = {
                                client_id: para.huawei_push_client_id,
                                client_secret: para.huawei_push_client_secret
                            };
                            para.operator_name = window.localStorage.getItem('username');
                            console.log(`添加应用请求信息`, para);
//                            return;
                            let formData = new FormData();

                            formData.append("logo_png", this.addForm.logo_png)
                            formData.append("appName", para.appName)
                            formData.append("systemType", para.systemType)
                            formData.append("appDescription", para.appDescription)
                            formData.append("packageName", para.packageName)
                            formData.append("bundleID", para.bundleID)
                            formData.append("operator_name", para.operator_name)
                            formData.append("apnIDs", para.apnIDs)
                            formData.append("appCode", para.appCode)
                            formData.append("mqttIDs", para.mqttIDs)
                            formData.append("huawei_push_appSecret", {
                                client_id: para.huawei_push_appSecret.client_id,
                                client_secret: para.huawei_push_appSecret.client_secret
                            })
                            formData.append("huawei_push_client_id", para.huawei_push_client_id)
                            formData.append("huawei_push_client_secret", para.huawei_push_client_secret)
                            formData.append("appID", para.appID)
                            formData.append("xiaomi_push_appSecret", para.xiaomi_push_appSecret)

                            formData.append("cert_pem", para.cert_pem)
                            formData.append("key_pem", para.key_pem)
                            formData.append("test_cert_pem", para.test_cert_pem)
                            formData.append("test_key_pem", para.test_key_pem)
//                            return
                            addApp(formData).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addForm'].resetFields();
                                this.addFormVisible = false;
                                this.getUsers();
                            }).catch(
                                message => {
                                    this.addLoading = false;
                                    this.addFormVisible = false;
                                    this.$message.error(message)
                                    console.log(message)
                                }
                            );
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var userIds = this.sels.map(item => item.appID).toString();
                var ids = userIds.split(",")
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    console.log(11111111111111111111, this.sels)
                    return
                    let para = {appID: ids[0]};
                    console.log(`删除应用的请求信息`, para)
                    deleteApp(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {
                    this.listLoading = false;
                });
            },
            addmethods() {
                Array.prototype.contains = function (obj) {
                    var i = this.length;
                    while (i--) {
                        if (this[i] === obj) {
                            return true;
                        }
                    }
                    return false;
                }
            },

            /*
            created by Good luck 2017 10
             */

            getImageUrl(url) {
                if (this.hostname == "m.sys.china.com" || this.hostname == "c.m.china.com.cn") {
//                    return `http://p.m.china.com.cn/pushimage${c}`
                    return `http://p.m.china.com.cn/pushimage/${url}`

                }
                return `${SERVER_CODEBASE_URL}${url}`
            },
            /*   UploadFileTestCert(file) {
                   this.addForm.test_cert_pem = file
                   return false;
               },
               UploadFileTestKey(file) {
                   this.addForm.test_key_pem = file
                   return false;
               },
               UploadFileCert(file) {
                   this.addForm.cert_pem = file;
                   return false;
               },
               UploadFileKey(file) {
                   this.addForm.key_pem = file;
                   return false;
               },*/
            UploadFileIcon(file) {
                this.addForm.logo_png = file;
//                显示预览图片
                let render = new FileReader()
                let that = this;
                render.readAsDataURL(file)
                render.onload = function () {
                    that.imageUrl = this.result
                }
                return false;
            },
            /*  UploadFileTestCert2(file) {
                  this.editForm.test_cert_pem = file;
                  return false;
              },
              UploadFileTestKey2(file) {
                  this.editForm.test_key_pem = file;
                  return false;
              },
              UploadFileCert2(file) {
                  this.editForm.cert_pem = file;
                  return false;
              },
              UploadFileKey2(file) {
                  this.editForm.key_pem = file
                  return false;
              },*/
            UploadFileIcon2(file) {
                this.editForm.logo_png = file
                let render = new FileReader()
                let that = this;
                render.readAsDataURL(file)
                render.onload = function () {
                    that.currentEditImgUrl = this.result
                }
                return false;
            },
            download() {
            },
            option(scope, option) {
                let rr = scope.row.appID;
                console.log(scope.row)
                if (option === 2 || option === 4) {
                    this.infoId = rr;
//                    this.getAppInfos();
//                    this.handleEdit();
                    getAppInfo({
                        appID: scope.row.appID
                    }).then((data) => {
                        console.log("应用详细信息");
                        let content = data.instance;
                        this.editForm.appID = content.appID;
                        this.editForm.appCode = content.appCode;
                        this.editForm.appName = content.appName;
                        this.editForm.systemType = content.systemType;
                        this.editForm.appDescription = content.appDescription;
                        this.editForm.bundleID = content.bundleID;
                        this.editForm.operator_name = content.operator_name;
                        this.editForm.apnIDs = content.apnIDs;
                        this.editForm.mqttIDs = content.mqttIDs;
                        this.editForm.xiaomi_push_appSecret = content.xiaomi_push_appSecret;

//                        this.editForm.huawei_push_appSecret = {
//                            client_id: content.huawei_push_appSecret.client_id,
//                            client_secret: content.huawei_push_appSecret.client_secret
//                        };
//                        this.editForm.huawei_push_appSecret.client_id = content.huawei_push_appSecret.client_id || ''

//                        console.log(content.huawei_push_appSecret !== undefined, '32333333333333333')
//                        this.editForm.huawei_push_appSecret.client_id = 1
//                        this.editForm.huawei_push_appSecret.client_secret = content.huawei_push_appSecret.client_secret || ''
//                        this.editForm.huawei_push_appSecret.client_secret = 2

                        if (content.huawei_push_appSecret !== undefined) {
                            this.editForm.huawei_push_appSecret.client_id = content.huawei_push_appSecret.client_id
                            this.editForm.huawei_push_appSecret.client_secret = content.huawei_push_appSecret.client_secret
                        }
                        this.editForm.mqttlDs = content.mqttlDs;
                        this.editForm.test_cert_pem = content.test_cert_pem;
                        this.editForm.test_key_pem = content.test_key_pem;
                        this.editForm.cert_pem = content.cert_pem;
                        this.editForm.key_pem = content.key_pem;
                        this.editForm.packageName = content.packageName;
                        this.editForm.logo_png = content.logo_pn;
                        this.editFormVisible = true;
//                        this.handleEdit();
                    }).catch(message => {
                        this.listLoading = false;
                        this.$message.error(message);
                    });
                    this.currentEditImgUrl = this.getImageUrl(scope.row.imageUrl);
                    this.test_cert_pem_name = scope.row.test_cert_pem;
                    this.test_key_pem_name = scope.row.test_key_pem;
                    this.cert_pem_name = scope.row.cert_pem;
                    this.key_pem_name = scope.row.key_pem;
                    this.editReadonly = option === 4;
                    this.editTitle = option === 4 ? '查看' : '修改';
                    this.systemList = [];
//                    console.log('android', scope.row.systemType.indexOf('android') > -1)
//                    console.log('ios', scope.row.systemType.indexOf('ios') > -1)
                    if (scope.row.systemType.indexOf('android') > -1) {
                        this.systemList.push('android')
                    }
                    if (scope.row.systemType.indexOf('ios') > -1) {
                        this.systemList.push('ios')
                    }
                    return
                }
                console.log(rr);
                let dat = null;
                getAppInfo({appID: rr}).then((data) => {
                    dat = data.instance;
                    switch (option) {
                        case 1:
                            console.log(`上架`);
                            dat.isTop = true;
                            break;
                        case 3:
                            console.log(`下架`);
                            dat.isTop = false;
                            break
                    }
                    let str = dat.isTop ? `您将进行应用上架操作` : `您将进行应用下架操作，下架后该应用将不可用`;
                    this.$confirm(str, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        updateAppInfo(dat).then(data => {
                            if (!data.code) {
                                this.$message.success(`操作成功`)
                                this.addmethods();
                                this.getUsers();
                                this.image = ''
                            }
                        }).catch(messsage => {
                            console.log(messsage)
                        })
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '操作取消'
                        });
                    });

                    console.log(dat)
                }).catch(message => {
                    this.$message.error(message);
                });
            },
            SelectOneItem(val) {
                console.log(val)
                this.sels = val
            },

            RemoveOneItem() {
                console.log(this.sels)
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
//                    this.listLoading = true;
                    //NProgress.start();
                    let para = {appID: this.sels.appID};
                    console.log(`删除应用的请求信息`, para)
                    if (this.sels.isTop) {
                        this.$message({
                            message: '删除之前请将应用下架',
                            type: 'error'
                        });
                        return
                    }
                    deleteApp(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {
                    this.listLoading = false;
                });
            }
        },

        mounted() {
            this.addmethods();
            this.getUsers();
            this.image = ''
            this.hostname = window.location.host;
        }
    };


</script>

<style scoped lang="scss">
    .sTitle {
        width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer
    }

    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .avatar-uploader .el-upload:hover {
        border-color: #20a0ff;
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }

    .avatar {
        width: 178px;
        height: 178px;
        display: block;
        background-color: #666
    }

    i {
        border: 1px dotted #000;
        font-size: 14px !important;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /*///////////////////////////////////////////////////////////*/
    .dev .certificate, .pro .certificate {
        display: inline-block;
        margin: 0 10px 10px 0;
    }

    .dev, .pro {
        float: left;
    }

    .android-key-container .key-item {
        display: inline-block;
        box-sizing: border-box;
        width: calc(50% - 4px);
    }

    .android-ios-container {
        border-top: 2px solid #F0F0F0;
        padding-top: 10px;
    }

</style>

<!--////////////////////////////////////////////////////////////////-->
<!--编辑界面-->
<!--<el-dialog title="查看/修改" v-model="editFormVisible" :close-on-click-modal="false">-->
<!--<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">-->
<!--<el-form-item prop="appName" label="App名称：">-->
<!--<el-input v-model="editForm.appName"></el-input>-->
<!--</el-form-item>-->
<!--<el-form-item prop="appDescription" label="应用描述：">-->
<!--<el-input v-model="editForm.appDescription"></el-input>-->
<!--</el-form-item>-->
<!--<el-form-item label="应用类型">-->
<!--<el-checkbox-group v-model="systemList">-->
<!--<el-checkbox label="ios">ios</el-checkbox>-->
<!--<el-checkbox label="android">安卓</el-checkbox>-->
<!--</el-checkbox-group>-->
<!--</el-form-item>-->
<!--<template v-if="this.systemList[0] == 'ios'||this.systemList[1] == 'ios'">-->
<!--<el-form-item label="ios白名单">-->
<!--<el-input type="textarea" autosize v-model="editForm.apnIDs"></el-input>-->
<!--</el-form-item>-->
<!--<el-form-item prop="bundleID" label="bundleID">-->
<!--<el-input v-model="editForm.bundleID"></el-input>-->
<!--</el-form-item>-->
<!--<el-form-item label="证书">-->
<!--<el-upload class="upload-demo" action="https://jsonplaceholder.typicode.com/posts/"-->
<!--:on-preview="handlePreview" :on-remove="handleRemove" :file-list="fileList">-->
<!--<el-button size="small" type="primary">点击上传</el-button>-->
<!--</el-upload>-->
<!--<el-upload class="upload-demo" action="https://jsonplaceholder.typicode.com/posts/"-->
<!--:on-preview="handlePreview" :on-remove="handleRemove" :file-list="fileList">-->
<!--<el-button size="small" type="primary">点击上传</el-button>-->
<!--</el-upload>-->
<!--<el-upload class="upload-demo" action="https://jsonplaceholder.typicode.com/posts/"-->
<!--:on-preview="handlePreview" :on-remove="handleRemove" :file-list="fileList">-->
<!--<el-button size="small" type="primary">点击上传</el-button>-->
<!--</el-upload>-->
<!--<el-upload class="avatar-uploader" action="https://jsonplaceholder.typicode.com/posts/"-->
<!--:show-file-list="false" :on-success="handleAvatarSuccess"-->
<!--:before-upload="beforeAvatarUpload">-->
<!--<img v-if="imageUrl" :src="imageUrl" class="avatar">-->
<!--<i v-else class="el-icon-plus-->
<!--avatar-uploader-icon"></i>-->
<!--</el-upload>-->
<!--</el-form-item>-->
<!--</template>-->
<!--<template v-if="this.systemList[0] == 'android'||this.systemList[1] == 'android'">-->
<!--<el-form-item label="android白名单">-->
<!--<el-input type="textarea" autosize v-model="editForm.mqttIDs"></el-input>-->
<!--</el-form-item>-->
<!--<el-form-item prop="email" label="应用描述：">-->
<!--<div>-->
<!--<span>应用包名:-->
<!--<el-input v-model="editForm.packageName"></el-input>-->
<!--</span>-->
<!--<span>小米key：-->
<!--<el-input v-model="editForm.xiaomi_push_appSecret"></el-input>-->
<!--</span>-->
<!--</div>-->
<!--<div>-->
<!--<span>华为Id:-->
<!--<el-input v-model="editForm.huawei_push_appSecret.client_id"></el-input>-->
<!--</span>-->
<!--<span>华为key：-->
<!--<el-input v-model="editForm.huawei_push_appSecret.client_secret"></el-input>-->
<!--</span>-->
<!--</div>-->
<!--</el-form-item>-->
<!--</template>-->

<!--<el-upload class="avatar-uploader" action="https://jsonplaceholder.typicode.com/posts/"-->
<!--:show-file-list="false" :on-success="handleAvatarSuccess"-->
<!--:before-upload="beforeAvatarUpload">-->
<!--<img v-if="imageUrl" :src="imageUrl" class="avatar">-->
<!--<i v-else class="el-icon-plus-->
<!--avatar-uploader-icon"></i>-->
<!--</el-upload>-->
<!--</el-form>-->
<!--<div slot="footer" class="dialog-footer">-->
<!--<el-button @click.native="editFormVisible = false">取消</el-button>-->
<!--<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>-->
<!--</div>-->
<!--</el-dialog>-->
<!--///////////////////////////////////////////////////////////////////-->