import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Auth from '@/pages/Auth'
import Otp from '@/pages/Auth/Otp'
import SpaceDetail from '@/pages/SpaceDetail'
import Payment from '@/pages/Payment'
import Profile from '@/pages/Profile'
import Admin from '@/pages/Admin'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'auth', element: <Auth /> },
      { path: 'auth/otp', element: <Otp /> },
      { path: 'spaces/:id', element: <SpaceDetail /> },
      { path: 'payment', element: <Payment /> },
      { path: 'profile', element: <Profile /> },
      { path: 'admin', element: <Admin /> },
    ],
  },
])
