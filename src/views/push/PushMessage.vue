<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-select v-model="filters.appID" placeholder="选择应用" @change="Init('search')">
                        <el-option v-for="item in MenuIdOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="userList" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column prop="name" label="消息名称" width="140">
            </el-table-column>
            <el-table-column label="操作" min-width="370">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)" style="width: 71px"><span
                            v-if="!(scope.row.hasSend||scope.row.sendStatus==='canceled')">修改/</span>查看
                    </el-button>
                    <el-button size="small" @click="sendWhiteList(scope.$index, scope.row)"
                               :disabled="scope.row.hasSend||scope.row.sendStatus==='canceled'">
                        发送白名单
                    </el-button>
                    <el-button size="small" @click="sendMessage(scope.$index, scope.row)"
                               :disabled="scope.row.hasSend ||scope.row.sendStatus==='canceled'"
                               v-if="hostname!== 'm.sys.china.com'">发送
                    </el-button>
                    <el-button size="small" @click="cancelSend(scope.$index, scope.row)"
                               :disabled="scope.row.hasSend||scope.row.sendStatus==='canceled'||scope.row.useWhiteList">
                        取消发送
                    </el-button>
                </template>
            </el-table-column>

            <el-table-column prop="role" label="发送总数" width="100">
                <template slot-scope="scope">
                    <!--{{scope.row.push_click_count_ios + scope.row.push_click_count_android}}-->
                    <!--{{scope.row.push_success_count}}-->
                    {{scope.row.push_count_should_android + scope.row.push_count_should_ios}}
                </template>
            </el-table-column>
            <el-table-column label="ios发送" width="100">
                <template slot-scope="scope">
                    {{scope.row.push_count_should_ios - scope.row.push_failed_count_ios
                    }}/{{scope.row.push_count_should_ios}}
                </template>
            </el-table-column>
            <el-table-column prop="email" label="Android发送" width="140">
                <template slot-scope="scope">
                    {{scope.row.push_count_should_android - scope.row.push_failed_count_android}}/
                    {{scope.row.push_count_should_android}}
                </template>
            </el-table-column>
            <el-table-column prop="sendStatus" label="消息状态" width="100">
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" :formatter="dateFormat" width="170" sortable>
            </el-table-column>
            <el-table-column prop="startTime" label="发送时间" :formatter="dateFormat" width="170" sortable>
            </el-table-column>
            <!--  <el-table-column prop="updateTime" label="操作时间" :formatter="dateFormat" width="170" sortable>
              </el-table-column>
              <el-table-column prop="operator_name" label="操作人" width="160" sortable>
              </el-table-column>-->

            <el-table-column prop="operator_name" label="操作记录" width="100">
                <template slot-scope="scope">
                    <el-button size="small" @click="showHistory(scope)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size"
                           :total="total" style="float:right;" :current-page.sync="currentPage">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog :title="EditTitle" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <el-form-item prop="name" label="消息名称：">
                    <el-input v-model="editForm.name" :disabled="EditReadOnly"></el-input>
                </el-form-item>
                <el-form-item prop="message" label="消息内容：">
                    <el-input v-model="editForm.message" :disabled="EditReadOnly"></el-input>
                </el-form-item>
                <el-form-item label="选择应用：">
                    <el-select v-model="editForm.appID" placeholder="选择应用"
                               :disabled="EditReadOnly">
                        <el-option v-for="item in MenuIdOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="选择语言：">
                    <el-select v-model="editForm.channel" placeholder="请选择语言"
                               :disabled="EditReadOnly">
                        <el-option v-for="item in languageTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="articleID" label="文章ID：">
                    <el-input v-model="editForm.articleID" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="选择时间：">
                    <el-radio-group v-model="editForm.sendType" @change="sendType" :disabled="EditReadOnly">
                        <el-radio label="immediately">立即发送</el-radio>
                        <el-radio label="timer">定时发送</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item v-if="this.send === 'timer'" label="发送类型">
                    <div class="block">
                        <el-date-picker v-model="editForm.startTime" type="datetime" placeholder="选择日期时间"
                                        :disabled="EditReadOnly">
                        </el-date-picker>
                    </div>
                </el-form-item>
                <el-form-item label="设备类型：">
                    <el-checkbox-group v-model="editForm.systemType">
                        <el-checkbox label="ios" :disabled="EditReadOnly">IOS</el-checkbox>
                        <el-checkbox label="android" :disabled="EditReadOnly">Android</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item v-if="this.editForm.systemType[0]=='ios'||this.editForm.systemType[1]=='ios'"
                              label="部署状态：">
                    <el-checkbox-group v-model="editForm.deployStatus">
                        <el-checkbox label="dev" :disabled="EditReadOnly">开发状态</el-checkbox>
                        <el-checkbox label="pro" :disabled="EditReadOnly">发布状态</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item v-if="this.editForm.systemType[0]=='ios'||this.editForm.systemType[1]=='ios'" prop="email"
                              label="视频链接：">
                    <el-input v-model="editForm.videoPath" :disabled="EditReadOnly"></el-input>
                </el-form-item>
                <el-form-item label="推送图片">
                    <el-upload class="avatar-uploader" action="https://jsonplaceholder.typicode.com/posts/"
                               :show-file-list="false" :disabled="EditReadOnly"
                               :before-upload="beforeEditUpload">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus
                        avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false" v-if="EditReadOnly">取消</el-button>
                <el-button @click.native="editFormVisible = false" v-else>关闭</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading" v-if="!EditReadOnly">提交
                </el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
                <el-form-item prop="name" label="消息名称：">
                    <el-input v-model="addForm.name"></el-input>
                </el-form-item>
                <el-form-item prop="message" label="消息内容：">
                    <el-input v-model="addForm.message"></el-input>
                </el-form-item>
                <el-form-item label="选择应用：">
                    <el-select v-model="addForm.appID" placeholder="选择应用">
                        <el-option v-for="item in MenuIdOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="选择语言：">
                    <el-select v-model="addForm.channel" placeholder="选择语言">
                        <el-option v-for="item in languageTypeOptions" :key="item.value" :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="articleID" label="文章ID：">
                    <el-input v-model="addForm.articleID"></el-input>
                </el-form-item>
                <el-form-item label="选择时间：" prop="sendType">
                    <el-radio-group v-model="addForm.sendType" @change="sendType">
                        <el-radio label="immediately">立即发送</el-radio>
                        <el-radio label="timer">定时发送</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item v-if="this.send === 'timer'" label="发送类型">
                    <div class="block">
                        <el-date-picker v-model="addForm.startTime" type="datetime" placeholder="选择日期时间">
                        </el-date-picker>
                    </div>
                </el-form-item>
                <el-form-item label="设备类型：">
                    <el-checkbox-group v-model="addForm.systemType">
                        <el-checkbox label="ios">IOS</el-checkbox>
                        <el-checkbox label="android">Android</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <!-- v-if="this.addForm.systemType[0]=='ios'||this.addForm.systemType[1]=='ios'" -->
                <el-form-item label="部署状态：">
                    <el-checkbox-group v-model="addForm.deployStatus">
                        <el-checkbox label="dev">开发状态</el-checkbox>
                        <el-checkbox label="pro">发布状态</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item prop="email" label="视频链接："
                              v-if="this.addForm.systemType[0]=='ios'||this.addForm.systemType[1]=='ios'">
                    <el-input v-model="addForm.videoPath"></el-input>
                </el-form-item>
                <el-form-item label="推送图片">
                    <el-upload class="avatar-uploader" action="https://jsonplaceholder.typicode.com/posts/"
                               :show-file-list="false"
                               :before-upload="beforeAddUpload">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus
                        avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">添加</el-button>
            </div>
        </el-dialog>
        {{EditImage}}
        <operationRecord ref="operhis"></operationRecord>
    </section>
</template>

<script>
    import util, {dateFormat} from '../../common/js/util';
    //import NProgress from 'nprogress'
    import {removeUser, batchRemoveUser, editUser, addUser, updateMessageInfo} from '../../api/api';
    import {getAppList, getMessageList, sendMessage, deleteMessage, getMessageInfo, getAppInfo} from "../../api/api";
    import {addBackStageUser, editBackStageUser, delBackStageUser, updateAppInfo} from "../../api/api";
    //moment.js库
    import moment from 'moment';
    import md5 from 'blueimp-md5';

    import operationRecord from '../../components/OperationRrecord'


    export default {
        components: {operationRecord},
        data() {
            return {
                currentPage: 1,
                //下拉菜单
                MenuIdOptions: [],
                newTypeOptions: [
                    {
                        value: 'messageID',
                        label: '消息ID'
                    }, {
                        value: 'systemType',
                        label: '设备类型'
                    }, {
                        value: 'sendType',
                        label: '发送类型'
                    }, {
                        value: 'sendStatus',
                        label: '发送状态'
                    }, {
                        value: 'appName',
                        label: '应用名称'
                    }
                ],
                languageTypeOptions: [
                    {
                        value: '',
                        label: '全部'
                    }, {
                        value: 'zh',
                        label: '中文'
                    },
                    {
                        value: 'en',
                        label: '英文'
                    },
                    {
                        value: 'fr',
                        label: '法文'
                    },
                    {
                        value: 'ar',
                        label: '阿拉伯文'
                    }, {
                        value: 'ru',
                        label: '俄文'//俄文
                    }, {
                        value: 'sp',
                        label: '西班牙文'
                    }, {
                        value: 'de',
                        label: '德文'
                    }, {
                        value: 'ko',
                        label: '韩文'
                    }, {
                        value: 'ja',
                        label: '日文'
                    }],
                value: '',
                uname: "",
                filters: {
                    appID: ''
                },
                userList: [],
                total: 0,
                page: 0,
                size: 10,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        {required: true, message: '这是必填字段', trigger: 'blur'}
                    ],
                    message: [
                        {required: true, message: '这是必填字段', trigger: 'blur'}
                    ],
                    articleID: [
                        {required: true, message: '这是必填字段', trigger: 'blur'}
                    ],
                    sendType: [
                        {required: true, message: '这是必选项', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                editForm: {
                    name: "",//消息名称,
                    image_png: "",//推送图片
                    deployStatus: [],//ios部署：dev，pro，dev_pro
                    sendType: [],//发送类型：immediately立即，timer定时
                    systemType: [],//应用类型可为ios，android，通用ios&android
                    articleID: '',//文章id
                    operateType: '',//正式发送为proSend
                    channel: "",//语言，英文前两个字母
                    onlyOnline: "",//是否仅发送在线用户
                    useWhiteList: "",//是否启用白名单
                    startTime: "",//发送时间
                    isActive: false,//消息激活发送true,仅保存消息不发送false
                    operator_name: '',//操作员
                    apnIDs: '',//ios白名单，格式：设备名:设备ID;
                    mqttIDs: '',//android白名单，格式：设备名:设备ID;
                    appID: '',
                    messageID: '',
                    sendStatus: 'canceled',//用于取消发送
                    message: '', //消息内容
                    videoPath: ''
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        {required: true, message: '这是必填字段', trigger: 'blur'}
                    ],
                    message: [
                        {required: true, message: '这是必填字段', trigger: 'blur'}
                    ],
                    articleID: [
                        {required: true, message: '这是必填字段', trigger: 'blur'}
                    ],
                    sendType: [
                        {required: true, message: '这是必选项', trigger: 'blur'}
                    ],
                },
                //新增界面数据
                addForm: {
                    name: "",//消息名称,
                    image_png: "",//推送图片
                    deployStatus: [],//ios部署：dev，pro，dev_pro
                    sendType: [],//发送类型：immediately立即，timer定时
                    systemType: [],//应用类型可为ios，android，通用ios&android
                    articleID: '',//文章id
                    operateType: '',//正式发送为proSend
                    channel: "zh",//语言，英文前两个字母
                    onlyOnline: "",//是否仅发送在线用户
                    useWhiteList: "",//是否启用白名单
                    startTime: "",//发送时间
                    isActive: false,//消息激活发送true,仅保存消息不发送false
                    operator_name: '',//操作员
                    apnIDs: '',//ios白名单，格式：设备名:设备ID;
                    mqttIDs: '',//android白名单，格式：设备名:设备ID;
                    appID: '1481620977745',
                    messageID: '',
                    sendStatus: 'canceled',//用于取消发送
                    message: '', //消息内容
                    videoPath: ''
                },
                language: "",
                imageUrl: "",
                applist: [],
                arr: [],
                send: '',
                EditTitle: '',
                EditReadOnly: null,
                currentMessageId: '',
                currentRow: null,
                AddImage: null,
                EditImage: null,
            }
        },
        methods: {
            dateFormat: dateFormat,
            /*查看操作记录*/
            showHistory(scope) {
                this.$refs.operhis.showOperation(scope.row)
            },

            sendType(value) {
                this.addForm.sendType = value;
                this.send = this.addForm.sendType
            },

            /*获取应用列表*/
            getAppSelect() {
                this.listLoading = true;
                getAppList().then((data) => {
                    this.applist = data.list;
                    let length = this.applist.length;
                    for (let i = 0; i < length; i++) {
                        if (this.applist[i].isTop)
                            this.MenuIdOptions.push({value: this.applist[i].appID, label: this.applist[i].appName})
                    }
                    /*设置默认为中国网*/
                    this.MenuIdOptions.forEach(x => {
                        if (x.label === '中国网') {
                            this.filters.appID = x.value;
                        }
                    });
                }).catch(message => {
                    this.listLoading = false;
                    this.$message.error(message);
                });
            },

            /*分页*/
            handleCurrentChange(val) {
                this.page = val;
                this.Init();
            },

            //获取推送信息列表
            Init(option = '') {
                if (option === 'search') this.currentPage = 1;
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
                getMessageList(para).then((data) => {
//                    console.log(data);
                    this.total = data.count;
                    this.userList = data.instances.list;
                    this.listLoading = false;
                }).catch(message => {
                });
            },

            //显示编辑界面
            handleEdit: function (index, row) {
                this.editLoading = false;
                console.log('当前编辑的messageid', row._id)
                this.currentRow = row
                this.currentRow.articleID = row.push_customContent;
                this.currentRow.messageID = row._id;
                this.currentMessageId = row._id
                let choose = []
                if (row.systemType === 'ios') {
                    choose.push('ios')
                }
                if (row.systemType === 'android') {
                    choose.push('android')
                }
                if (row.systemType === 'ios&android') {
                    choose.push('android')
                    choose.push('ios')
                }
                let devOrPro = (row.deployStatus !== 'dev_pro') ? [row.deployStatus] : ['dev', 'pro']
//                console.log(devOrPro)
                this.EditTitle = row.hasSend || row.sendStatus === 'canceled' ? '查看' : '修改';
                this.EditReadOnly = row.hasSend || row.sendStatus === 'canceled';
                this.editFormVisible = true;
                this.imageUrl = (row.imagePath) ? this.getImageUrl(row.imagePath) : '';
                this.editForm = {
                    name: row.name,//消息名称,
//                    image_png: row.imagePath,
                    deployStatus: devOrPro,//ios部署：dev，pro，dev_pro
                    sendType: row.sendType,//发送类型：immediately立即，timer定时
                    systemType: choose,//应用类型可为ios，android，通用ios&android
                    articleID: row.push_customContent,//文章id
                    operateType: row.operateType,//正式发送为proSend
                    channel: row.channel,//语言，英文前两个字母
                    onlyOnline: row.onlyOnline,//是否仅发送在线用户
                    useWhiteList: row.useWhiteList,//是否启用白名单
                    startTime: row.startTime,//发送时间
                    isActive: row.isActive,//消息激活发送true,仅保存消息不发送false
//                    operator_name: this.applist.operator_username,//操作员
                    // apnIDs: this.applist.apnIDs,//ios白名单，格式：设备名:设备ID;
                    // mqttIDs: this.applist.mqttIDs,//android白名单，格式：设备名:设备ID;
                    appID: row.appID,
                    messageID: '',
                    sendStatus: row.sendStatus,//用于取消发送
                    message: row.message, //消息内容
                    videoPath: row.videoPath, //消息内容
                };
                // this.$router.push(`/article/monitor/${row.articleId}`);
            },
            //显示新增界面
            handleAdd: function () {
                this.imageUrl = ''
                this.addFormVisible = true;
                this.addLoading = false;
                this.addForm = {
                    name: "",//消息名称,
                    // image_png: "",//推送图片
                    deployStatus: [],//ios部署：dev，pro，dev_pro
                    sendType: ["immediately"],//发送类型：immediately立即，timer定时
                    systemType: [],//应用类型可为ios，android，通用ios&android
                    articleID: '',//文章id
                    operateType: 'update',//正式发送为proSend
                    channel: "",//语言，英文前两个字母
                    onlyOnline: false,//是否仅发送在线用户
                    useWhiteList: false,//是否启用白名单
                    startTime: 1471441613254,//发送时间
                    isActive: false,//消息激活发送true,仅保存消息不发送false
                    // operator_name: this.applist.operator_username,//操作员
                    // apnIDs: this.applist.apnIDs,//ios白名单，格式：设备名:设备ID;
                    // mqttIDs: this.applist.mqttIDs,//android白名单，格式：设备名:设备ID;
                    appID: '1481620977745',
                    // messageID: '',
                    sendStatus: 'canceled',//用于取消发送
                    message: '', //消息内容
                };
            },
            getImageUrl(c) {
                if (this.hostname == "m.sys.china.com") {
                    return `http://p.m.china.com.cn/pushimage${c}`
                }
                return `${SERVER_CODEBASE_URL}${c}`
            },
            //编辑提交
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
//                            let para = this.currentRow
                            let para = {}
                            para.name = this.editForm.name;
                            if (this.EditImage) para.image_png = this.EditImage
                            para.deployStatus = this.editForm.deployStatus.length === 2 ? "dev_pro" : this.editForm.deployStatus;
                            para.sendType = this.editForm.sendType;
                            para.systemType = this.editForm.systemType.length === 2 ? "ios&android" : this.editForm.systemType;
                            para.articleID = this.editForm.articleID;
                            para.operateType = 'update';
                            para.channel = this.editForm.channel;
                            para.onlyOnline = this.currentRow.onlyOnline;
                            para.useWhiteList = this.currentRow.useWhiteList;
                            para.startTime = this.currentRow.startTime;
                            para.isActive = this.currentRow.isActive;
                            para.operator_name = window.localStorage.getItem('user_name');
                            para.videoPath = this.editForm.videoPath;
                            para.sendStatus = this.currentRow.sendStatus;
                            para.message = this.editForm.message;
//apnIDs
                            para.messageID = this.currentRow._id
                            para.appID = this.editForm.appID;

                            if (para.systemType[0] === "android") {
//                                para.deployStatus = "dev_pro"
                                delete  para.deployStatus
                            }
                            console.info("这是修改消息后的请求信息", para)
                            let cache = Object.keys(para);
                            let formData = new FormData();
                            for (let i = 0; i < cache.length; i++) {
                                formData.append(cache[i], para[`${cache[i]}`])
                            }
                            updateMessageInfo(formData).then((res) => {
                                this.editLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '您修改的信息已经成功提交',
                                    type: 'success'
                                });
                                this.$refs['editForm'].resetFields();
                                this.EditImage = null;
                                this.editFormVisible = false;
                                this.Init();
                            });
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.addForm);
                            para.deployStatus = para.deployStatus.length === 2 ? "dev_pro" : para.deployStatus
                            para.systemType = para.systemType.length === 2 ? "ios&android" : para.systemType
                            if (para.systemType[0] === "android") {
//                                para.deployStatus = "dev_pro"
                                delete para.deployStatus
                            }
                            para.startTime = new Date(para.startTime).getTime();
                            para.operateType = 'create';
                            para.operator_name = window.localStorage.getItem('username');
                            if (this.AddImage)
                                para.image_png = this.AddImage;
                            para.category = 'chinatouch';
                            console.log(Object.keys(para))
                            let cache = Object.keys(para);
                            console.log(cache)
                            let formData = new FormData();
                            for (let i = 0; i < cache.length; i++) {
                                formData.append(cache[i], para[`${cache[i]}`])
                            }
                            console.log(formData)
//                            return
                            sendMessage(formData).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addForm'].resetFields();
                                this.addFormVisible = false;
                                this.Init();
                                this.AddImage = null;
                            }).catch(message => {
                                this.addLoading = false;
                                this.$message.error(JSON.parse(message).message)
                                this.AddImage = null;
                            });
                        });

                    }
                });
            },

            selsChange: function (sels) {
                this.sels = sels;
            },

            //批量删除
            batchRemove: function () {
                console.info(this.sels)
                let MessageIdArray = this.sels.map(item => item._id);
                console.log(`要删除的Message的ID`, MessageIdArray[0])

                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    deleteMessage({
                        messageID: MessageIdArray[0]
                    }).then(data => {
                        this.$message('您已经成功删除1条数据,接口暂时不支持多条数据删除，选择多条则只删除第一个');
                        this.Init();
                    }).catch()
                }).catch(() => {

                });
            },

            /*发送*/
            sendMessage(index, row) {
                this.$confirm('确认发送该信息吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    let para = {
                        messageID: row._id,
                        useWhiteList: false,
                        isActive: true,
                        operateType: 'create'
                    };
                    sendMessage(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '发送成功',
                            type: 'success'
                        });
                        this.Init();
                    });
                }).catch(() => {
                    this.listLoading = false;
                    this.$message(`取消发送操作`)
                });

            },
            /*发送白名单*/
            sendWhiteList(index, row) {
                this.addLoading = true;
                getAppInfo({appID: row.appID}).then((data) => {
                    let app = data.instance;
                    let {apnIDs: apnIDs, mqttIDs: mqttIDs} = app;
                    let para = {};
                    para.messageID = row._id;
                    para.useWhiteList = true;
                    para.operateType = 'update';
                    para.isActive = true
//                    para.articleID = row.push_customContent;
                    para.apnIDs = apnIDs;
                    para.mqttIDs = mqttIDs;

                    console.log('发送白名单请求参数', para);
                    sendMessage(para).then((res) => {
                        this.editLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '发送白名单成功',
                            type: 'success'
                        });
                        this.Init();
                    });

                })

            },
            /*取消发送*/
            cancelSend(index, row) {
                let para = Object.assign(row, {
                    sendStatus: 'canceled'
                })
                para.articleID = row.push_customContent;
                para.messageID = row._id;
                console.info("这是取消发送时的请求信息", para)
//                return
                sendMessage(para).then((res) => {
                    this.addLoading = false;
                    //NProgress.done();
                    this.$message({
                        message: '提交成功',
                        type: 'success'
                    });
                    this.Init();
                }).catch(message => {
                    this.addLoading = false;
                    this.$message.error('您新增信息填写有误，请修改')
                });
            },
            beforeAddUpload(file) {
                this.AddImage = file
                let render = new FileReader()
                let that = this;
                render.readAsDataURL(file)
                render.onload = function () {
                    that.imageUrl = this.result
                }
                return false;
            },
            beforeEditUpload(file) {
                this.EditImage = file;
                let render = new FileReader()
                let that = this;
                render.readAsDataURL(file)
                render.onload = function () {
                    that.imageUrl = this.result
                }
            }

        },
        mounted() {
            this.getAppSelect();
            this.hostname = window.location.host;
        },
        /*     //删除
             handleDel: function (index, row) {
                 this.$confirm('确认删除该用户吗?', '提示', {
                     type: 'warning'
                 }).then(() => {
                     this.listLoading = true;
                     //NProgress.start();
                     let para = {targetUserId: row.userId};
                     delBackStageUser(para).then((res) => {
                         this.listLoading = false;
                         //NProgress.done();
                         this.$message({
                             message: '删除成功',
                             type: 'success'
                         });
                         this.Init();
                     });
                 }).catch(() => {

                 });
             },*/
        /* editSubmit: function () {
             this.$refs.editForm.validate((valid) => {
                 if (valid) {
                     this.$confirm('确认提交吗？', '提示', {}).then(() => {
                         this.editLoading = true;
                         let para = Object.assign({}, this.editForm);
                         para.messageID = this.currentMessageId
                         console.info("这是修改消息后的请求信息", para)
                         console.log(this.currentRow)
 //                            return
                         updateAppInfo(para).then((res) => {
                             this.editLoading = false;
                             //NProgress.done();
                             this.$message({
                                 message: '您修改的信息已经成功提交',
                                 type: 'success'
                             });
                             this.$refs['editForm'].resetFields();
                             this.editFormVisible = false;
                             this.Init();
                         });
                     });
                 }
             });
         }*/
        /*<!--<el-form-item>-->*/
        /*<!--<el-input v-model="filters.message" placeholder="查询内容"></el-input>-->
            <!--</el-form-item>-->
            <!--<el-form-item>-->
            <!--<el-button type="primary" @click="Init()">查询</el-button>-->
            <!--</el-form-item>-->*/
        /*<!--<template>-->
        <!--<el-select v-model="filters.channel" placeholder="请选择类型">-->
        <!--<el-option v-for="item in newTypeOptions" :key="item.value" :label="item.label"-->
        <!--:value="item.value">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</template>-->*/
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
</style>

