import { getCurrentUser } from "@/services/user";
import { UserOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { Avatar, Card, Descriptions, Tag } from "antd";

export function UserProfile() {
  const { username } = getCurrentUser();

  return (
    <PageContainer title="个人信息">
      <Card>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Avatar size={80} icon={<UserOutlined />} />
          <h2 style={{ marginTop: 16 }}>{username || "管理员"}</h2>
          <Tag color="blue">超级管理员</Tag>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="用户名">{username || "-"}</Descriptions.Item>
          <Descriptions.Item label="角色">超级管理员</Descriptions.Item>
          <Descriptions.Item label="权限">
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>文章管理（创建、编辑、删除）</li>
              <li>分类管理</li>
              <li>标签管理</li>
              <li>评论审核</li>
              <li>系统设置</li>
            </ul>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </PageContainer>
  );
}
