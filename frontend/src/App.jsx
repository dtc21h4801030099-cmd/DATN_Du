import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Majors from './pages/Majors'
import MajorDetail from './pages/MajorDetail'
import Universities from './pages/Universities'
import UniversityDetail from './pages/UniversityDetail'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Posts from './pages/Posts'
import PostDetail from './pages/PostDetail'

import AdminLayout from './pages/admin/Layout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminMajors from './pages/admin/AdminMajors'
import AdminUniversities from './pages/admin/AdminUniversities'
import AdminPosts from './pages/admin/AdminPosts'
import AdminChatbot from './pages/admin/AdminChatbot'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public layout — dùng Outlet thay vì nested <Routes> */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/majors" element={<Majors />} />
            <Route path="/majors/:id" element={<MajorDetail />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/universities/:id" element={<UniversityDetail />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          </Route>

          {/* Admin layout — AdminLayout có <Outlet /> riêng */}
          <Route
            path="/admin"
            element={<AdminRoute><AdminLayout /></AdminRoute>}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="majors" element={<AdminMajors />} />
            <Route path="universities" element={<AdminUniversities />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="chatbot" element={<AdminChatbot />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
