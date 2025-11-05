import request from '@/utils/request'

// 查询前端用户列表
export function listCustomer(query) {
  return request({
    url: '/api/frontend/auth/customers/list',
    method: 'get',
    params: query
  })
}

// 查询前端用户详细
export function getCustomer(customerId) {
  return request({
    url: '/api/frontend/auth/customers/' + customerId,
    method: 'get'
  })
}

// 修改前端用户状态
export function changeCustomerStatus(customerId, status) {
  const data = {
    customerId,
    status
  }
  return request({
    url: '/api/frontend/auth/customers/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除前端用户
export function delCustomer(customerIds) {
  return request({
    url: '/api/frontend/auth/customers/' + customerIds,
    method: 'delete'
  })
}

