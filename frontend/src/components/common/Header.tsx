import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-slate-800">
          ToneFinder
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/community" className="text-slate-600 hover:text-teal-600 font-medium">
            커뮤니티
          </Link>
          {isLoggedIn ? (
            <>
              <span className="text-slate-500">{user?.nickname ?? user?.email}</span>
              <Link to="/my" className="text-teal-600 hover:text-teal-700 font-medium">
                마이페이지
              </Link>
              <button onClick={logout} className="text-slate-400 hover:text-slate-600">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
