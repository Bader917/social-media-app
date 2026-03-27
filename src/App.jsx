import AuthProtoctedRoute from './Components/AuthProtectedRoute/AuthProtectedRoute';
import { ProfileProvider } from './Components/ProfileContext/ProfileContext';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import ProtoctedRoute from './Components/ProtectedRoute/ProtoctedRoute'
import UserProfile from './Components/UserProfile/UserProfile';
import PostDetails from './Components/PostDetails/PostDetails';
import MyProfile from './Components/MyProfile/MyProfile';
import AuthContextProvider from './Context/AuthContext';
import { createBrowserRouter } from 'react-router-dom';
import Settings from './Components/Settings/Settings';
import Register from './Components/Register/Register';
import Notfound from './Components/Notfound/Notfound';
import { RouterProvider } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import { HeroUIProvider } from '@heroui/react';
import Login from './Components/Login/Login';
import Home from './Components/Home/Home';
import { Toaster } from 'react-hot-toast';

const router = createBrowserRouter([
  {
    path: '', element: <Layout />, children: [
      { path: '/', element: <ProtoctedRoute><Home /></ProtoctedRoute> },
      { path: 'home', element: <ProtoctedRoute><Home /></ProtoctedRoute> },
      { path: 'postDetails/:id', element: <ProtoctedRoute><PostDetails /></ProtoctedRoute> },
      { path: 'profile/:id', element: <ProtoctedRoute><UserProfile /></ProtoctedRoute> },
      { path: 'profile', element: <ProtoctedRoute><MyProfile /></ProtoctedRoute> },
      { path: 'settings', element: <ProtoctedRoute><Settings /></ProtoctedRoute> },
      { path: 'login', element: <AuthProtoctedRoute><Login /></AuthProtoctedRoute> },
      { path: 'register', element: <AuthProtoctedRoute><Register /></AuthProtoctedRoute> },
      { path: '*', element: <Notfound /> },
    ]
  }
]);

const query = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={query}>
      <ProfileProvider>
        <AuthContextProvider>
          <HeroUIProvider>
            <div className='bg-gray-100 min-h-screen'>
              <RouterProvider router={router} />
            </div>
            <div><Toaster/></div>
          </HeroUIProvider>
        </AuthContextProvider>
      </ProfileProvider>
    </QueryClientProvider>
  )
}