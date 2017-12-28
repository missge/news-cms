<template>
    <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px"
             class="demo-ruleForm login-container">
        <h3 class="title">系统登录 &nbsp;<span style="font-size:0.5px;color:blue">{{this.versions}}</span></h3>
        <el-form-item prop="account">
            <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号"></el-input>
        </el-form-item>
        <el-form-item prop="checkPass">
            <el-input type="password" v-model="ruleForm2.checkPass" auto-complete="off" placeholder="密码"></el-input>
        </el-form-item>
        <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
        <el-form-item style="width:100%">
            <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit2" :loading="logining">登录
            </el-button>
            <!--<el-button @click.native.prevent="handleReset2">重置< /el-button>-->
            <div style="text-align:center">版本号：v_1.0_51_2</div>
        </el-form-item>
    </el-form>
</template>

<script>
    import {requestLogin} from '../api/api';
    import md5 from 'blueimp-md5';
    //import NProgress from 'nprogress'
    export default {
        data() {
            return {
                logining: false,
                ruleForm2: {
                    account: localStorage.getItem("username") || "",
                    checkPass: localStorage.getItem("password") || ""
                },
                rules2: {
                    account: [
                        {required: true, message: '请输入账号', trigger: 'blur'},
                        //{ validator: validaePass }
                    ],
                    checkPass: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        //{ validator: validaePass2 }
                    ]
                },
                checked: true,
                hostname: '',
                versions: '',
            };
        },
        methods: {

            hostName() {
                this.hostname = window.location.host;
                //  console.log('hostname',this.hostname) ;
                if (this.hostname == "sys.feawin.com" || this.hostname == "localhost:4000") {
                    this.versions = "测试服"
                } else if (this.hostname == "m.sys.china.com") {
                    this.versions = "正式服"
                }
            },
            handleReset2() {
                this.$refs.ruleForm2.resetFields();
            },
            handleSubmit2(ev) {
                // localStorage.removeItem("token");
                let _this = this;
                this.$refs.ruleForm2.validate((valid) => {
                    if (valid) {
                        //_this.$router.replace('/table');
                        this.logining = true;
                        //NProgress.start();

                        let loginParams = {userName: this.ruleForm2.account, password: md5(this.ruleForm2.checkPass)};
                        requestLogin(loginParams).then(data => {
                            this.logining = false;
                            // console.log(data)
                            let token = data.token;
                            localStorage.setItem('token', token);

                            localStorage.setItem('user', JSON.stringify({
                                username: "aaa"
                            }));
                            localStorage.setItem("username", this.ruleForm2.account);
                            localStorage.setItem("password", this.ruleForm2.checkPass);
                            if (this.fullScreen = typeof this.$route.query.showtype !== 'undefined') {
                                this.$router.push({path: '/Welcome?showtype=Welcome'});
                            } else {
                                this.$router.push({path: '/Welcome'});
                            }

                            // this.$route.query.redirect ||
                        }).catch(message => {
                            this.$confirm("账号或密码错误", '提示', {
                                type: 'warning'
                            }).then(() => {
                                this.logining = false;
                                this.$message.error(message);
                            }).catch((message) => {
                                this.logining = false;
                                this.$message.error(message);
                            });
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            }
        },
        mounted() {
            this.hostName()
        }
    }

</script>

<style lang="scss" scoped>
    .login-container {
        /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        margin: 180px auto;
        width: 350px;
        padding: 35px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;

        .title {
            margin: 0px auto 40px auto;
            text-align: center;
            color: #505458;
        }

        .remember {
            margin: 0px 0px 35px 0px;
        }
    }
</style>