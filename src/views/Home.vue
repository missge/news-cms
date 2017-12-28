<template>
    <el-row class="container">
        <el-col :span="24" class="header" :class="{'hidden':fullScreen}">
            <el-col :span="10" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
                {{collapsed ? '' : sysName}}
            </el-col>
            <el-col :span="10">
                <div class="tools" @click.prevent="collapse">
                    <i class="el-icon-cms-icon30" style="height:200px; width:40px"></i>
                    <!-- <img class="menu-img" src="../assets/menu.png" alt=""> -->
                </div>
            </el-col>
            <el-col :span="4" class="userinfo">
                <el-dropdown trigger="hover">
					<span class="el-dropdown-link userinfo-inner">
						<i class="el-icon-cms-yonghu" style="margin-right:8px"></i>
						<span>{{this.name}}</span>
                        <!-- <img class="users-img" src="../assets/users.png" alt=""> -->
					</span>
                    <el-dropdown-menu slot="dropdown">
                        <!-- <el-dropdown-item>我的消息</el-dropdown-item> -->
                        <!-- <el-dropdown-item>设置</el-dropdown-item> -->
                        <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-col>
        <el-col :span="24" class="main" :class="{'tt':fullScreen}">
            <!--{{routess}}-->
            <aside :class="{'hidden':fullScreen,'menu-collapsed':collapsed,'menu-expanded':!collapsed,'scroll':!collapsed}"
                   v-loading="asideLoading">
                <!--导航菜单-->
                <el-menu :default-active="$route.path" class="el-menu-vertical-demo" @open="handleopen"
                         @close="handleclose" @select="handleselect" unique-opened router v-show="!collapsed"
                         style="overflow-y: scroll; width: 250px;">
                    <template v-for=" (item,index) in this.routess
                " v-if="!item.hidden">
                        <el-submenu :index="index+''" v-if="!item.leaf" :key="index">
                            <template slot="title">
                                <i :class="item.iconCls"></i>{{item.name}}
                            </template>
                            <el-menu-item v-for="child in item.children" :index="child.path" :key="child.path"
                                          v-if="!child.hidden">{{child.name}}
                            </el-menu-item>
                        </el-submenu>
                        <el-menu-item v-if="item.leaf&&item.children.length>0" :index="item.children[0].path"
                                      :key="index">
                            <i :class="item.iconCls"></i>{{item.children[0].name}}
                        </el-menu-item>
                    </template>
                </el-menu>
                <!--导航菜单-折叠后-->
                <ul class="el-menu el-menu-vertical-demo  guan  collapsed" v-show="collapsed" ref="menuCollapsed">
                    <li v-for="(item,index) in this.routess" v-if="!item.hidden" class="el-submenu item collapsed"
                        :key="index">
                        <template v-if="!item.leaf">
                            <div class="el-submenu__title" style="padding-left: 20px;" @mouseover="showMenu(index,true)"
                                 @mouseout="showMenu(index,false)">
                                <i :class="item.iconCls"></i>
                            </div>
                            <ul class="el-menu submenu" :class="'submenu-hook-'+index" @mouseover="showMenu(index,true)"
                                @mouseout="showMenu(index,false)">
                                <li v-for="child in item.children" v-if="!child.hidden" :key="child.path"
                                    class="el-menu-item" style="padding-left: 40px;"
                                    :class="$route.path==child.path?'is-active':''" @click="$router.push(child.path)">
                                    {{child.name}}
                                </li>
                            </ul>
                        </template>
                        <template v-else>
                            <div class="el-submenu">
                                <div class="el-submenu__title el-menu-item"
                                     style="padding-left: 20px;height: 56px;line-height: 56px;padding: 0 20px; width:190px"
                                     :class="$route.path==item.children[0].path?'is-active':''"
                                     @click="$router.push(item.children[0].path)">
                                    <i :class="item.iconCls"></i>
                                </div>
                            </div>
                        </template>
                    </li>
                </ul>
            </aside>
            <section class="content-container">
                <div class="grid-content bg-purple-light">
                    <el-col :span="24" class="breadcrumb-container">
                        <strong class="title">{{$route.name}}</strong>
                        <el-breadcrumb separator="/" class="breadcrumb-inner">
                            <el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
                                {{ item.name }}
                            </el-breadcrumb-item>
                        </el-breadcrumb>
                    </el-col>
                    <el-col :span="24" class="content-wrapper">
                        <transition name="fade" mode="out-in">
                            <router-view></router-view>
                        </transition>
                    </el-col>
                </div>
                <!--<span @click="kkk">asdasssssssssssssssss</span>-->
            </section>
        </el-col>
    </el-row>
</template>

<script>
    import {getUserResource} from '../api/api';

    export default {
        data() {
            return {
                asideLoading: true,
                sysName: '',
                collapsed: false,
                sysUserName: '',
                sysUserAvatar: '',
                form: {
                    name: '',
                    region: '',
                    date1: '',
                    date2: '',
                    delivery: false,
                    type: [],
                    resource: '',
                    desc: ''
                },

                routess: [],
                hostname: '',
                versions: '',
                userResource: '',
                name: "",
                fullScreen: true
            }
        },
        methods: {
            getResource() {
                //NProgress.start();
                let token = localStorage.getItem("token")
                getUserResource(token).then((data) => {
                    this.userResource = data.resourceList;
                    // console.log(this.userResource)
                    this.rout()
                    this.asideLoading = false;
                }).catch(message => {
                    this.$message.error(message);
                    this.asideLoading = false;
                });
            },
            hostName() {
                this.hostname = window.location.host;
                //  console.log('hostname',this.hostname) ;
                if (this.hostname == "sys.feawin.com" || this.hostname == "localhost:4000") {
                    this.versions = "测试服"
                } else if (this.hostname == "http://m.sys.china.com") {
                    this.versions = "正式服"
                }
                this.sysName = '综合管理系统' + this.versions
            },
            rout() {
                this.name = localStorage.getItem("username");
                console.log(name)
                if (name && name == "china_cms_backend_super") {
                    let m = this.routess.unshift(this.$router.options.routes)
                    this.routess = this.routess[0]
                } else {
                    let rout = this.$router.options.routes;
                    let userResource = this.userResource;
                    /*   for (let k in rout) {
                           for (let ur in userResource) {
                               if (rout[k].path === userResource[ur].resourceUrl) {
                                   let m = this.routess.push(rout[k])
                               }
                           }
                       }*/
                    let il = rout.length;
                    let jl = userResource.length;
                    for (let i = 0; i < il; i++) {
                        for (let j = 0; j < jl; j++) {
                            if (rout[i].path === userResource[j].resourceUrl) {
                                let m = this.routess.push(rout[i])
                            }
                        }
                    }
                }
            },
            onSubmit() {
                // console.log('submit!');
            },
            handleopen() {
                //console.log('handleopen');
            },
            handleclose() {
                //console.log('handleclose');
            },
            handleselect: function (a, b) {
            },
            //退出登录
            logout: function () {
                let _this = this;
                this.$confirm('确认退出吗?', '提示', {
                    //type: 'warning'
                }).then(() => {
                    localStorage.removeItem("token");
                    _this.$router.push({
                        path: '/login',
                        // query: { redirect: this.$route.fullPath }
                    });
                }).catch(() => {

                });
            },
            //折叠导航栏
            collapse: function () {
                this.collapsed = !this.collapsed;
            },
            showMenu(i, status) {
                this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-' + i)[0].style.display = status ? 'block' : 'none';
            },
            kkk() {
//                console.log(`当前showtype参数`, typeof this.$route.query.showtype === 'undefined')
                this.fullScreen = typeof this.$route.query.showtype !== 'undefined';
                if (typeof this.$route.query.token !== 'undefined') {
//                    console.log('token是', this.$route.query.token)
                    window.localStorage.setItem('token', this.$route.query.token);
                }
            }
        },
        mounted() {
            this.hostName();
            this.getResource();
            this.kkk();
            let user = sessionStorage.getItem('user');

            if (user) {
                user = JSON.parse(user);
                this.sysUserName = user.name || '';
                this.sysUserAvatar = user.avatar || '';
            }
        }
    }

</script>

<style scoped lang="scss">
    @import '~scss_vars';

    .userinfo {
        position: relative;
    }

    .hidden {
        display: none;
    }

    .tt {
        top: 0 !important;
    }

    .menu-img {
        margin-top: 10px;
        display: inline-block;
    }

    .users-img {
        position: absolute;
        right: 2px;
        bottom: -22px;
        display: inline-block;
    }

    .container {
        position: absolute;
        top: 0px;
        bottom: 0px;
        width: 100%;
        .header {
            height: 60px;
            line-height: 60px;
            // background: #9de1b9;
            background: #68b966;
            color: #fff;
            .userinfo {
                text-align: right;
                padding-top: 5px;
                padding-right: 35px;
                float: right;
                .userinfo-inner {
                    cursor: pointer;
                    color: #fff;
                    img {
                        width: 40px;
                        height: 40px;
                        border-radius: 20px;
                        margin: 10px 0px 10px 10px;
                        float: right;
                    }
                }
            }
            .logo {
                //width:230px;
                height: 60px;
                font-size: 22px;
                padding-left: 15px;
                padding-right: 15px;
                border-color: rgba(238, 241, 146, 0.3);
                border-right-width: 1px;
                border-right-style: solid;
                img {
                    width: 40px;
                    float: left;
                    margin: 10px 10px 10px 18px;
                }
                .txt {
                    color: #fff;
                }
            }
            .logo-width {
                width: 230px;
            }
            .logo-collapse-width {
                width: 60px
            }
            .tools {
                padding: 5px 23px 0 23px;
                width: 14px;
                height: 60px;
                line-height: 60px;
                cursor: pointer;
            }
        }
        .main {
            display: flex; // background: #324057;
            position: absolute;
            top: 60px;
            bottom: 0px;
            overflow: hidden;
            aside {
                flex: 0 0 230px;
                width: 230px; // position: absolute;
                // top: 0px;
                // bottom: 0px;
                .el-menu {
                    height: 100%;
                    width: 230px;
                }
                .collapsed {
                    width: 60px;
                    .item {
                        position: relative;
                    }
                    .submenu {
                        position: absolute;
                        top: 0px;
                        left: 60px;
                        z-index: 99999;
                        height: auto;
                        display: none;
                    }
                }
            }
            .menu-collapsed {
                flex: 0 0 60px;
                width: 60px;
            }
            .menu-expanded {
                flex: 0 0 230px;
                width: 230px;
            }
            .content-container {
                // background: #f1f2f7;
                flex: 1; // position: absolute;
                // right: 0px;
                // top: 0px;
                // bottom: 0px;
                // left: 230px;
                overflow-y: scroll;
                padding: 20px;
                .breadcrumb-container {
                    //margin-bottom: 15px;
                    .title {
                        width: 200px;
                        float: left;
                        color: #475669;
                    }
                    .breadcrumb-inner {
                        float: right;
                    }
                }
                .content-wrapper {
                    background-color: #fff;
                    box-sizing: border-box;
                }
            }
        }
    }

    .el-menu-vertical-demo {
        /*width: 230px !important;*/
    }

    .scroll {
        overflow: hidden;
    }

    .scroll ul {
        width: 250px !important;
        overflow-y: scroll !important;
        li {
            width: 233px;
        }
    }

    .guan {
        width: 60px !important;
    }
</style>