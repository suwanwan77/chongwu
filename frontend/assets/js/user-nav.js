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
      // 检查是否已经更新过
      if (container.dataset.userNavUpdated === 'true') return;

      const link = container.querySelector('a[href*="my-account"]');
      if (!link) return;

      const contentSpan = link.querySelector('.content-content');
      if (!contentSpan) return;

      // 检查是否是"Sign In"文本
      const currentText = contentSpan.textContent.trim();
      if (currentText === 'Sign In') {
        // 使用 nickName 或 userName 或 email
        const displayName = userInfo.nickName || userInfo.userName || userInfo.email || 'User';

        // 设置昵称，如果太长则截断
        contentSpan.textContent = displayName;
        contentSpan.title = displayName; // 鼠标悬浮显示完整昵称
        contentSpan.style.cssText = `
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          vertical-align: middle;
        `;

        // 修改链接指向个人中心
        link.href = '/Personal-Center/';

        // 移除下拉菜单（如果存在）
        const dropdown = container.querySelector('.account-dropdown');
        if (dropdown) {
          dropdown.innerHTML = '';
          dropdown.style.display = 'none';
        }

        // 查找图标元素
        const iconDiv = link.querySelector('.icon');
        if (iconDiv) {
          const iconElement = iconDiv.querySelector('i, img');
          if (iconElement) {
            // 默认头像SVG - 使用橄榄绿色 #5C7524
            const defaultAvatarSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%235C7524"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';

            // 如果有上传头像则使用上传的，否则使用默认头像
            const avatarUrl = userInfo.avatar || defaultAvatarSvg;

            // 创建头像图片
            const avatar = document.createElement('img');
            avatar.src = avatarUrl;
            avatar.alt = displayName;
            avatar.className = 'user-avatar-nav';

            // 所有头像都是28px圆形
            avatar.style.cssText = `
              width: 28px;
              height: 28px;
              border-radius: 50%;
              object-fit: cover;
              vertical-align: middle;
              display: inline-block;
            `;

            // 替换图标
            iconElement.replaceWith(avatar);
          }
        }

        // 标记已更新，避免重复处理
        container.dataset.userNavUpdated = 'true';
      }
    });
  }



  /**
   * 更新未登录状态的导航栏
   */
  function updateLoggedOutNav() {
    // 查找导航栏中的账户区域
    const accountContainers = document.querySelectorAll('.site-header-account');

    accountContainers.forEach(container => {
      const link = container.querySelector('a[href*="my-account"]');
      if (!link) return;

      const contentSpan = link.querySelector('.content-content');
      if (!contentSpan) return;

      // 重置为"Sign In"
      contentSpan.textContent = 'Sign In';
      contentSpan.title = '';
      contentSpan.style.cssText = '';

      // 重置链接
      link.href = '/my-account/';

      // 清除更新标记
      container.dataset.userNavUpdated = 'false';

      // 添加下拉菜单
      const dropdown = container.querySelector('.account-dropdown');
      if (dropdown) {
        dropdown.innerHTML = `
          <div class="account-dropdown-content" style="
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            min-width: 150px;
            z-index: 1000;
            margin-top: 5px;
          ">
            <a href="/my-account/" style="
              display: block;
              padding: 10px 15px;
              color: #333;
              text-decoration: none;
              border-bottom: 1px solid #f0f0f0;
            ">Sign In</a>
            <a href="/register/" style="
              display: block;
              padding: 10px 15px;
              color: #333;
              text-decoration: none;
            ">Register</a>
          </div>
        `;

        // 添加鼠标悬浮事件
        container.addEventListener('mouseenter', function() {
          const dropdownContent = dropdown.querySelector('.account-dropdown-content');
          if (dropdownContent) {
            dropdownContent.style.display = 'block';
          }
        });

        container.addEventListener('mouseleave', function() {
          const dropdownContent = dropdown.querySelector('.account-dropdown-content');
          if (dropdownContent) {
            dropdownContent.style.display = 'none';
          }
        });

        // 添加链接悬浮效果
        const dropdownLinks = dropdown.querySelectorAll('a');
        dropdownLinks.forEach(link => {
          link.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f5f5f5';
          });
          link.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
          });
        });
      }
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

