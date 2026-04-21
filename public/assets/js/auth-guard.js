(function () {
  'use strict';

  const ROLE_HOMES = {
    admin: '/admin-panel.html',
    instructor: '/instructor-dashboard.html',
    student: '/student-dashboard.html',
  };

  function roleHome(role) {
    return ROLE_HOMES[role] || '/student-dashboard.html';
  }

  function getCachedUser() {
    try { return JSON.parse(localStorage.getItem('archive_user') || 'null'); }
    catch { return null; }
  }

  function logout() {
    localStorage.removeItem('archive_token');
    localStorage.removeItem('archive_user');
    window.location.replace('/index.html');
  }

  async function ensureAuth() {
    const token = localStorage.getItem('archive_token');
    if (!token) { window.location.replace('/index.html'); return null; }
    try {
      const data = await api.get('/api/auth/me');
      window.currentUser = data.user;
      localStorage.setItem('archive_user', JSON.stringify(data.user));
      document.dispatchEvent(new CustomEvent('userLoaded', { detail: data.user }));
      return data.user;
    } catch {
      logout();
      return null;
    }
  }

  function requireRole(allowed) {
    const list = Array.isArray(allowed) ? allowed : [allowed];
    const cached = getCachedUser();
    if (cached && cached.role && !list.includes(cached.role)) {
      window.location.replace(roleHome(cached.role));
      return;
    }
    document.addEventListener('userLoaded', function (e) {
      if (!list.includes(e.detail.role)) {
        window.location.replace(roleHome(e.detail.role));
      }
    });
  }

  window.roleHome = roleHome;
  window.getCurrentUser = getCachedUser;
  window.logout = logout;
  window.requireRole = requireRole;

  ensureAuth();
})();
