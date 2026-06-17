import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersService } from '../../services/usersService';
import { ordersService } from '../../services/ordersService';
import { authService } from '../../services/authService';
import type { User } from '../../types/user';
import type { Order } from '../../types/order';

export const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingDelete, setPendingDelete] = useState<{ type: 'user' | 'order'; id: string | number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const usersData = await usersService.getAllUsers();
    const ordersData = await ordersService.getOrders();
    setUsers(usersData);
    setOrders(ordersData);
  };

  const handleDeleteUser = async (id: string | number) => {
    if (pendingDelete?.type !== 'user' || String(pendingDelete.id) !== String(id)) {
      setPendingDelete({ type: 'user', id });
      return;
    }

    await authService.deleteUser(id);
    setPendingDelete(null);
    loadData();
  };

  const handleDeleteOrder = async (id: string | number) => {
    if (pendingDelete?.type !== 'order' || String(pendingDelete.id) !== String(id)) {
      setPendingDelete({ type: 'order', id });
      return;
    }

    await ordersService.deleteOrder(id);
    setPendingDelete(null);
    loadData();
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  };

  const thStyle: React.CSSProperties = {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid var(--border-color)',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid var(--border-color)',
  };

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', alignItems: 'center' }}>
        <h1>Админ-панель</h1>
        <Link to="/" className="btn">На главную</Link>
      </div>

      <section style={{ marginTop: '40px' }}>
        <h2>Пользователи ({users.length})</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Имя</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Роль</th>
              <th style={thStyle}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={tdStyle}>{user.id}</td>
                <td style={tdStyle}>{user.name}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>{user.role}</td>
                <td style={tdStyle}>
                  <button
                    className="btn"
                    onClick={() => handleDeleteUser(user.id)}
                    style={{ background: '#ef4444', color: 'white', padding: '6px 12px' }}
                  >
                    {pendingDelete?.type === 'user' && String(pendingDelete.id) === String(user.id) ? 'Нажмите еще раз' : 'Удалить'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Заказы ({orders.length})</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Название</th>
              <th style={thStyle}>Бюджет</th>
              <th style={thStyle}>Статус</th>
              <th style={thStyle}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={tdStyle}>{order.id}</td>
                <td style={tdStyle}>{order.title}</td>
                <td style={tdStyle}>{order.price} ₽</td>
                <td style={tdStyle}>{order.status}</td>
                <td style={tdStyle}>
                  <button
                    className="btn"
                    onClick={() => handleDeleteOrder(order.id)}
                    style={{ background: '#ef4444', color: 'white', padding: '6px 12px' }}
                  >
                    {pendingDelete?.type === 'order' && String(pendingDelete.id) === String(order.id) ? 'Нажмите еще раз' : 'Удалить'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
