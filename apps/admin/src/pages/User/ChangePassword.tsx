import { changePassword } from "@/services/user";
import { PageContainer } from "@ant-design/pro-components";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import { Alert, App, Card } from "antd";
import { useState } from "react";

export function ChangePassword() {
  const [, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleSubmit = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("两次输入的新密码不一致");
      return;
    }

    if (values.newPassword.length < 6) {
      message.error("新密码长度不能少于6位");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("密码修改成功");
    } catch (error: any) {
      message.error(error.response?.data?.error || "密码修改失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="修改密码">
      <Card style={{ maxWidth: 600 }}>
        <Alert
          message="安全提示"
          description="请定期更换密码，并确保密码强度足够（至少6位字符）。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <ProForm onFinish={handleSubmit} submitter={{ resetButtonProps: {} }}>
          <ProFormText.Password
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: "请输入当前密码" }]}
            placeholder="请输入当前密码"
          />

          <ProFormText.Password
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "密码长度不能少于6位" },
            ]}
            placeholder="请输入新密码（至少6位）"
          />

          <ProFormText.Password
            name="confirmPassword"
            label="确认新密码"
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
            placeholder="请再次输入新密码"
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
}
