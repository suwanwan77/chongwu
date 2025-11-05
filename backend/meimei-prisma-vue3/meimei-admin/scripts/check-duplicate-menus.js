const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('查询"前端管理"相关菜单...\n');

    // 查询所有"前端管理"菜单
    const frontendMenus = await prisma.sysMenu.findMany({
      where: {
        menuName: '前端管理',
      },
      orderBy: {
        menuId: 'asc',
      },
    });

    console.log('找到的"前端管理"菜单：');
    frontendMenus.forEach(menu => {
      console.log(`  ID: ${menu.menuId}, 名称: ${menu.menuName}, 创建时间: ${menu.createTime}`);
    });

    // 查询所有"前端用户"菜单
    const customerMenus = await prisma.sysMenu.findMany({
      where: {
        menuName: '前端用户',
      },
      orderBy: {
        menuId: 'asc',
      },
    });

    console.log('\n找到的"前端用户"菜单：');
    customerMenus.forEach(menu => {
      console.log(`  ID: ${menu.menuId}, 名称: ${menu.menuName}, 父菜单ID: ${menu.parentId}, 创建时间: ${menu.createTime}`);
    });

    // 查询所有按钮权限
    const buttonMenus = await prisma.sysMenu.findMany({
      where: {
        menuType: 'F',
        menuName: {
          startsWith: '前端用户',
        },
      },
      orderBy: {
        menuId: 'asc',
      },
    });

    console.log('\n找到的按钮权限：');
    buttonMenus.forEach(menu => {
      console.log(`  ID: ${menu.menuId}, 名称: ${menu.menuName}, 父菜单ID: ${menu.parentId}, 权限: ${menu.perms}`);
    });

    console.log('\n建议：');
    if (frontendMenus.length > 1) {
      console.log(`⚠️  发现 ${frontendMenus.length} 个重复的"前端管理"菜单`);
      console.log(`   保留 ID: ${frontendMenus[0].menuId}，删除其他的`);
    }

  } catch (error) {
    console.error('❌ 查询失败:', error);
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

