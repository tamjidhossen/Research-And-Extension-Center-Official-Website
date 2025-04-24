import { Navigate } from 'react-router-dom';
import { isNoticeManagerAuthenticated } from '@/lib/auth';

export default function NoticeManagerProtectedRoute({ children }) {
  if (!isNoticeManagerAuthenticated()) {
    return <Navigate to="/notice-manager/login" replace />;
  }

  return children;
}