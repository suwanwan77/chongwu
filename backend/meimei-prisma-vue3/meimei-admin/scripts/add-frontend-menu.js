const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始添加前端用户管理菜单...\n');

    // 1. 添加一级菜单：前端管理
    const parentMenu = await prisma.sysMenu.create({
      data: {
        menuName: '前端管理',
        parentId: null,
        orderNum: 5,
        path: 'frontend',
        component: null,
        isFrame: '1',
        isCache: '0',
        menuType: 'M',
        visible: '0',
        status: '0',
        perms: '',
        icon: 'user',
        createBy: 'admin',
        createTime: new Date(),
        remark: '前端用户管理目录',
      },
    });

    console.log(`✅ 创建一级菜单成功: ${parentMenu.menuName} (ID: ${parentMenu.menuId})`);

    // 2. 添加二级菜单：前端用户
    const customerMenu = await prisma.sysMenu.create({
      data: {
        menuName: '前端用户',
        parentId: parentMenu.menuId,
        orderNum: 1,
        path: 'customer',
        component: 'frontend/customer/index',
        isFrame: '1',
        isCache: '0',
        menuType: 'C',
        visible: '0',
        status: '0',
        perms: 'frontend:customer:list',
        icon: 'peoples',
        createBy: 'admin',
        createTime: new Date(),
        remark: '前端用户管理菜单',
      },
    });

    console.log(`✅ 创建二级菜单成功: ${customerMenu.menuName} (ID: ${customerMenu.menuId})`);

    // 3. 添加按钮权限
    const buttons = [
      {
        menuName: '前端用户查询',
        orderNum: 1,
        perms: 'frontend:customer:query',
        remark: '',
      },
      {
        menuName: '前端用户详情',
        orderNum: 2,
        perms: 'frontend:customer:detail',
        remark: '',
      },
      {
        menuName: '前端用户修改',
        orderNum: 3,
        perms: 'frontend:customer:edit',
        remark: '',
      },
      {
        menuName: '前端用户删除',
        orderNum: 4,
        perms: 'frontend:customer:remove',
        remark: '',
      },
    ];

    for (const button of buttons) {
      const buttonMenu = await prisma.sysMenu.create({
        data: {
          menuName: button.menuName,
          parentId: customerMenu.menuId,
          orderNum: button.orderNum,
          path: '#',
          component: '',
          isFrame: '1',
          isCache: '0',
          menuType: 'F',
          visible: '0',
          status: '0',
          perms: button.perms,
          icon: '#',
          createBy: 'admin',
          createTime: new Date(),
          remark: button.remark,
        },
      });

      console.log(`✅ 创建按钮权限成功: ${buttonMenu.menuName} (${buttonMenu.perms})`);
    }

    console.log('\n🎉 所有菜单添加成功！');
    console.log('\n请刷新后台管理页面，然后在"系统管理 → 菜单管理"中查看新添加的菜单。');
    console.log('如果看不到，请退出登录后重新登录。\n');

  } catch (error) {
    console.error('❌ 添加菜单失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

