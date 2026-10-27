/**
 * Admin Authentication Controller
 */
import { AdminApi } from '../api/admin-api.js';
import { adminState } from './admin-state.js';

class AdminAuth {
  init() {
    this.checkInitialAuth();
    this.bindEvents();
    window.addEventListener('admin:auth-expired', () => {
      adminState.set({ isAuthenticated: false });
      this.updateAuthUI(false);
    });
  }

  checkInitialAuth() {
    const isAuth = AdminApi.isAuthenticated();
    adminState.set({ isAuthenticated: isAuth });
    this.updateAuthUI(isAuth);
  }

  updateAuthUI(isAuth) {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
      if (isAuth) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      } else {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    const badge = document.getElementById('admin-user-badge');
    if (badge) {
      badge.innerText = isAuth ? 'Quản trị viên (Admin)' : 'Chưa đăng nhập';
    }
  }

  bindEvents() {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = document.getElementById('login-username')?.value.trim();
        const passInput = document.getElementById('login-password')?.value;
        const errEl = document.getElementById('login-error-msg');

        try {
          if (errEl) errEl.classList.add('hidden');
          await AdminApi.login(userInput, passInput);
          adminState.set({ isAuthenticated: true });
          this.updateAuthUI(true);
          loginForm.reset();
          window.dispatchEvent(new Event('admin:authenticated'));
        } catch (err) {
          if (errEl) {
            errEl.innerText = err.message || 'Tài khoản hoặc mật khẩu không chính xác';
            errEl.classList.remove('hidden');
          }
        }
      });
    }

    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await AdminApi.logout();
        } catch (err) {
          console.warn('Không thể thu hồi phiên quản trị trên máy chủ:', err.message);
        }
        adminState.set({ isAuthenticated: false });
        this.updateAuthUI(false);
      });
    }
  }
}

export const adminAuth = new AdminAuth();
