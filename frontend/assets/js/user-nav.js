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
    // 查找导航栏中的账户区域
    const accountContainers = document.querySelectorAll('.site-header-account');

    accountContainers.forEach(container => {
      const link = container.querySelector('a[href*="my-account"]');
      if (!link) return;

      const contentSpan = link.querySelector('.content-content');
      if (!contentSpan) return;

      // 检查是否是"Sign In"文本
      if (contentSpan.textContent.trim() === 'Sign In') {
        // 使用 nickName 或 userName 或 email
        const displayName = userInfo.nickName || userInfo.userName || userInfo.email || 'User';
        contentSpan.textContent = displayName;

        // 查找图标元素
        const iconDiv = link.querySelector('.icon');
        if (iconDiv) {
          const iconElement = iconDiv.querySelector('i');
          if (iconElement) {
            // 替换图标为头像
            const avatarUrl = userInfo.avatar || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';

            // 创建头像图片
            const avatar = document.createElement('img');
            avatar.src = avatarUrl;
            avatar.alt = displayName;
            avatar.style.cssText = `
              width: 20px;
              height: 20px;
              border-radius: 50%;
              object-fit: cover;
              vertical-align: middle;
            `;

            // 替换图标
            iconElement.replaceWith(avatar);
          }
        }

        // 添加下拉菜单
        const dropdown = container.querySelector('.account-dropdown');
        if (dropdown && dropdown.children.length === 0) {
          dropdown.innerHTML = `
            <div style="
              position: absolute;
              top: 100%;
              right: 0;
              background: white;
              border: 1px solid #ddd;
              border-radius: 4px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              min-width: 150px;
              z-index: 1000;
              margin-top: 10px;
              display: none;
            " class="user-dropdown-menu">
              <a href="/Personal-Center/" style="
                display: block;
                padding: 10px 15px;
                color: #333;
                text-decoration: none;
                border-bottom: 1px solid #eee;
              " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">
                Personal Center
              </a>
              <a href="/my-account/" style="
                display: block;
                padding: 10px 15px;
                color: #333;
                text-decoration: none;
                border-bottom: 1px solid #eee;
              " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">
                My Orders
              </a>
              <a href="#" class="logout-link" style="
                display: block;
                padding: 10px 15px;
                color: #333;
                text-decoration: none;
              " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">
                Logout
              </a>
            </div>
          `;

          // 添加鼠标悬停事件
          container.addEventListener('mouseenter', () => {
            const menu = dropdown.querySelector('.user-dropdown-menu');
            if (menu) menu.style.display = 'block';
          });

          container.addEventListener('mouseleave', () => {
            const menu = dropdown.querySelector('.user-dropdown-menu');
            if (menu) menu.style.display = 'none';
          });

          // 添加登出事件
          const logoutLink = dropdown.querySelector('.logout-link');
          if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
              e.preventDefault();
              handleLogout();
            });
          }
        }
      }
    });
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

