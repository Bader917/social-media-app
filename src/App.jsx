import { HashRouter, Routes, Route } from 'react-router-dom';
import AuthProtoctedRoute from './Components/AuthProtectedRoute/AuthProtectedRoute';
import ProtoctedRoute from './Components/ProtectedRoute/ProtoctedRoute';
import { ProfileProvider } from './Components/ProfileContext/ProfileContext';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import AuthContextProvider from './Context/AuthContext';
import { HeroUIProvider } from '@heroui/react';
import Home from './Components/Home/Home';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import UserProfile from './Components/UserProfile/UserProfile';
import MyProfile from './Components/MyProfile/MyProfile';
import PostDetails from './Components/PostDetails/PostDetails';
import Settings from './Components/Settings/Settings';
import Layout from './Components/Layout/Layout';
import Notfound from './Components/Notfound/Notfound';
import { Toaster } from 'react-hot-toast';

const query = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={query}>
      <ProfileProvider>
        <AuthContextProvider>
          <HeroUIProvider>
            <div className="bg-gray-100 min-h-screen">
              <HashRouter>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<ProtoctedRoute><Home /></ProtoctedRoute>} />
                    <Route path="/home" element={<ProtoctedRoute><Home /></ProtoctedRoute>} />
                    <Route path="/postDetails/:id" element={<ProtoctedRoute><PostDetails /></ProtoctedRoute>} />
                    <Route path="/profile/:id" element={<ProtoctedRoute><UserProfile /></ProtoctedRoute>} />
                    <Route path="/profile" element={<ProtoctedRoute><MyProfile /></ProtoctedRoute>} />
                    <Route path="/settings" element={<ProtoctedRoute><Settings /></ProtoctedRoute>} />
                    <Route path="/login" element={<AuthProtoctedRoute><Login /></AuthProtoctedRoute>} />
                    <Route path="/register" element={<AuthProtoctedRoute><Register /></AuthProtoctedRoute>} />
                    <Route path="*" element={<Notfound />} />
                  </Route>
                </Routes>
              </HashRouter>
            </div>
            <div><Toaster /></div>
          </HeroUIProvider>
        </AuthContextProvider>
      </ProfileProvider>
    </QueryClientProvider>
  )
}
