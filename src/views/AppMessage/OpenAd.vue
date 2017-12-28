<template>
    <section>

        <!--工具栏-->
        <el-col :span="24" class="toolbar">
            <el-form :inline="true" :model="search">
                <el-form-item>
                    <el-select v-model="search.a" placeholder="选择应用" @change="">
                        <el-option v-for="app in this.appList" :key="app.value" :label="app.label"
                                   :value="app.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-date-picker
                            v-model="search.b"
                            type="daterange"
                            placeholder="选择日期范围">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button class="primary" @click="searchAd">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="Adlist" highlight-current-row v-loading="listLoading" @selection-change=""
                  style="width: 100%;">
            <!--  <el-table-column type="selection" width="55">
              </el-table-column>-->
            <el-table-column prop="createDate" :formatter="dateFormat" label="创建时间" width="170" sortable>
            </el-table-column>
            <el-table-column label="广告类型" width="120">
                <template slot-scope="scope">
                    <span v-if="scope.row.clickType===5">webview打开</span>
                    <span v-if="scope.row.clickType===11">无法点击</span>
                    <span v-if="scope.row.clickType===13">外部浏览器</span>
                    <span v-if="scope.row.clickType===14">三方应用</span>
                </template>
            </el-table-column>
            <el-table-column label="广告链接" min-width="195">
                <template slot-scope="scope">
                    <div v-for="item in scope.row.clickUrl">

                        <el-tooltip :content="item" placement="top" effect="dark" v-if="item">
                            <div class="sTitle">{{item}}</div>
                        </el-tooltip>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="点击次数" width="95">
                <template slot-scope="scope">
                    <span v-if="scope.row.clickCount>0">{{scope.row.clickCount}}</span>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column label="广告图片" width="100">
                <template slot-scope="scope">
                    <div v-for="item in scope.row.resources">
                        <!--{{item}}-->
                        <el-button class="primary" size="small" @click="bigPicture(item)">预览图片</el-button>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="生效时间" width="170">
                <template slot-scope="scope">
                    {{scope.row.startDate | formatDate}}
                    <br>
                    {{scope.row.endDate | formatDate}}
                </template>
            </el-table-column>
            <el-table-column prop="channel" label="覆盖设备" width="110">
            </el-table-column>
            <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                    <el-button class="primary" size="small" @click="ViewEdit(scope)"> 查看/修改</el-button>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="createDate" :formatter="dateFormat" label="操作时间" width="180" sortable>
             </el-table-column>
             <el-table-column prop="operateName" label="操作人" min-width="150">
             </el-table-column>-->
            <el-table-column prop="operator_name" label="操作记录" width="100">
                <template slot-scope="scope">
                    <el-button size="small" @click="showHistory(scope)">查看</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--新增按钮和分页-->
        <div :span=24 class="toolbar">
            <el-button @click="addAsshow" type="primary">
                添加广告
            </el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size"
                           :total="total" style="float:right;">
            </el-pagination>
        </div>

        <!--预览图片-->
        <el-dialog title="预览图片" :visible.sync="ImgVisible" size="big">
            <img :src="currentImg" alt="" style="width: 700px">
        </el-dialog>

        <!--添加广告-->
        <el-dialog title="添加广告" v-model="AdAddVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <h4>添加开屏广告：</h4>
                <template>
                    <el-select v-model="editForm.appId" placeholder="请选择">
                        <el-option v-for="item in appList" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <br> <br>
                <template>
                    <el-radio-group v-model="editForm.state">
                        <el-radio class="radio" label="0">百度广告</el-radio>
                        <el-radio class="radio" label="1">自定义广告</el-radio>
                        <el-radio class="radio" label="2">跳过广告</el-radio>
                    </el-radio-group>
                </template>
                <h4>设备：</h4>
                <template>
                    <!--getAds-->
                    <el-checkbox-group v-model="editForm.channel" @change="">
                        <el-checkbox label="ios">ios</el-checkbox>
                        <el-checkbox label="android">安卓</el-checkbox>
                    </el-checkbox-group>
                    <!-- <el-radio-group v-model="editForm.channel">
                         <el-radio :label="'ios'">ios</el-radio>
                         <el-radio :label="'android'">android</el-radio>
                     </el-radio-group>-->
                </template>
                <h4>上传图片：</h4>
                <el-input v-model="currentResources" placeholder="上传url" style="width:50%" v-if="useUrl"></el-input>
                <el-form-item v-if="!useUrl">
                    <el-upload class="avatar-uploader" action="https://jsonplaceholder.typicode.com/posts/"
                               :show-file-list="false"
                               :before-upload="beforeAddUpload">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus
                        avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
                <h4>文件类型：</h4>
                <template>
                    <el-radio-group v-model="editForm.resType">
                        <el-radio class="radio" label="1">png</el-radio>
                        <el-radio class="radio" label="2">gif</el-radio>
                        <el-radio class="radio" label="3">mp4</el-radio>
                    </el-radio-group>
                </template>
                <h4> 广告类型：</h4>
                <template>
                    <el-radio-group v-model="editForm.clickType">
                        <el-radio class="radio" v-model="editForm.clickType" label="5">应用内打开webview</el-radio>
                        <br><br>
                        <el-radio class="radio" v-model="editForm.clickType" label="13">打开外部浏览器 </el-radio>
                        <br><br>
                        <el-radio class="radio" v-model="editForm.clickType" label="11">无法点击</el-radio>
                        <br><br>
                        <el-radio class="radio" v-model="editForm.clickType" label="14">打开指定应用 </el-radio>
                        <br>
                    </el-radio-group>
                    <br>

                    <el-input :disabled="editForm.clickType === '11'" v-model="currentClickUrl" placeholder="链接"
                              style="width:60%"></el-input>
                    <el-button :disabled="editForm.clickType === '11'" type="primary" @click.native="handleEdit"
                               :loading="editLoading">示例
                    </el-button>
                    <br>
                </template>
                <br><br>
                <template>
                    <div class="block">
                        <span class="demonstration">广告起始结束时间：</span>
                        <template>
                            <el-date-picker style="width:30%" v-model="editForm.startDate" type="datetime"
                                            placeholder="选择日期时间">
                            </el-date-picker>
                            ~
                            <el-date-picker style="width:30%" v-model="editForm.endDate" type="datetime"
                                            placeholder="选择日期时间">
                            </el-date-picker>
                        </template>
                    </div>
                </template>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="reset">重置</el-button>
                <!--<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>-->
                <el-button type="primary" @click.native="AddAdSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--查看/编辑广告-->
        <el-dialog :title="ViewEditTitle" v-model="ViewEditVisible" :close-on-click-modal="true">
            <!--{{ViewEditForm}}-->
            <el-form :model="ViewEditForm" label-width="100px" ref="editForm">
                <h4>编辑开屏广告：</h4>
                <template>
                    <el-select v-model="ViewEditForm.appId" placeholder="请选择" disabled>
                        <el-option v-for="item in appList" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </template>
                <br> <br>
                <template>
                    <el-radio-group v-model="ViewEditForm.state" disabled>
                        <el-radio class="radio" :label="0">百度广告</el-radio>
                        <el-radio class="radio" :label="1">自定义广告</el-radio>
                        <el-radio class="radio" :label="2">跳过广告</el-radio>
                    </el-radio-group>
                </template>
                <h4>设备：</h4>
                <template>
                    <!--{{ViewEditForm.channel}}-->
                    <el-checkbox-group v-model="channell" disabled>
                        <el-checkbox label='ios' disabled>ios</el-checkbox>
                        <el-checkbox label='android' disabled>安卓</el-checkbox>
                    </el-checkbox-group>
                </template>
                <h4>上传图片：</h4>
                <!--{{ViewEditForm.resources}}-->
                <el-input v-model="currentResources" placeholder="上传url"
                          style="width:50%" v-if="useUrl"></el-input>
                <el-form-item v-if="!useUrl">
                    <el-upload class="avatar-uploader" action="https://jsonplaceholder.typicode.com/posts/"
                               :show-file-list="false"
                               :before-upload="beforeAddUpload">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus
                        avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
                <h4>文件类型：</h4>
                <template>
                    <el-radio-group v-model="ViewEditForm.resType">
                        <el-radio class="radio" :label="1">png</el-radio>
                        <el-radio class="radio" :label="2">gif</el-radio>
                        <el-radio class="radio" :label="3">mp4</el-radio>
                    </el-radio-group>
                </template>
                <h4> 广告类型：</h4>
                <template>
                    <el-radio-group v-model="ViewEditForm.clickType">
                        <el-radio class="radio" :label="5">应用内打开webview</el-radio>
                        <br><br>
                        <el-radio class="radio" :label="13">打开外部浏览器 </el-radio>
                        <br><br>
                        <el-radio class="radio" :label="11">无法点击</el-radio>
                        <br><br>
                        <el-radio class="radio" :label="14">打开指定应用 </el-radio>
                        <br>
                    </el-radio-group>
                    <br>
                    <el-input :disabled="ViewEditForm.clickType === 11" v-model="currentClickUrl"
                              placeholder="链接"
                              style="width:60%"></el-input>
                    <el-button :disabled="ViewEditForm.clickType === 11" type="primary" @click.native="handleEdit"
                               :loading="editLoading">示例
                    </el-button>
                    <br>
                </template>
                <br><br>
                <template>
                    <div class="block">
                        <span class="demonstration">广告起始结束时间：</span>
                        <template>
                            <el-date-picker style="width:30%" v-model="ViewEditForm.startDate" type="datetime"
                                            placeholder="选择日期时间">
                            </el-date-picker>
                            ~
                            <el-date-picker style="width:30%" v-model="ViewEditForm.endDate" type="datetime"
                                            placeholder="选择日期时间">
                            </el-date-picker>
                        </template>
                    </div>
                </template>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="reset2">重置</el-button>
                <el-button type="primary" @click.native="ViewEditSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--示例-->
        <el-dialog title="示例格式" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm"
                     style="word-wrap: break-word">
                <div>Android包名＋路径＋参数<br>
                    "clickUrl":["{\"packageName\": \"cn.china.newsdigest\",\"activityPath\":\"cn.china.newsdigest.ui.activity.AdvertisingActivity\",\"params\":\"a=1&b=2\",\"downloadUrl\":\"http://www.baidu.com \"}"]
                    <br> iOS Schema＋params<br> weixin://config=1&abar=2
                </div>
            </el-form>
        </el-dialog>
        <!--操作记录弹框-->
        <operationRecord ref="operhis"></operationRecord>

    </section>
</template>

<script>
    import util, {formatDate, dateFormat, InitMenu} from '../../common/js/util';
    import {updateAd, getlatestAd, getAppList, getAdList, addAd} from '../../api/api';
    //组件引入
    import operationRecord from '../../components/OperationRrecord'


    export default {
        components: {operationRecord},
        data() {
            return {
                useUrl: true,
                options: [{
                    value: 'chinaApp',
                    label: 'chinaApp'
                }],
                chan: '',
                android: "",
                iOSadId: '',
                iossure: "",
                androidsure: "",
                editFormVisible: false,
                editLoading: false,
                editFormRules: {
                    appId: [
                        {required: true, message: '请输入id', trigger: 'blur'}
                    ]
                },
                state: "",
//                编辑界面数据
                editForm: {
                    appId: "1481620977745",
                    startDate: new Date(),
                    endDate: new Date(new Date().getTime() + (6 * 24 * 60 * 60 * 1000)),
                    channel: [],
                    resType: 0,
                    clickType: 0,
                    number: 0,
                    state: 0,
                    resources: '',
                    clickUrl: ''
                },
                AdAddVisible: false,
                Adlist: [],
                appList: [
                    {
                        value: 1,
                        label: '中国网'
                    }
                ],
                search: {
                    a: '', b: '', c: ''
                },
                listLoading: true,
                size: 10,
                total: null,
                currentImg: '',
                ImgVisible: false,
                ViewEditVisible: false,
                ViewEditTitle: '查看/修改',
                ViewEditForm: {},
                aaa: ['ios'],
                rowCache: {},
                currentResources: '',
                currentResourcesCache: '',
                currentClickUrl: '',
                currentClickUrlCache: '',
                //上传图片文件使用
                imageUrl: '',
                AddImage: null
            }
        },
        methods: {
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
            /*展示操作记录*/
            showHistory(scope) {
//                let _this = this;
                this.$refs.operhis.showOperation(scope.row)
            },
            dateFormat: dateFormat,
            reset() {
                this.editForm = {
                    appId: "1481620977745",
                    startDate: new Date(),
                    endDate: new Date(new Date().getTime() + (6 * 24 * 60 * 60 * 1000)),
                    channel: [],
                    resType: 0,
                    clickType: 0,
                    clickUrl: '',
                    resources: '',
                    state: 0
                };
                this.currentResources = '';
                this.currentClickUrl = '';
            },
            reset2() {
                this.ViewEditForm = Object.assign({}, this.rowCache)
                this.currentClickUrl = this.currentClickUrlCache;
                this.currentResources = this.currentClickUrlCache;

            },
            addAsshow() {
                this.editLoading=false;
                this.AdAddVisible = !this.AdAddVisible
                this.editForm = {
                    appId: "chinaApp",
                    channel: [],
                    resType: 0,
                    clickType: 0,
                    currentResources: ''
                };
            },
            getAds(value) {
                console.log('value', value)
                if (value[0] == "ios" || value[1] == "ios") {
                    this.iossure = "ios";
                    let para = {
                        appId: "chinaApp",
                        channel: "ios"
                    };
                    this.listLoading = true;
                    getlatestAd(para).then((data) => {

                        this.iOSadId = data.data.adId;
                        this.editForm.number = data.data.number;
                        this.chan = data.data.channel;
                        this.listLoading = false;
                    }).catch(message => {
                        this.listLoading = false;
                        this.$message.error(message);
                    });
                }
                if (value[0] == "android" || value[1] == "android") {
                    this.androidsure = "android";
                    let para = {
                        appId: "chinaApp",
                        channel: "android"
                    };
                    this.listLoading = true;

                    getlatestAd(para).then((data) => {
                        this.androidadId = data.data.adId;
                        this.editForm.number = data.data.number;
                        this.chan = data.data.channel;
                        this.listLoading = false;
                    }).catch(message => {
                        this.listLoading = false;
                        this.$message.error(message);
                    });
                }
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                        if (this.chan == '') {
                            this.$confirm('设备选项为空/你的ip被限制');
                            this.reset();
                        } else {
                            if (valid) {
                                this.$confirm('确认提交吗？', '提示', {}).then(() => {
                                    this.editLoading = true;
                                    var resources = this.editForm.resources;
                                    var click = this.editForm.clickUrl;
                                    if (this.iossure == "ios") {
                                        this.editForm.adId = this.iOSadId;
                                        this.editForm.resources = resources;
                                        this.editForm.clickUrl = click;

                                        console.log(this.editForm.resources)
                                        this.editForm.resources = '["' + this.editForm.resources.trim() + '"]';

//                                        console.log(!!this.editForm.clickUrl)
                                        if (!!this.editForm.clickUrl) {
                                            this.editForm.clickUrl = this.editForm.clickUrl.trim();
                                            this.editForm.clickUrl = '["' + this.editForm.clickUrl.trim() + '"]';
                                        }
//                                        console.log(this.editForm.clickUrl);

                                        this.editForm.startDate = Date.parse(new Date(this.editForm.startDate));
                                        this.editForm.endDate = Date.parse(new Date(this.editForm.endDate));
                                        this.editForm.channel = "ios";
                                        let para = Object.assign({}, this.editForm);
//                                        para.clickUrl=[para.clickUrl]
                                        updateAd(para).then((res) => {

                                            this.editLoading = false;
                                            this.$message({
                                                message: '提交成功',
                                                type: 'success'
                                            });
                                            this.$refs['editForm'].resetFields();

                                        }).catch(message => {

                                            this.listLoading = false;
                                            this.$message.error(message);
                                        });
                                        this.iossure = "";
                                    }

                                    if (this.androidsure == "android") {
                                        this.editForm.adId = this.androidadId;
                                        console.log("adId", this.adId);
                                        this.editForm.resources = resources;
                                        this.editForm.clickUrl = click;
                                        this.editForm.resources = '["' + this.editForm.resources.trim() + '"]';
                                        this.editForm.clickUrl = '["' + this.editForm.clickUrl.trim() + '"]';

                                        this.editForm.startDate = Date.parse(new Date(this.editForm.startDate));
                                        this.editForm.endDate = Date.parse(new Date(this.editForm.endDate));

                                        this.editForm.channel = "android";
                                        let para = Object.assign({}, this.editForm);
                                        updateAd(para).then((res) => {

                                            this.editLoading = false;
                                            this.$message({
                                                message: '提交成功',
                                                type: 'success'
                                            });
                                            this.$refs['editForm'].resetFields();

                                        }).catch(message => {

                                            this.listLoading = false;
                                            this.$message.error(message);
                                        });

                                        this.androidsure = ""
                                    }
                                    this.editForm.channel = []
                                    this.editForm.resources = resources;
                                    this.editForm.clickUrl = click;
                                });
                            }

                        }
                    }
                );
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            getSelectList() {
                let _this = this;
                InitMenu(this.appList, function (menulist) {
                    menulist.forEach(x => {
                        if (x.label === '中国网') {
                            _this.search.a = x.value;
                        }
                    })
                })
            },
            Init(page = 0) {
                getAdList({
                        page: page,
                        size: 10
                    }
                ).then(
                    data => {
                        console.log(data)
                        this.total = data.total
                        this.Adlist = data.list
                        console.log(this.Adlist)
                        this.listLoading = false
                    }
                ).catch()
            },
            handleCurrentChange(page) {
                this.Init(page - 1)
            },
            ViewEdit(scope) {
                console.log(scope.row)
                this.ViewEditForm = Object.assign({}, scope.row)
                this.rowCache = Object.assign({}, scope.row)
                this.currentResources = scope.row.resources[0]
                this.currentResourcesCache = scope.row.resources[0]
                this.imageUrl = scope.row.resources[0]
                this.currentClickUrl = scope.row.clickUrl[0]
                this.currentClickUrlCache = scope.row.clickUrl[0]
                this.ViewEditVisible = true;
            },
            bigPicture(imgUrl) {
                this.currentImg = imgUrl
                this.ImgVisible = true
            },
            EditSubmit() {

            },
            AddAdSubmit() {

                this.editLoading=true
                let para = Object.assign(this.editForm);
                para.resources = [this.currentResources];
                para.clickUrl = [this.currentClickUrl];
                para.startDate = Date.parse(new Date(para.startDate));
                para.endDate = Date.parse(new Date(para.endDate));
//                para.channel = para.channel.length === 2 ? 'ios&android' : para.channel.toString()
                if (para.channel.length === 2) {
                    console.log('添加ios安卓版本');
                    para.channel = 'ios';
                    var cache = Object.keys(para);
                    var formData = new FormData();
                    for (let i = 0; i < cache.length; i++) {
                        formData.append(cache[i], para[`${cache[i]}`])
                    }
                    console.log('ios', para.channel);
                    addAd(para).then(
                        data => {
                            if (!data.code) {
                                this.$message.success('IOS添加成功');
                                this.Init()
                                this.AdAddVisible = false;
                                this.editLoading=false
                            }
                        }
                    ).catch(
                        message => {
                            this.AdAddVisible = false;
                            this.$message.error('IOS添加失败');
                            this.editLoading=false
                            console.log(message)
                        }
                    );
                    var para2 = JSON.parse(JSON.stringify(para))
                    para2.channel = 'android';
                    var cache = Object.keys(para2);
                    var formData = new FormData();
                    for (let i = 0; i < cache.length; i++) {
                        formData.append(cache[i], para2[`${cache[i]}`])
                    }
                    console.log('android', para2.channel);
//                    return;
                    setTimeout(function () {
                        addAd(para2).then(
                            data => {
                                if (!data.code) {
                                    this.$message.success('安卓添加成功');
                                    this.AdAddVisible = false;
                                    this.editLoading=false


                                    this.Init()
//                                this.reset()
//                                this.AddImage = null;
                                }
                            }
                        ).catch(
                            message => {
//                                this.$message.error('安卓添加失败')
                                this.AdAddVisible = false;
                                this.editLoading=false

                                console.log(message)
//                            this.AddImage = null;
                            }
                        )
                    }, 0)
                    return
                }
//                let str = para.channel.toString()
                para.channel = para.channel.toString()
                var cache = Object.keys(para);
                var formData = new FormData();
                for (let i = 0; i < cache.length; i++) {
                    formData.append(cache[i], para[`${cache[i]}`])
                }
                addAd(para).then(
                    data => {
                        console.log(data)
                        if (!data.code) {
                            this.$message.success('ios版添加成功')
                            this.Init()
                            this.AddImage = null;
                        }
                    }
                ).catch(
                    message => {
                        this.$message.error('失败')
                        console.log(message)
                    }
                )
                this.AdAddVisible = false;
                this.reset()
            },
            ViewEditSubmit() {
                this.ViewEditForm.startDate = Date.parse(new Date(this.ViewEditForm.startDate));
                this.ViewEditForm.endDate = Date.parse(new Date(this.ViewEditForm.endDate));
                let para = Object.assign({}, this.ViewEditForm)
                para.resources = []
                para.clickUrl = []
                if (this.useUrl) {
                    para.resources.push(`${this.currentResources}`)
                } else {
                    if (this.AddImage)
                        para.resources.push(this.AddImage)
                }
                para.clickUrl.push(`${this.currentClickUrl}`);

                var cache = Object.keys(para);
                var formData = new FormData();
                for (let i = 0; i < cache.length; i++) {
                    formData.append(cache[i], para[`${cache[i]}`])
                }
                console.log(para);
                console.log(formData);
                updateAd(para).then(
                    data => {
                        console.log(data);
                        this.Init();
                        this.$message.success('修改成功');
                        this.ViewEditVisible = false;
                        this.AddImage = null;
                    }
                ).catch(

                )
            },
            searchAd() {
                let para = (this.search.a) ? {appId: this.search.a} : {};
                if (this.search.b && this.search.b[0] && this.search.b[1]) {
                    para.startTime = new Date(this.search.b[0]).getTime();
                    para.endTime = new Date(this.search.b[1]).getTime()
                }
                getAdList({
                        page: 0,
                        size: 10,
                        ...para
                    }
                ).then(
                    data => {
                        console.log(data)
                        this.total = data.total
                        this.Adlist = data.list
                        console.log(this.Adlist)
                        this.listLoading = false
                    }
                ).catch()


            }


        },
        mounted() {
            this.getSelectList()
            this.Init();
        },
        filters: {
            formatDate(time) {
                let date = new Date(time)
                return formatDate(date)
            }
        },
        computed: {
            channell() {
                let cc = []
                if (this.ViewEditForm.channel === 'ios&android') {
                    cc.push('ios')
                    cc.push('android')
                } else {
                    cc.push(this.ViewEditForm.channel)
                }
                return cc
            }
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
</style>