import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

export const Profile = () => {
  const { user, login } = useAuthStore();
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  // Заполняем форму текущими данными при загрузке
  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setNotice(null);
    try {
      let avatarUrl = user.avatarUrl;

      // Моковая загрузка файла
      if (file) {
        // В реальном проекте здесь был бы FormData и запрос на сервер
        // Для мока просто генерируем путь, как будто файл сохранился в public/mocks
        avatarUrl = `/mocks/avatar_${Date.now()}_${file.name}`;
        console.log('Файл "загружен" (мок):', avatarUrl);
      }

      // Отправляем обновленные данные на JSON Server
      const updatedUser = await authService.updateUser(user.id, {
        name,
        avatarUrl,
      });

      // Обновляем пользователя в глобальном сторе, чтобы изменения отобразились в шапке
      login(updatedUser);
      setNotice({ text: 'Профиль успешно обновлен.', type: 'success' });
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      setNotice({ text: 'Ошибка при обновлении профиля. Попробуйте позже.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', alignItems: 'center' }}>
        <h2>Мой профиль</h2>
        <Link to="/" className="btn">На главную</Link>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <p><strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : user.role === 'customer' ? 'Заказчик' : 'Фрилансер'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {user.avatarUrl && (
          <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--success-color)' }}>
            ✅ Текущий файл: {user.avatarUrl.split('/').pop()}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Имя / Название компании</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
            {user.role === 'freelancer' ? 'Файл портфолио (PDF, JPG)' : 'Аватар (JPG, PNG)'}
          </label>
          <input
            className="input"
            type="file"
            onChange={handleFileChange}
            accept={user.role === 'freelancer' ? '.pdf,.jpg,.png' : '.jpg,.png'}
          />
          {file && <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>Выбран новый файл: {file.name}</p>}
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}>
          {loading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
        {notice && (
          <p style={{
            padding: '10px',
            backgroundColor: notice.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: notice.type === 'success' ? 'var(--success-color)' : 'var(--error-color)',
            borderRadius: '6px'
          }}>
            {notice.text}
          </p>
        )}
      </form>
    </div>
  );
};
