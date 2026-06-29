import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { Home } from '@/routes/Home';
import { Shop } from '@/routes/Shop';
import { Product } from '@/routes/Product';
import { Wishlist } from '@/routes/Wishlist';
import { CustomOrder } from '@/routes/CustomOrder';
import { Checkout } from '@/routes/Checkout';
import { Rating } from '@/routes/Rating';
import { NotFound } from '@/routes/NotFound';
import { AdminLayout } from '@/admin/components/AdminLayout';
import { RequireAuth } from '@/admin/components/RequireAuth';
import { Login } from '@/admin/pages/Login';
import { Analytics } from '@/admin/pages/Analytics';
import { Orders } from '@/admin/pages/Orders';
import { CustomOrders } from '@/admin/pages/CustomOrders';
import { Products } from '@/admin/pages/Products';
import { Reviews } from '@/admin/pages/Reviews';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', element: <Shop /> },
      { path: 'product/:id', element: <Product /> },
      { path: 'wishlist', element: <Wishlist /> },
      { path: 'custom-order', element: <CustomOrder /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'rating', element: <Rating /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Analytics /> },
      { path: 'orders', element: <Orders /> },
      { path: 'custom-orders', element: <CustomOrders /> },
      { path: 'products', element: <Products /> },
      { path: 'reviews', element: <Reviews /> },
    ],
  },
]);
