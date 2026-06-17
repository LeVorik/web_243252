import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { responsesService } from '../../services/responsesService';
import { useAuthStore } from '../../store/authStore';
import type { Order, OrderResponse } from '../../types/order';
import { ordersService } from '../../services/ordersService';

export const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [responses, setResponses] = useState<OrderResponse[]>([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [orderData, responsesData] = await Promise.all([
          api.get<Order>(`/orders/${id}`),
          responsesService.getByOrder(Number(id))
        ]);
        setOrder(orderData.data);
        setResponses(responsesData);
      } catch (error) {
        console.error('Ошибка загрузки заказа:', error);
        navigate('/');
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !order) return;

    setLoading(true);
    try {
      let fileUrl = '';
      if (file) {
        fileUrl = `/mocks/response_${Date.now()}_${file.name}`;
        console.log('Файл отклика загружен (мок):', fileUrl);
      }

      const newResponse = await responsesService.create({
        orderId: order.id,
        freelancerId: user.id,
        freelancerName: user.name,
        message,
        fileUrl: fileUrl || undefined,
      });

      // Мгновенно обновляем UI, добавляя новый отклик в массив
      setResponses((prev) => [...prev, newResponse]);
      
      // Очищаем форму
      setMessage('');
      setFile(null);
      
      alert('Отклик успешно отправлен в систему Омнитрикс!');
    } catch (error) {
      console.error('Ошибка отправки отклика:', error);
      alert('Сбой связи. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptResponse = async (responseId: number, freelancerName: string) => {
    if (!order) return;
    if (!confirm(`Принять исполнителя ${freelancerName} и начать работу? Статус заказа изменится.`)) return;

    try {
      // Меняем статус заказа на "в работе"
      const updatedOrder = await ordersService.updateOrderStatus(order.id, 'in_progress');
      setOrder(updatedOrder);
      alert(`Исполнитель ${freelancerName} принят! Статус изменен на "В работе".`);
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      alert('Не удалось изменить статус');
    }
  };

  if (!order) return <div className="container" style={{ marginTop: '30px' }}>Загрузка...</div>;

  const isFreelancer = user?.role === 'freelancer';
  const hasAlreadyApplied = responses.some(r => r.freelancerId === user?.id);

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '30px' }}>
      <button className="btn" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>← Назад к списку</button>
      
      <h2>{order.title}</h2>
      <p style={{ marginTop: '10px', color: '#555' }}>{order.description}</p>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{order.price} ₽</span>
        <span style={{ 
          padding: '6px 12px', 
          backgroundColor: order.status === 'open' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          color: order.status === 'open' ? 'var(--success-color)' : '#f59e0b',
          border: `1px solid ${order.status === 'open' ? 'var(--success-color)' : '#f59e0b'}`,
          borderRadius: '6px', 
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {order.status === 'open' ? 'Открыт' : order.status === 'in_progress' ? 'В работе' : 'Завершен'}
        </span>
        {order.fileUrl && <span>📎 В заказе есть файл ТЗ</span>}
      </div>

      {/* Блок откликов (виден заказчику и админу) */}
      {(user?.role === 'customer' || user?.role === 'admin') && (
        <section style={{ marginTop: '40px' }}>
          <h3>Отклики ({responses.length})</h3>
          {responses.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Пока нет откликов</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              {responses.map(resp => (
                <div key={resp.id} style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--card-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--omnitrix-green)' }}>{resp.freelancerName}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(resp.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {/* Кнопка принятия видна только заказчику и только если заказ еще "open" */}
                    {user?.role === 'customer' && order.status === 'open' && (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleAcceptResponse(resp.id, resp.freelancerName)}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        ✓ Принять исполнителя
                      </button>
                    )}
                  </div>
                  <p style={{ margin: '12px 0', lineHeight: 1.5 }}>{resp.message}</p>
                  {resp.fileUrl && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📎 Прикреплён файл: {resp.fileUrl.split('/').pop()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Форма отклика (только для фрилансера) */}
      {isFreelancer && !hasAlreadyApplied && (
        <section style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <h3>Оставить отклик</h3>
          <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <textarea
              className="input"
              placeholder="Расскажите, почему вы подходите для этого заказа..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
            <input
              className="input"
              type="file"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
            {file && <p style={{ fontSize: '14px', color: '#666' }}>Выбран: {file.name}</p>}
            
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}>
              {loading ? 'Отправка...' : 'Отправить отклик'}
            </button>
          </form>
        </section>
      )}

      {isFreelancer && hasAlreadyApplied && (
        <p style={{ marginTop: '30px', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
          ✅ Вы уже оставили отклик на этот заказ.
        </p>
      )}
    </div>
  );
};