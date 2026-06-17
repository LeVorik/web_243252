import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { Home } from './pages/Home/Home';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { CreateOrder } from './pages/CreateOrder/CreateOrder';
import { AdminPanel } from './pages/AdminPanel/AdminPanel';
import { Profile } from './pages/Profile/Profile';
import { OrderDetails } from './pages/OrderDetails/OrderDetails';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Маршруты с шапкой и футером */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/order/:id" element={<OrderDetails />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/create-order" element={<CreateOrder />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>

        {/* Маршруты без шапки (если хочешь, можно и их в MainLayout, но пусть будут отдельно для чистоты) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </HashRouter>
  );
}

export default App;