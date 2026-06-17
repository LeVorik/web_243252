import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        borderBottom: '2px solid var(--border-color)', 
        padding: '20px 0', 
        marginBottom: '30px',
        backgroundColor: 'var(--card-bg)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
            ⌚ FREELANCE JOBS
          </Link>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {user ? (
              <>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Агент: {user.name} [{user.role.toUpperCase()}]
                </span>
                <Link to="/profile" className="btn">Профиль</Link>
                {user.role === 'admin' && <Link to="/admin" className="btn btn-primary">Админка</Link>}
                {user.role === 'customer' && <Link to="/create-order" className="btn btn-primary">+ Заказ</Link>}
                <button className="btn" onClick={handleLogout} style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>
                  Выход
                </button>
                <button className="btn" onClick={() => navigate(-1)}>← Назад</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn">Вход</Link>
                <Link to="/register" className="btn btn-primary">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px', borderTop: '1px solid #333', marginTop: '40px' }}>
        © 2026 Omnitrix Jobs. It's Hero Time.
      </footer>
    </div>
  );
};