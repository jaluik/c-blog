import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { LoginPage } from './pages/Login';
import { ProLayout } from './components/ProLayout';
import { Dashboard } from './pages/Dashboard';
import { ArticleList } from './pages/Article/List';
import { ArticleCreate } from './pages/Article/Create';
import { ArticleEdit } from './pages/Article/Edit';
import { CommentList } from './pages/Comment/List';
import { UserProfile } from './pages/User/Profile';
import { ChangePassword } from './pages/User/ChangePassword';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <AntApp>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <ProLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="articles" element={<ArticleList />} />
                <Route path="articles/create" element={<ArticleCreate />} />
                <Route path="articles/edit/:id" element={<ArticleEdit />} />
                <Route path="comments" element={<CommentList />} />
                <Route path="user/profile" element={<UserProfile />} />
                <Route path="user/change-password" element={<ChangePassword />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
