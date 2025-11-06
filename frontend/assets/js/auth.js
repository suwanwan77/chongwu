/**
 * 前端用户认证服务
 * 提供注册、登录、个人信息管理等功能
 */

console.log('🔄 Loading auth.js...');

const AuthService = {
  // API基础URL
  baseURL: 'http://localhost:3000/api/frontend/auth',

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.password - 密码
   * @param {string} userData.email - 邮箱
   * @param {string} userData.phone - 手机号（可选）
   * @param {string} userData.realName - 真实姓名（可选）
   * @returns {Promise<Object>} 注册结果
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        console.log('Registration successful:', data);
        return data;
      } else {
        throw new Error(data.msg || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * 用户登录
   * @param {string} username - 用户名或邮箱
   * @param {string} password - 密码
   * @param {boolean} rememberMe - 是否记住登录状态
   * @returns {Promise<Object>} 登录结果
   */
  async login(username, password, rememberMe = false) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      console.log('=== AUTH.JS LOGIN DEBUG ===');
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      console.log('data.data:', data.data);
      console.log('data.data.token:', data.data?.token);
      console.log('data.data.user:', data.data?.user);
      console.log('==========================');

      if (response.ok && data.code === 200) {
        // 检查返回的数据是否完整
        if (!data.data || !data.data.token) {
          throw new Error('登录响应数据不完整：缺少token');
        }

        // 只保存token，不保存用户信息（用户信息通过API实时获取）
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('customer_token', data.data.token);

        console.log('=== STORAGE SAVED ===');
        console.log('Token saved:', storage.getItem('customer_token'));
        console.log('User info will be fetched from API when needed');
        console.log('=====================');

        console.log('Login successful:', data);
        return data;
      } else {
        throw new Error(data.msg || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * 用户登出
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseURL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除本地存储（只清除token）
      localStorage.removeItem('customer_token');
      sessionStorage.removeItem('customer_token');
      // 也清除可能存在的旧的用户信息缓存
      localStorage.removeItem('customer_info');
      sessionStorage.removeItem('customer_info');
    }
  },

  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} 用户信息
   */
  async getProfile() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not logged in');
      }

      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        // 更新本地存储的用户信息
        const storage = localStorage.getItem('customer_token') ? localStorage : sessionStorage;
        storage.setItem('customer_info', JSON.stringify(data.data));
        return data;
      } else {
        throw new Error(data.msg || 'Failed to get profile');
      }
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * 更新用户信息
   * @param {Object} userData - 要更新的用户数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateProfile(userData) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not logged in');
      }

      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        // 更新本地存储的用户信息
        const storage = localStorage.getItem('customer_token') ? localStorage : sessionStorage;
        storage.setItem('customer_info', JSON.stringify(data.data));
        return data;
      } else {
        throw new Error(data.msg || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * 修改密码
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>} 修改结果
   */
  async changePassword(oldPassword, newPassword) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not logged in');
      }

      const response = await fetch(`${this.baseURL}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        return data;
      } else {
        throw new Error(data.msg || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  /**
   * 上传头像
   * @param {File} file - 头像文件
   * @returns {Promise<Object>} 上传结果
   */
  async uploadAvatar(file) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not logged in');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${this.baseURL}/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        // 不需要更新本地存储，用户信息会从API实时获取
        return data;
      } else {
        throw new Error(data.msg || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  },

  /**
   * 忘记密码 - 发送重置邮件
   * @param {string} email - 邮箱地址
   * @returns {Promise<Object>} 发送结果
   */
  async forgotPassword(email) {
    try {
      const response = await fetch(`${this.baseURL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        return data;
      } else {
        throw new Error(data.msg || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  /**
   * 重置密码
   * @param {string} token - 重置令牌
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>} 重置结果
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${this.baseURL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        return data;
      } else {
        throw new Error(data.msg || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // ========== 工具方法 ==========

  /**
   * 获取token
   * @returns {string|null} token
   */
  getToken() {
    return localStorage.getItem('customer_token') || sessionStorage.getItem('customer_token');
  },

  /**
   * 获取用户信息（直接从API获取，不使用缓存）
   * @returns {Promise<Object|null>} 用户信息
   */
  async getUserInfo() {
    try {
      const result = await this.getProfile();
      if (result.code === 200 && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  },

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return !!this.getToken();
  },
};

// 导出到全局
window.AuthService = AuthService;

// 调试：确认 AuthService 已加载
console.log('✅ AuthService loaded successfully!', typeof window.AuthService);

