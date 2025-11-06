<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单号" prop="orderNumber">
        <el-input
          v-model="queryParams.orderNumber"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="订单状态" clearable>
          <el-option label="待支付" value="0" />
          <el-option label="待发货" value="1" />
          <el-option label="已发货" value="2" />
          <el-option label="已完成" value="3" />
          <el-option label="已关闭" value="4" />
          <el-option label="已取消" value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付状态" prop="paymentStatus">
        <el-select v-model="queryParams.paymentStatus" placeholder="支付状态" clearable>
          <el-option label="未支付" value="0" />
          <el-option label="已支付" value="1" />
          <el-option label="已退款" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList">
      <el-table-column label="订单号" align="center" prop="orderNumber" width="180" />
      <el-table-column label="客户信息" align="center" width="150">
        <template #default="scope">
          <div>{{ scope.row.receiverName }}</div>
          <div>{{ scope.row.receiverPhone }}</div>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" align="center" prop="totalAmount" width="120">
        <template #default="scope">
          <span>NZD ${{ scope.row.totalAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" type="warning">待支付</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="primary">待发货</el-tag>
          <el-tag v-else-if="scope.row.status === '2'" type="info">已发货</el-tag>
          <el-tag v-else-if="scope.row.status === '3'" type="success">已完成</el-tag>
          <el-tag v-else-if="scope.row.status === '4'" type="info">已关闭</el-tag>
          <el-tag v-else-if="scope.row.status === '5'" type="danger">已取消</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="paymentStatus" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.paymentStatus === '0'" type="warning">未支付</el-tag>
          <el-tag v-else-if="scope.row.paymentStatus === '1'" type="success">已支付</el-tag>
          <el-tag v-else-if="scope.row.paymentStatus === '2'" type="info">已退款</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发货状态" align="center" prop="shippingStatus" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.shippingStatus === '0'" type="info">未发货</el-tag>
          <el-tag v-else-if="scope.row.shippingStatus === '1'" type="primary">已发货</el-tag>
          <el-tag v-else-if="scope.row.shippingStatus === '2'" type="success">已收货</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
          <el-button 
            v-if="scope.row.status === '1' && scope.row.paymentStatus === '1'"
            link 
            type="primary" 
            @click="handleShip(scope.row)"
          >发货</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 订单详情对话框 -->
    <el-dialog title="订单详情" v-model="openDetail" width="900px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ orderDetail.orderNumber }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag v-if="orderDetail.status === '0'" type="warning">待支付</el-tag>
          <el-tag v-else-if="orderDetail.status === '1'" type="primary">待发货</el-tag>
          <el-tag v-else-if="orderDetail.status === '2'" type="info">已发货</el-tag>
          <el-tag v-else-if="orderDetail.status === '3'" type="success">已完成</el-tag>
          <el-tag v-else-if="orderDetail.status === '4'" type="info">已关闭</el-tag>
          <el-tag v-else-if="orderDetail.status === '5'" type="danger">已取消</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单金额">NZD ${{ orderDetail.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">NZD ${{ orderDetail.paymentAmount }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ orderDetail.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ orderDetail.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ orderDetail.shippingAddress }}</el-descriptions-item>
        <el-descriptions-item label="订单备注" :span="2">{{ orderDetail.remark || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(orderDetail.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ parseTime(orderDetail.paymentTime) || '未支付' }}</el-descriptions-item>
        <el-descriptions-item label="发货时间">{{ parseTime(orderDetail.shippingTime) || '未发货' }}</el-descriptions-item>
        <el-descriptions-item label="收货时间">{{ parseTime(orderDetail.receiveTime) || '未收货' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>订单商品</el-divider>
      <el-table :data="orderDetail.orderItems" border>
        <el-table-column label="商品图片" align="center" width="100">
          <template #default="scope">
            <image-preview :src="getImageUrl(scope.row.product?.mainImage, 'thumbnail_100')" :width="50" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center" prop="productName" />
        <el-table-column label="商品编码" align="center" prop="productCode" width="120" />
        <el-table-column label="单价" align="center" prop="price" width="100">
          <template #default="scope">
            <span>NZD ${{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" align="center" prop="quantity" width="80" />
        <el-table-column label="小计" align="center" prop="subtotal" width="120">
          <template #default="scope">
            <span>NZD ${{ scope.row.subtotal }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog title="订单发货" v-model="openShip" width="500px" append-to-body>
      <el-form ref="shipRef" :model="shipForm" :rules="shipRules" label-width="100px">
        <el-form-item label="物流公司" prop="shippingCompany">
          <el-input v-model="shipForm.shippingCompany" placeholder="请输入物流公司" />
        </el-form-item>
        <el-form-item label="物流单号" prop="trackingNumber">
          <el-input v-model="shipForm.trackingNumber" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitShip">确 定</el-button>
          <el-button @click="openShip = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, shipOrder } from "@/api/product/order";

const { proxy } = getCurrentInstance();

const orderList = ref([]);
const orderDetail = ref({});
const openDetail = ref(false);
const openShip = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

const data = reactive({
  queryParams: {
    page: 1,
    pageSize: 10,
    orderNumber: undefined,
    status: undefined,
    paymentStatus: undefined
  },
  shipForm: {
    orderId: undefined,
    shippingCompany: undefined,
    trackingNumber: undefined
  },
  shipRules: {
    shippingCompany: [{ required: true, message: "物流公司不能为空", trigger: "blur" }],
    trackingNumber: [{ required: true, message: "物流单号不能为空", trigger: "blur" }]
  }
});

const { queryParams, shipForm, shipRules } = toRefs(data);

/** 获取图片URL */
function getImageUrl(imageJson, size = 'thumbnail_100') {
  if (!imageJson) return '';
  try {
    const imageObj = typeof imageJson === 'string' ? JSON.parse(imageJson) : imageJson;
    return imageObj[size] || imageObj.original || '';
  } catch (e) {
    return imageJson;
  }
}

/** 查询订单列表 */
function getList() {
  loading.value = true;
  listOrder(queryParams.value).then(response => {
    orderList.value = response.data.list;
    total.value = response.data.total;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.page = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 查看订单详情 */
function handleView(row) {
  getOrder(row.orderId).then(response => {
    orderDetail.value = response.data;
    openDetail.value = true;
  });
}

/** 发货操作 */
function handleShip(row) {
  shipForm.value.orderId = row.orderId;
  shipForm.value.shippingCompany = undefined;
  shipForm.value.trackingNumber = undefined;
  openShip.value = true;
}

/** 提交发货 */
function submitShip() {
  proxy.$refs["shipRef"].validate(valid => {
    if (valid) {
      shipOrder(shipForm.value).then(response => {
        proxy.$modal.msgSuccess("发货成功");
        openShip.value = false;
        getList();
      });
    }
  });
}

getList();
</script>

