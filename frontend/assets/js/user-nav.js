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
    setupLoginFormHandler();
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

    accountContainers.forEach(originalContainer => {
      const link = originalContainer.querySelector('a[href*="my-account"]');
      if (!link) return;

      const contentSpan = link.querySelector('.content-content');
      if (!contentSpan) return;

      // 检查是否是"Sign In"文本或者已经是用户信息（需要更新头像）
      const currentText = contentSpan.textContent.trim();
      const isSignIn = currentText === 'Sign In';
      const isAlreadyLoggedIn = originalContainer.dataset.userNavUpdated === 'true';

      // 如果已经是登录状态，只更新头像，不重新创建整个结构
      if (isAlreadyLoggedIn && !isSignIn) {
        console.log('Updating avatar for already logged in user');
        const iconDiv = link.querySelector('.icon');
        if (iconDiv) {
          const avatarImg = iconDiv.querySelector('img.user-avatar-nav');
          if (avatarImg && userInfo.avatar) {
            console.log('Updating avatar src to:', userInfo.avatar.substring(0, 50) + '...');
            avatarImg.src = userInfo.avatar;
          }
        }
        return;
      }

      // 如果是"Sign In"，进行完整的更新
      if (isSignIn) {
        // 使用 nickName 或 userName 或 email
        const displayName = userInfo.nickName || userInfo.userName || userInfo.email || 'User';

        // 克隆容器以移除所有事件监听器
        const container = originalContainer.cloneNode(true);
        originalContainer.parentNode.replaceChild(container, originalContainer);

        // 重新获取元素引用
        const newLink = container.querySelector('a[href*="my-account"]');
        const newContentSpan = newLink.querySelector('.content-content');
        const accountContent = newLink.querySelector('.account-content');

        // 设置昵称，如果太长则截断
        newContentSpan.textContent = displayName;
        // 始终添加tooltip，让CSS决定是否显示
        newContentSpan.setAttribute('data-tooltip', displayName);
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

        // 修改链接指向个人中心
        newLink.href = '/Personal-Center/';

        // 移除下拉菜单（如果存在）
        const dropdown = container.querySelector('.account-dropdown');
        if (dropdown) {
          dropdown.innerHTML = '';
          dropdown.style.display = 'none';
        }

        // 查找图标元素
        const iconDiv = newLink.querySelector('.icon');
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

  /**
   * 设置原始登录表单的处理器
   * 使用事件委托，确保动态显示的表单也能正常工作
   */
  function setupLoginFormHandler() {
    // 监听所有submit事件，用于调试
    document.addEventListener('submit', function(e) {
      console.log('Submit event detected on:', e.target.className, e.target);
    }, true);

    // 使用事件委托，监听document上的submit事件
    // 使用capture阶段，确保在其他处理器之前执行
    document.addEventListener('submit', async function(e) {
      // 检查是否是登录表单
      if (!e.target.classList.contains('gopet-login-form-ajax')) {
        return;
      }

      console.log('Login form submit event captured');

      // 阻止默认行为和其他事件处理器
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const form = e.target;
      const usernameInput = form.querySelector('input[name="username"]');
      const passwordInput = form.querySelector('input[name="password"]');
      const submitButton = form.querySelector('button[type="submit"]');

      if (!usernameInput || !passwordInput) {
        console.error('Login form inputs not found');
        return;
      }

      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!username || !password) {
        alert('Please enter username and password');
        return;
      }

      // 禁用提交按钮，防止重复提交
      const originalButtonText = submitButton ? submitButton.textContent : 'Login';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
      }

      try {
        console.log('Attempting login with username:', username);
        const result = await AuthService.login(username, password);
        console.log('Login result:', result);

        if (result.code === 200) {
          // 登录成功，跳转到个人中心
          console.log('Login successful, redirecting to Personal Center');
          window.location.href = '/Personal-Center/';
        } else {
          alert(result.msg || 'Login failed');
          // 恢复按钮状态
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed, please try again');
        // 恢复按钮状态
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    }, true); // 使用capture阶段

    console.log('Login form handler setup complete');

    // 额外添加：直接监听登录按钮的点击事件
    document.addEventListener('click', async function(e) {
      // 检查是否是登录表单中的提交按钮
      const button = e.target.closest('button[type="submit"]');
      if (!button) return;

      const form = button.closest('.gopet-login-form-ajax');
      if (!form) return;

      console.log('Login button clicked, form found:', form);

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const usernameInput = form.querySelector('input[name="username"]');
      const passwordInput = form.querySelector('input[name="password"]');

      if (!usernameInput || !passwordInput) {
        console.error('Login form inputs not found');
        return;
      }

      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      if (!username || !password) {
        alert('Please enter username and password');
        return;
      }

      // 禁用提交按钮，防止重复提交
      const originalButtonText = button.textContent;
      button.disabled = true;
      button.textContent = 'Logging in...';

      try {
        console.log('Attempting login with username:', username);
        const result = await AuthService.login(username, password);
        console.log('Login result:', result);

        if (result.code === 200) {
          // 登录成功，跳转到个人中心
          console.log('Login successful, redirecting to Personal Center');
          window.location.href = '/Personal-Center/';
        } else {
          alert(result.msg || 'Login failed');
          // 恢复按钮状态
          button.disabled = false;
          button.textContent = originalButtonText;
        }
      } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed, please try again');
        // 恢复按钮状态
        button.disabled = false;
        button.textContent = originalButtonText;
      }
    }, true);
  }

  // 导出到全局（如果需要）
  window.UserNav = {
    update: updateUserNav,
  };
})();

