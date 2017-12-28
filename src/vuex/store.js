import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'

Vue.use(Vuex)

// 应用初始状态
const state = {
    // count: 10;
    extra: ''
}

// 定义所需的 mutations
const mutations = {
    // INCREMENT(state) {
    //     state.count++
    // },
    // DECREMENT(state) {
    //     state.count--
    // }
    //     export default {
    //     INCREMENT(state,payload) {
    //         state.urlArr = payload
    //     }
    // }
    EXTRA(state) {

    }
}

// 创建 store 实例
export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations
})