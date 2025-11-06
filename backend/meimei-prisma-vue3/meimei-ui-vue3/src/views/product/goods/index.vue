<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品分类" prop="categoryId">
        <el-tree-select
          v-model="queryParams.categoryId"
          :data="categoryOptions"
          :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
          value-key="categoryId"
          placeholder="请选择商品分类"
          check-strictly
          clearable
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="商品状态" clearable>
          <el-option label="上架" value="0" />
          <el-option label="下架" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品主图" align="center" prop="mainImage" width="100">
        <template #default="scope">
          <image-preview :src="getImageUrl(scope.row.mainImage, 'thumbnail_150')" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" prop="productName" :show-overflow-tooltip="true" />
      <el-table-column label="商品编码" align="center" prop="productCode" width="120" />
      <el-table-column label="分类" align="center" prop="category.categoryName" width="120" />
      <el-table-column label="价格" align="center" prop="price" width="100">
        <template #default="scope">
          <span>NZD ${{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存" align="center" prop="stock" width="80" />
      <el-table-column label="销量" align="center" prop="salesCount" width="80" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="精选" align="center" prop="isFeatured" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.isFeatured === 1" type="success">是</el-tag>
          <el-tag v-else type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 添加或修改商品对话框 -->
    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="productRef" :model="form" :rules="rules" label-width="100px">
        <el-tabs v-model="activeName">
          <el-tab-pane label="基本信息" name="basic">
            <el-row>
              <el-col :span="12">
                <el-form-item label="商品名称" prop="productName">
                  <el-input v-model="form.productName" placeholder="请输入商品名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="商品编码" prop="productCode">
                  <el-input v-model="form.productCode" placeholder="请输入商品编码" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="商品分类" prop="categoryId">
                  <el-tree-select
                    v-model="form.categoryId"
                    :data="categoryOptions"
                    :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
                    value-key="categoryId"
                    placeholder="请选择商品分类"
                    check-strictly
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="商品标签" prop="tags">
                  <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="销售价格" prop="price">
                  <el-input-number v-model="form.price" :precision="2" :min="0" :max="999999" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="原价" prop="originalPrice">
                  <el-input-number v-model="form.originalPrice" :precision="2" :min="0" :max="999999" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="成本价" prop="costPrice">
                  <el-input-number v-model="form.costPrice" :precision="2" :min="0" :max="999999" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="库存" prop="stock">
                  <el-input-number v-model="form.stock" :min="0" :max="999999" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单位" prop="unit">
                  <el-input v-model="form.unit" placeholder="如：件、盒、袋" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="重量(kg)" prop="weight">
                  <el-input-number v-model="form.weight" :precision="2" :min="0" :max="999999" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="简短描述" prop="shortDescription">
                  <el-input v-model="form.shortDescription" type="textarea" :rows="3" placeholder="请输入简短描述" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="images">
            <el-row>
              <el-col :span="24">
                <el-form-item label="商品主图">
                  <image-upload v-model="form.mainImage" :limit="1" />
                  <div class="el-upload__tip">建议上传800x800px的正方形图片，系统会自动生成多个尺寸</div>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="商品多图">
                  <image-upload v-model="form.images" :limit="10" />
                  <div class="el-upload__tip">最多上传10张图片，建议上传800x800px的正方形图片</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="详细信息" name="detail">
            <el-row>
              <el-col :span="24">
                <el-form-item label="商品详情" prop="description">
                  <editor v-model="form.description" :min-height="300" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="商品规格" prop="specifications">
                  <el-input v-model="form.specifications" type="textarea" :rows="5" placeholder="请输入商品规格，JSON格式" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="其他设置" name="other">
            <el-row>
              <el-col :span="12">
                <el-form-item label="商品状态">
                  <el-radio-group v-model="form.status">
                    <el-radio label="0">上架</el-radio>
                    <el-radio label="1">下架</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否精选">
                  <el-radio-group v-model="form.isFeatured">
                    <el-radio :label="1">是</el-radio>
                    <el-radio :label="0">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否新品">
                  <el-radio-group v-model="form.isNew">
                    <el-radio :label="1">是</el-radio>
                    <el-radio :label="0">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否热销">
                  <el-radio-group v-model="form.isHot">
                    <el-radio :label="1">是</el-radio>
                    <el-radio :label="0">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="显示位置" prop="displayPosition">
                  <el-checkbox-group v-model="displayPositionArray">
                    <el-checkbox label="home_featured">首页精选</el-checkbox>
                    <el-checkbox label="shop_list">商品列表</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="显示排序" prop="displayOrder">
                  <el-input-number v-model="form.displayOrder" :min="0" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序" prop="sort">
                  <el-input-number v-model="form.sort" :min="0" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Product">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/product/goods";
import { listCategory } from "@/api/product/category";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const productList = ref([]);
const categoryOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const activeName = ref("basic");
const displayPositionArray = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    page: 1,
    pageSize: 10,
    productName: undefined,
    categoryId: undefined,
    status: undefined
  },
  rules: {
    productName: [{ required: true, message: "商品名称不能为空", trigger: "blur" }],
    productCode: [{ required: true, message: "商品编码不能为空", trigger: "blur" }],
    categoryId: [{ required: true, message: "商品分类不能为空", trigger: "change" }],
    price: [{ required: true, message: "销售价格不能为空", trigger: "blur" }],
    stock: [{ required: true, message: "库存不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 获取图片URL */
function getImageUrl(imageJson, size = 'medium_600') {
  if (!imageJson) return '';
  try {
    const imageObj = typeof imageJson === 'string' ? JSON.parse(imageJson) : imageJson;
    return imageObj[size] || imageObj.original || '';
  } catch (e) {
    return imageJson;
  }
}

/** 查询商品列表 */
function getList() {
  loading.value = true;
  listProduct(queryParams.value).then(response => {
    productList.value = response.data.list;
    total.value = response.data.total;
    loading.value = false;
  });
}

/** 查询分类下拉树结构 */
function getCategoryTree() {
  listCategory().then(response => {
    categoryOptions.value = proxy.handleTree(response.data, "categoryId");
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    productId: undefined,
    productName: undefined,
    productCode: undefined,
    categoryId: undefined,
    tags: undefined,
    price: 0,
    originalPrice: undefined,
    costPrice: undefined,
    stock: 0,
    unit: "件",
    weight: undefined,
    mainImage: undefined,
    images: undefined,
    shortDescription: undefined,
    description: undefined,
    specifications: undefined,
    status: "0",
    isFeatured: 0,
    isNew: 0,
    isHot: 0,
    displayPosition: undefined,
    displayOrder: 0,
    sort: 0
  };
  displayPositionArray.value = [];
  proxy.resetForm("productRef");
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

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.productId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  getCategoryTree();
  open.value = true;
  title.value = "添加商品";
  activeName.value = "basic";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  getCategoryTree();
  const productId = row.productId || ids.value[0];
  getProduct(productId).then(response => {
    form.value = response.data;
    // 解析displayPosition
    if (form.value.displayPosition) {
      displayPositionArray.value = form.value.displayPosition.split(',');
    }
    open.value = true;
    title.value = "修改商品";
    activeName.value = "basic";
  });
}

/** 提交按钮 */
function submitForm() {
  // 合并displayPosition
  form.value.displayPosition = displayPositionArray.value.join(',');
  
  proxy.$refs["productRef"].validate(valid => {
    if (valid) {
      if (form.value.productId != undefined) {
        updateProduct(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProduct(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const productIds = row.productId || ids.value;
  proxy.$modal.confirm('是否确认删除商品编号为"' + productIds + '"的数据项？').then(function () {
    return delProduct(productIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>

