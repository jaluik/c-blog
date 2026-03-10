import { getCurrentUser, logout } from "@/services/user";
import {
  CommentOutlined,
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  LogoutOutlined,
  TagsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProLayout as AntProLayout } from "@ant-design/pro-components";
import { Avatar, Button, Dropdown, message } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    path: "/",
    name: "Dashboard",
    icon: <DashboardOutlined />,
  },
  {
    path: "/articles",
    name: "文章管理",
    icon: <FileTextOutlined />,
  },
  {
    path: "/categories",
    name: "分类管理",
    icon: <FolderOutlined />,
  },
  {
    path: "/tags",
    name: "标签管理",
    icon: <TagsOutlined />,
  },
  {
    path: "/comments",
    name: "评论管理",
    icon: <CommentOutlined />,
  },
  {
    path: "/user",
    name: "用户管理",
    icon: <UserOutlined />,
    children: [
      {
        path: "/user/profile",
        name: "个人信息",
      },
      {
        path: "/user/change-password",
        name: "修改密码",
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
    messageApi.success("退出登录成功");
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/user/profile">个人信息</Link>,
    },
    {
      key: "password",
      icon: <UserOutlined />,
      label: <Link to="/user/change-password">修改密码</Link>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
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
          path: "/",
          routes: menuItems,
        }}
        menuItemRender={(item, dom) => <Link to={item.path || "/"}>{dom}</Link>}
        rightContentRender={() => (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" size="small">
              <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 6 }} />
              <span>{username || "管理员"}</span>
            </Button>
          </Dropdown>
        )}
        onMenuHeaderClick={() => navigate("/")}
        layout="mix"
        fixSiderbar
        fixedHeader
        contentStyle={{
          padding: 16,
          margin: 0,
          minHeight: "calc(100vh - 56px)",
        }}
        headerStyle={{
          height: 48,
          lineHeight: "48px",
          padding: "0 16px",
        }}
        siderWidth={200}
        menuProps={{
          style: {
            padding: "8px 0",
          },
        }}
      >
        <Outlet />
      </AntProLayout>
    </>
  );
}
