import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import type { Role } from '../../types/user';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('freelancer');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = await authService.register({ name, email, password, role });
    login(newUser);
    navigate('/');
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input className="input" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="freelancer">Фрилансер</option>
          <option value="customer">Заказчик</option>
        </select>

        <button className="btn btn-primary" type="submit">Зарегистрироваться</button>
      </form>
      <p style={{ marginTop: '15px' }}>
        Уже есть аккаунт? <a href="/login">Войти</a>
      </p>
    </div>
  );
};