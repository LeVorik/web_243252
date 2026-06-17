import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { responsesService } from '../../services/responsesService';
import { useAuthStore } from '../../store/authStore';
import type { Order, OrderResponse } from '../../types/order';
import { ordersService } from '../../services/ordersService';

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const getFileName = (fileUrl: string, fileName?: string) => {
  if (fileName) return fileName;
  if (fileUrl.startsWith('data:')) return 'вложение';
  return fileUrl.split('/').pop() || 'вложение';
};

export const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [responses, setResponses] = useState<OrderResponse[]>([]);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [orderData, responsesData] = await Promise.all([
          api.get<Order>(`/orders/${id}`),
          responsesService.getByOrder(id)
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
      let fileName = '';
      if (file) {
        fileUrl = await readFileAsDataUrl(file);
        fileName = file.name;
      }

      const newResponse = await responsesService.create({
        orderId: order.id,
        freelancerId: user.id,
        freelancerName: user.name,
        message,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
      });

      // Мгновенно обновляем UI, добавляя новый отклик в массив
      setResponses((prev) => [...prev, newResponse]);
      
      // Очищаем форму
      setMessage('');
      setFile(null);
      setFileInputKey((prev) => prev + 1);
      setNotice({ text: 'Отклик успешно отправлен.', type: 'success' });
    } catch (error) {
      console.error('Ошибка отправки отклика:', error);
      setNotice({ text: 'Не удалось отправить отклик. Попробуйте позже.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptResponse = async (freelancerName: string) => {
    if (!order) return;

    setStatusLoading(true);
    try {
      const updatedOrder = await ordersService.updateOrderStatus(order.id, 'in_progress');
      setOrder(updatedOrder);
      setNotice({ text: `Исполнитель ${freelancerName} принят. Статус заказа изменен на "В работе".`, type: 'success' });
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      setNotice({ text: 'Не удалось изменить статус заказа.', type: 'error' });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCloseOrder = async () => {
    if (!order) return;

    setStatusLoading(true);
    try {
      const updatedOrder = await ordersService.updateOrderStatus(order.id, 'completed');
      setOrder(updatedOrder);
      setNotice({ text: 'Заявка закрыта.', type: 'success' });
    } catch (error) {
      console.error('Ошибка закрытия заказа:', error);
      setNotice({ text: 'Не удалось закрыть заявку.', type: 'error' });
    } finally {
      setStatusLoading(false);
    }
  };

  if (!order) return <div className="container" style={{ marginTop: '30px' }}>Загрузка...</div>;

  const isFreelancer = user?.role === 'freelancer';
  const isOrderOwner = user?.role === 'customer' && String(order.customerId) === String(user.id);

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
        {order.fileUrl && (
          <a
            href={order.fileUrl}
            target="_blank"
            rel="noreferrer"
            download={getFileName(order.fileUrl, order.fileName)}
            style={{ color: 'var(--omnitrix-green)', textDecoration: 'none' }}
          >
            📎 Открыть файл ТЗ: {getFileName(order.fileUrl, order.fileName)}
          </a>
        )}
      </div>

      {isOrderOwner && order.status !== 'completed' && (
        <button
          className="btn btn-primary"
          onClick={handleCloseOrder}
          disabled={statusLoading}
          style={{ marginTop: '20px' }}
        >
          {statusLoading ? 'Закрытие...' : 'Закрыть заявку'}
        </button>
      )}

      {notice && (
        <p style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: notice.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: notice.type === 'success' ? 'var(--success-color)' : 'var(--error-color)',
          borderRadius: '6px'
        }}>
          {notice.text}
        </p>
      )}

      {/* Блок откликов (виден заказчику заявки и админу) */}
      {(isOrderOwner || user?.role === 'admin') && (
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
                    {isOrderOwner && order.status === 'open' && (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleAcceptResponse(resp.freelancerName)}
                        disabled={statusLoading}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        {statusLoading ? 'Сохранение...' : '✓ Принять исполнителя'}
                      </button>
                    )}
                  </div>
                  <p style={{ margin: '12px 0', lineHeight: 1.5 }}>{resp.message}</p>
                  {resp.fileUrl && (
                    <a
                      href={resp.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={getFileName(resp.fileUrl, resp.fileName)}
                      style={{ fontSize: '13px', color: 'var(--omnitrix-green)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      📎 Открыть файл отклика: {getFileName(resp.fileUrl, resp.fileName)}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Форма отклика (только для фрилансера) */}
      {isFreelancer && (
        <section style={{ marginTop: '40px', padding: '20px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
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
              key={fileInputKey}
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
    </div>
  );
};
