import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>로딩 중...</div>;
  }

  const floors = [1, 2, 3, 4, 5]; // 예시 층수

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              도서관 좌석 예약 시스템
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                환영합니다, {user.displayName}
              </span>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  관리자
                </Link>
              )}
              <Link
                to="/reservations"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                내 예약
              </Link>
              <button
                onClick={logout}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            층을 선택하세요
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {floors.map((floor) => (
              <Link
                key={floor}
                to={`/floor/${floor}`}
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {floor}층
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {floor}층 좌석 배치를 확인하세요
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;