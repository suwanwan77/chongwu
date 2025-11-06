import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/system/product/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单详细
export function getOrder(orderId) {
  return request({
    url: '/system/product/order/' + orderId,
    method: 'get'
  })
}

// 订单发货
export function shipOrder(data) {
  return request({
    url: '/system/product/order/ship',
    method: 'post',
    data: data
  })
}

// 更新订单状态
export function updateOrderStatus(data) {
  return request({
    url: '/system/product/order/status',
    method: 'put',
    data: data
  })
}

