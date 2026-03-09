import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { ProLayout as AntProLayout } from '@ant-design/pro-components';
import { Avatar, Dropdown, Button, message } from 'antd';
import {
  FileTextOutlined,
  CommentOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TagsOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { logout, getCurrentUser } from '@/services/user';

const menuItems = [
  {
    path: '/',
    name: 'Dashboard',
    icon: <DashboardOutlined />,
  },
  {
    path: '/articles',
    name: '文章管理',
    icon: <FileTextOutlined />,
  },
  {
    path: '/categories',
    name: '分类管理',
    icon: <FolderOutlined />,
  },
  {
    path: '/tags',
    name: '标签管理',
    icon: <TagsOutlined />,
  },
  {
    path: '/comments',
    name: '评论管理',
    icon: <CommentOutlined />,
  },
  {
    path: '/user',
    name: '用户管理',
    icon: <UserOutlined />,
    children: [
      {
        path: '/user/profile',
        name: '个人信息',
      },
      {
        path: '/user/change-password',
        name: '修改密码',
      },
    ],
  },
];

export function ProLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = getCurrentUser();
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogout = () => {
    logout();
    messageApi.success('退出登录成功');
    setTimeout(() => {
      navigate('/login');
    }, 500);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/user/profile">个人信息</Link>,
    },
    {
      key: 'password',
      icon: <UserOutlined />,
      label: <Link to="/user/change-password">修改密码</Link>,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <>
      {contextHolder}
      <AntProLayout
        title="博客管理系统"
        logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
        location={{
          pathname: location.pathname,
        }}
        route={{
          path: '/',
          routes: menuItems,
        }}
        menuItemRender={(item, dom) => (
          <Link to={item.path || '/'}>{dom}</Link>
        )}
        rightContentRender={() => (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text">
              <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <span>{username || '管理员'}</span>
            </Button>
          </Dropdown>
        )}
        onMenuHeaderClick={() => navigate('/')}
        layout="mix"
        fixSiderbar
        fixedHeader
        contentStyle={{
          padding: 24,
        }}
      >
        <Outlet />
      </AntProLayout>
    </>
  );
}
