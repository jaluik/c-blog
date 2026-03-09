import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { message, Tabs, Checkbox, Form } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '@/services/user';
import type { LoginCredentials } from '@/services/user';

export function LoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved username if remember me was checked
  useState(() => {
    const savedUsername = localStorage.getItem('admin_remember_username');
    if (savedUsername) {
      form.setFieldsValue({ username: savedUsername });
      setRememberMe(true);
    }
  });

  const handleSubmit = async (values: LoginCredentials) => {
    setLoading(true);
    try {
      const data = await login(values);

      // Store token and username
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.username);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('admin_remember_username', values.username);
      } else {
        localStorage.removeItem('admin_remember_username');
      }

      message.success('登录成功');
      navigate('/');
    } catch (error: any) {
      message.error(error.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#f0f2f5',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LoginForm
        form={form}
        logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
        title="博客管理系统"
        subTitle="基于 Ant Design Pro 的博客后台"
        onFinish={handleSubmit}
        loading={loading}
        submitter={{
          searchConfig: {
            submitText: '登录',
          },
        }}
      >
        <Tabs
          centered
          items={[
            {
              key: 'account',
              label: '账号密码登录',
            },
          ]}
        />

        <ProFormText
          name="username"
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined />,
          }}
          placeholder="用户名"
          rules={[
            {
              required: true,
              message: '请输入用户名',
            },
          ]}
        />

        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder="密码"
          rules={[
            {
              required: true,
              message: '请输入密码',
            },
          ]}
        />

        <div
          style={{
            marginBottom: 24,
          }}
        >
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          >
            记住我
          </Checkbox>
        </div>
      </LoginForm>
    </div>
  );
}
