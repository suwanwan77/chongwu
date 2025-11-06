/**
 * 用户导航栏状态管理
 * 根据登录状态更新导航栏显示
 */

console.log('🔄 Loading user-nav.js...');

(function() {
  'use strict';

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    console.log('user-nav.js: DOM is loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    console.log('user-nav.js: DOM already loaded, initializing immediately...');
    init();
  }

  function init() {
    console.log('user-nav.js: init() called');

    // 检查AuthService是否存在
    if (typeof AuthService === 'undefined') {
      console.warn('AuthService not loaded, user nav will not update');
      return;
    }

    console.log('user-nav.js: AuthService found, setting up...');
    updateUserNav();
    // 下拉登录表单已删除，不再需要 setupLoginFormHandler
  }

  /**
   * 更新用户导航栏（异步）
   */
  async function updateUserNav() {
    const isLoggedIn = AuthService.isLoggedIn();

    console.log('📊 Updating user nav - isLoggedIn:', isLoggedIn);

    if (isLoggedIn) {
      // 已登录状态 - 从API获取用户信息
      try {
        console.log('🔍 Fetching user info from API...');
        const userInfo = await AuthService.getUserInfo();
        console.log('👤 User info for nav:', {
          nickName: userInfo?.nickName,
          userName: userInfo?.userName,
          email: userInfo?.email,
          hasAvatar: !!userInfo?.avatar,
          avatarPreview: userInfo?.avatar ? userInfo.avatar.substring(0, 50) + '...' : 'none'
        });

        if (userInfo) {
          console.log('✅ Calling updateLoggedInNav with user info');
          updateLoggedInNav(userInfo);
        } else {
          console.warn('⚠️ No user info, showing logged out nav');
          updateLoggedOutNav();
        }
      } catch (error) {
        console.error('❌ Failed to get user info for nav:', error);
        updateLoggedOutNav();
      }
    } else {
      // 未登录状态
      console.log('👋 User not logged in, showing logged out nav');
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

    accountContainers.forEach(originalContainer => {
      const link = originalContainer.querySelector('a[href*="my-account"]');
      if (!link) return;

      const contentSpan = link.querySelector('.content-content');
      if (!contentSpan) return;

      // 检查是否是"Sign In"文本或者已经是用户信息（需要更新头像）
      const currentText = contentSpan.textContent.trim();
      const isSignIn = currentText === 'Sign In';
      const isAlreadyLoggedIn = originalContainer.dataset.userNavUpdated === 'true';

      // 如果已经是登录状态且标记为已更新，只更新头像和昵称，不重新创建整个结构
      if (isAlreadyLoggedIn && !isSignIn) {
        console.log('📝 Quick update: Updating avatar and nickname for already logged in user');

        // 更新昵称
        const displayName = userInfo.nickName || userInfo.userName || userInfo.email || 'User';
        console.log('Setting nickname to:', displayName);
        contentSpan.textContent = displayName;

        // 更新头像
        const iconDiv = link.querySelector('.icon');
        console.log('Icon div found:', !!iconDiv);
        if (iconDiv) {
          const avatarImg = iconDiv.querySelector('img.user-avatar-nav');
          console.log('Avatar img found:', !!avatarImg);
          if (avatarImg) {
            // 默认头像SVG - 使用橄榄绿色 #5C7524
            const defaultAvatarSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%235C7524"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';
            const avatarUrl = userInfo.avatar || defaultAvatarSvg;

            console.log('📸 Updating avatar src to:', avatarUrl.substring(0, 80) + '...');
            avatarImg.src = avatarUrl;
            console.log('✅ Avatar updated successfully');
          } else {
            console.warn('⚠️ Avatar img not found, will do full update');
          }
        }
        return;
      }

      // 如果不是"Sign In"但也没有标记为已更新（说明是forceUpdate后的状态），进行完整更新
      // 或者如果是"Sign In"，也进行完整的更新
      console.log('🔄 Full update needed. isSignIn:', isSignIn, 'isAlreadyLoggedIn:', isAlreadyLoggedIn);
      if (isSignIn || !isAlreadyLoggedIn) {
        // 使用 nickName 或 userName 或 email
        const displayName = userInfo.nickName || userInfo.userName || userInfo.email || 'User';
        console.log('🏷️ Display name:', displayName);

        // 克隆容器以移除所有事件监听器
        const container = originalContainer.cloneNode(true);
        originalContainer.parentNode.replaceChild(container, originalContainer);
        console.log('📦 Container cloned and replaced');

        // 重新获取元素引用
        const newLink = container.querySelector('a[href*="my-account"]');
        const newContentSpan = newLink.querySelector('.content-content');
        const accountContent = newLink.querySelector('.account-content');

        // 设置昵称，如果太长则截断
        newContentSpan.textContent = displayName;
        newContentSpan.style.cssText = `
          max-width: 60px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          display: inline-block !important;
          vertical-align: middle !important;
        `;

        // 确保父容器也有正确的样式
        if (accountContent) {
          accountContent.style.cssText = `
            max-width: 60px !important;
            overflow: hidden !important;
            display: inline-flex !important;
            align-items: center !important;
          `;
        }

        // 修改链接指向个人中心 - 使用绝对路径确保在所有页面都能正确跳转
        const personalCenterUrl = window.location.origin + '/Personal-Center/index.html';
        newLink.href = personalCenterUrl;
        console.log('🔗 Link updated to:', personalCenterUrl);

        // 移除下拉菜单（如果存在）
        const dropdown = container.querySelector('.account-dropdown');
        if (dropdown) {
          dropdown.innerHTML = '';
          dropdown.style.display = 'none';
        }

        // 查找图标元素
        const iconDiv = newLink.querySelector('.icon');
        console.log('🎨 Icon div found:', !!iconDiv);
        if (iconDiv) {
          const iconElement = iconDiv.querySelector('i, img');
          console.log('🖼️ Icon element found:', !!iconElement, 'Type:', iconElement?.tagName);
          if (iconElement) {
            // 默认头像SVG - 使用橄榄绿色 #5C7524
            const defaultAvatarSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%235C7524"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';

            // 如果有上传头像则使用上传的，否则使用默认头像
            const avatarUrl = userInfo.avatar || defaultAvatarSvg;
            console.log('📸 Avatar URL (full update):', {
              hasUserAvatar: !!userInfo.avatar,
              avatarPreview: avatarUrl.substring(0, 80) + '...',
              isDefault: avatarUrl === defaultAvatarSvg
            });

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

            console.log('🖼️ Created avatar img element, src:', avatar.src.substring(0, 80) + '...');

            // 替换图标
            iconElement.replaceWith(avatar);
            console.log('✅ Icon element replaced with avatar');
          } else {
            console.error('❌ Icon element not found in icon div');
          }
        } else {
          console.error('❌ Icon div not found in link');
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

      // 重置链接 - 使用绝对路径到登录页面
      // 使用绝对路径确保在所有页面都能正确跳转
      const loginPageUrl = window.location.origin + '/my-account/index.html';
      link.href = loginPageUrl;
      console.log('Set Sign In link to:', link.href);

      // 确保链接可以点击
      link.style.pointerEvents = 'auto';
      link.style.cursor = 'pointer';

      console.log('Final Sign In link href:', link.href);

      // 移除所有现有的点击事件监听器，添加新的强制跳转监听器
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);

      // 添加点击事件监听器，强制跳转到登录页面
      newLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log('Sign In link clicked! Redirecting to:', this.href);
        window.location.href = this.href;
      }, true);

      console.log('Added click handler to Sign In link');

      // 清除更新标记
      container.dataset.userNavUpdated = 'false';
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

  // setupLoginFormHandler 函数已删除
  // 下拉登录表单已删除，点击 Sign In 直接跳转到登录页面

  /**
   * 强制刷新用户导航栏（清除缓存标记）
   */
  async function forceUpdateUserNav() {
    console.log('🔄 Force updating user nav...');
    // 清除所有的userNavUpdated标记
    const accountContainers = document.querySelectorAll('.site-header-account');
    console.log('Found', accountContainers.length, 'account containers');
    accountContainers.forEach((container, index) => {
      console.log(`Container ${index}: current userNavUpdated =`, container.dataset.userNavUpdated);
      container.dataset.userNavUpdated = 'false';
      console.log(`Container ${index}: set userNavUpdated to 'false'`);
    });
    // 然后调用正常的更新
    console.log('Calling updateUserNav()...');
    await updateUserNav();
    console.log('✅ Force update completed');
  }

  // 导出到全局（如果需要）
  window.UserNav = {
    update: updateUserNav,
    forceUpdate: forceUpdateUserNav,
  };
})();

