import { Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import ProtectedRoute from './components/common/ProtectedRoute'
import AnalysisPage from './pages/AnalysisPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyPage from './pages/MyPage'
import CommunityPage from './pages/CommunityPage'
import CommunityPostPage from './pages/CommunityPostPage'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/community"
          element={<><Header /><CommunityPage /></>}
        />
        <Route
          path="/community/:id"
          element={<><Header /><CommunityPostPage /></>}
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<AnalysisPage />} />
                  <Route path="/my" element={<MyPage />} />
                </Routes>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}
