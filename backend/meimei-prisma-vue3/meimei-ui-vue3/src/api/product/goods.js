import request from '@/utils/request'

// 查询商品列表
export function listProduct(query) {
  return request({
    url: '/system/product/list',
    method: 'get',
    params: query
  })
}

// 查询商品详细
export function getProduct(productId) {
  return request({
    url: '/system/product/' + productId,
    method: 'get'
  })
}

// 新增商品
export function addProduct(data) {
  return request({
    url: '/system/product',
    method: 'post',
    data: data
  })
}

// 修改商品
export function updateProduct(data) {
  return request({
    url: '/system/product/' + data.productId,
    method: 'put',
    data: data
  })
}

// 删除商品
export function delProduct(productId) {
  return request({
    url: '/system/product/' + productId,
    method: 'delete'
  })
}

// 批量更新商品位置
export function updateProductPositions(data) {
  return request({
    url: '/system/product/position/batch',
    method: 'post',
    data: data
  })
}

// 获取指定位置的商品列表
export function getProductsByPosition(position) {
  return request({
    url: '/system/product/position/' + position,
    method: 'get'
  })
}

