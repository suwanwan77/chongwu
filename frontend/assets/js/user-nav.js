/**
 * 用户导航栏状态管理
 * 根据登录状态更新导航栏显示
 */

(function() {
  'use strict';

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // 检查AuthService是否存在
    if (typeof AuthService === 'undefined') {
      console.warn('AuthService not loaded, user nav will not update');
      return;
    }

    updateUserNav();
  }

  /**
   * 更新用户导航栏（异步）
   */
  async function updateUserNav() {
    const isLoggedIn = AuthService.isLoggedIn();

    console.log('Updating user nav - isLoggedIn:', isLoggedIn);

    if (isLoggedIn) {
      // 已登录状态 - 从API获取用户信息
      try {
        const userInfo = await AuthService.getUserInfo();
        console.log('User info for nav:', userInfo);

        if (userInfo) {
          updateLoggedInNav(userInfo);
        } else {
          updateLoggedOutNav();
        }
      } catch (error) {
        console.error('Failed to get user info for nav:', error);
        updateLoggedOutNav();
      }
    } else {
      // 未登录状态
      updateLoggedOutNav();
    }
  }

  /**
   * 更新已登录状态的导航栏
   * @param {Object} userInfo - 用户信息
   */
  function updateLoggedInNav(userInfo) {
    // 查找所有登录链接
    const loginLinks = document.querySelectorAll('a[href*="my-account"]');

    loginLinks.forEach(link => {
      // 如果链接文本是"Sign In"或"Login"，替换为用户名
      const linkText = link.textContent.trim();
      if (linkText === 'Sign In' || linkText === 'Login' || linkText === '登录') {
        // 创建下拉菜单
        const dropdown = createUserDropdown(userInfo);

        // 替换链接为下拉菜单
        if (link.parentElement) {
          link.parentElement.replaceChild(dropdown, link);
        }
      }
    });

    // 更新导航栏中的"Sign In"文本
    const signInElements = document.querySelectorAll('.elementor-icon-list-text');
    signInElements.forEach(element => {
      if (element.textContent.trim() === 'Sign In') {
        // 使用 userName 或 nickName 或 email
        const displayName = userInfo.userName || userInfo.nickName || userInfo.email || 'User';
        element.textContent = displayName;

        // 添加点击事件跳转到个人中心
        element.style.cursor = 'pointer';
        element.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = '/Personal-Center/';
        });
      }
    });
  }

  /**
   * 创建用户下拉菜单
   * @param {Object} userInfo - 用户信息
   * @returns {HTMLElement} 下拉菜单元素
   */
  function createUserDropdown(userInfo) {
    const container = document.createElement('div');
    container.className = 'user-dropdown-container';
    container.style.cssText = 'position: relative; display: inline-block;';

    // 用户名按钮
    const button = document.createElement('button');
    button.className = 'user-dropdown-button';
    // 使用 userName 或 nickName 或 email
    const displayName = userInfo.userName || userInfo.nickName || userInfo.email || 'User';
    button.textContent = displayName;
    button.style.cssText = `
      background: none;
      border: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 5px;
    `;

    // 下拉图标
    const icon = document.createElement('i');
    icon.className = 'fas fa-chevron-down';
    icon.style.fontSize = '0.8em';
    button.appendChild(icon);

    // 下拉菜单
    const menu = document.createElement('div');
    menu.className = 'user-dropdown-menu';
    menu.style.cssText = `
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-width: 150px;
      z-index: 1000;
      margin-top: 5px;
    `;

    // 菜单项
    const menuItems = [
      { text: 'Personal Center', href: '/Personal-Center/' },
      { text: 'My Orders', href: '/my-account/' },
      { text: 'Logout', href: '#', onClick: handleLogout },
    ];

    menuItems.forEach(item => {
      const menuItem = document.createElement('a');
      menuItem.href = item.href;
      menuItem.textContent = item.text;
      menuItem.style.cssText = `
        display: block;
        padding: 10px 15px;
        color: #333;
        text-decoration: none;
        transition: background 0.2s;
      `;

      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.background = '#f5f5f5';
      });

      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.background = 'white';
      });

      if (item.onClick) {
        menuItem.addEventListener('click', (e) => {
          e.preventDefault();
          item.onClick();
        });
      }

      menu.appendChild(menuItem);
    });

    // 切换下拉菜单
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = menu.style.display === 'block';
      menu.style.display = isVisible ? 'none' : 'block';
    });

    // 点击外部关闭菜单
    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });

    container.appendChild(button);
    container.appendChild(menu);

    return container;
  }

  /**
   * 更新未登录状态的导航栏
   */
  function updateLoggedOutNav() {
    // 确保显示登录链接
    const loginLinks = document.querySelectorAll('a[href*="my-account"]');
    loginLinks.forEach(link => {
      link.style.display = '';
    });
  }

  /**
   * 处理登出
   */
  async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await AuthService.logout();
        console.log('Logout successful');
        
        // 跳转到首页
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed, please try again');
      }
    }
  }

  // 导出到全局（如果需要）
  window.UserNav = {
    update: updateUserNav,
  };
})();

