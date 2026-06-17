import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOrdersStore } from '../../store/ordersStore';
import { ordersService } from '../../services/ordersService';

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const CreateOrder = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addOrder = useOrdersStore((state) => state.addOrder);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    try {
      let fileUrl = '';
      let fileName = '';
      
      if (file) {
        fileUrl = await readFileAsDataUrl(file);
        fileName = file.name;
      }

      const newOrder = await ordersService.createOrder({
        title,
        description,
        price: Number(price),
        status: 'open',
        customerId: user.id,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
      });

      addOrder(newOrder);
      navigate('/');
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      setError('Ошибка при создании заказа. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '30px' }}>
      <h2>Создать заказ</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Название заказа</label>
          <input
            className="input"
            placeholder="Например: Нужен логотип"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Описание</label>
          <textarea
            className="input"
            placeholder="Опишите задание подробнее..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            style={{ resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Бюджет (₽)</label>
          <input
            className="input"
            type="number"
            placeholder="5000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Файл с ТЗ (необязательно)</label>
          <input
            className="input"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
          {file && <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>Выбран: {file.name}</p>}
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать заказ'}
        </button>
        {error && (
          <p style={{ padding: '10px', backgroundColor: '#fef2f2', color: 'var(--error-color)', borderRadius: '6px' }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
};
