<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户名" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="请输入邮箱"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="用户状态"
          clearable
          style="width: 240px"
        >
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['frontend:customer:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户ID" align="center" key="customerId" prop="customerId" />
      <el-table-column label="用户名" align="center" key="userName" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="昵称" align="center" key="nickName" prop="nickName" :show-overflow-tooltip="true" />
      <el-table-column label="邮箱" align="center" key="email" prop="email" :show-overflow-tooltip="true" />
      <el-table-column label="手机号" align="center" key="phonenumber" prop="phonenumber" width="120" />
      <el-table-column label="性别" align="center" key="sex">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.sex" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" key="status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
            v-hasPermi="['frontend:customer:edit']"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后登录" align="center" prop="loginDate" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录IP" align="center" prop="loginIp" width="130" />
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="查看详情" placement="top" v-hasPermi="['frontend:customer:detail']">
            <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-hasPermi="['frontend:customer:remove']">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 用户详情对话框 -->
    <el-dialog :title="'用户详情'" v-model="detailOpen" width="600px" append-to-body>
      <el-descriptions :column="2" border v-if="customerDetail">
        <el-descriptions-item label="用户ID">{{ customerDetail.customerId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ customerDetail.userName }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ customerDetail.nickName }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ customerDetail.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ customerDetail.phonenumber }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          <dict-tag :options="sys_user_sex" :value="customerDetail.sex" />
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="customerDetail.status === '0' ? 'success' : 'danger'">
            {{ customerDetail.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ parseTime(customerDetail.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="最后登录时间" :span="2">
          {{ parseTime(customerDetail.loginDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="登录IP">{{ customerDetail.loginIp }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ customerDetail.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Customer">
import { listCustomer, getCustomer, delCustomer, changeCustomerStatus } from "@/api/frontend/customer";

const { proxy } = getCurrentInstance();
const { sys_user_sex } = proxy.useDict("sys_user_sex");

const customerList = ref([]);
const detailOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const customerDetail = ref(null);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  userName: undefined,
  email: undefined,
  phone: undefined,
  status: undefined
});

/** 查询前端用户列表 */
function getList() {
  loading.value = true;
  listCustomer(queryParams.value).then(response => {
    customerList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.customerId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 用户状态修改 */
function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.userName + '"用户吗?').then(function() {
    return changeCustomerStatus(row.customerId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function() {
    row.status = row.status === "0" ? "1" : "0";
  });
}

/** 查看详情按钮操作 */
function handleView(row) {
  const customerId = row.customerId;
  getCustomer(customerId).then(response => {
    customerDetail.value = response.data;
    detailOpen.value = true;
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const customerIds = row.customerId || ids.value;
  proxy.$modal.confirm('是否确认删除前端用户编号为"' + customerIds + '"的数据项？').then(function() {
    return delCustomer(customerIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>

