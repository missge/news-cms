export const increment = ({commit}) => {
    commit('INCREMENT')
}
export const decrement = ({commit}) => {
    commit('DECREMENT')
}
export const urlarr = ({commit},payload) => {
    commit('URLARR',payload)
}

// import * as types from './mutation-types'

// export default {
//     [types.URLDATA] ({commit},payload) {
//         commit(types.URLDATA,payload)
//     }
// }