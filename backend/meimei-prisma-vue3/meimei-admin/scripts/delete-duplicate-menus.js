const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始删除重复的前端管理菜单...\n');

    // 删除第二组的按钮权限 (ID: 1070-1073)
    const deleteButtons = await prisma.sysMenu.deleteMany({
      where: {
        menuId: {
          in: [1070, 1071, 1072, 1073],
        },
      },
    });
    console.log(`✅ 删除了 ${deleteButtons.count} 个重复的按钮权限`);

    // 删除第二组的"前端用户"菜单 (ID: 1069)
    const deleteCustomerMenu = await prisma.sysMenu.delete({
      where: {
        menuId: 1069,
      },
    });
    console.log(`✅ 删除了重复的"前端用户"菜单 (ID: ${deleteCustomerMenu.menuId})`);

    // 删除第二组的"前端管理"菜单 (ID: 1068)
    const deleteFrontendMenu = await prisma.sysMenu.delete({
      where: {
        menuId: 1068,
      },
    });
    console.log(`✅ 删除了重复的"前端管理"菜单 (ID: ${deleteFrontendMenu.menuId})`);

    console.log('\n🎉 重复菜单删除成功！');
    console.log('\n保留的菜单：');
    console.log('  - 前端管理 (ID: 1061)');
    console.log('    - 前端用户 (ID: 1062)');
    console.log('      - 前端用户查询 (ID: 1063)');
    console.log('      - 前端用户详情 (ID: 1064)');
    console.log('      - 前端用户修改 (ID: 1065)');
    console.log('      - 前端用户删除 (ID: 1066)');
    console.log('\n请刷新后台管理页面查看！\n');

  } catch (error) {
    console.error('❌ 删除失败:', error);
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

