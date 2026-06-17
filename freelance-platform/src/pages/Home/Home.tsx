import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrdersStore } from '../../store/ordersStore';
import { ordersService } from '../../services/ordersService';

export const Home = () => {
  const { orders, setOrders } = useOrdersStore();

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await ordersService.getOrders();
      setOrders(data);
    };
    fetchOrders();
  }, [setOrders]);

  return (
    <div className="container">
      <h2 style={{ marginBottom: '20px' }}>Доступные миссии (Заказы)</h2>
      
      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Система Омнитрикс не обнаружила активных миссий.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map((order) => (
            <Link 
              key={order.id} 
              to={`/order/${order.id}`} 
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{ 
                padding: '20px', 
                border: '1px solid #333', 
                borderRadius: '8px', 
                backgroundColor: 'var(--card-bg)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--omnitrix-green)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(57, 255, 20, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{order.title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {order.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--omnitrix-green)' }}>
                    {order.price} ₽
                  </span>
                  <span style={{ 
                    padding: '4px 10px', 
                    backgroundColor: 'var(--omnitrix-dark-green)', 
                    color: 'var(--omnitrix-green)',
                    borderRadius: '4px', 
                    fontSize: '12px',
                    fontFamily: 'Orbitron, sans-serif'
                  }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      backgroundColor: order.status === 'open' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: order.status === 'open' ? 'var(--success-color)' : '#f59e0b',
                      border: `1px solid ${order.status === 'open' ? 'var(--success-color)' : '#f59e0b'}`,
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {order.status === 'open' ? 'Открыт' : order.status === 'in_progress' ? 'В работе' : 'Завершен'}
                    </span>
                  </span>
                </div>
                {order.fileUrl && (
                  <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    📎 Прикреплён файл данных
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};