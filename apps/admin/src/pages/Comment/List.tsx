import { useRef } from 'react';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, Popconfirm, message, Avatar } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { getComments, approveComment, deleteComment } from '@/services/comment';
import type { Comment } from '@blog/shared-types';
import type { CommentListParams } from '@/services/comment';

interface CommentWithArticle extends Comment {
  article?: {
    id: number;
    title: string;
    slug: string;
  };
}

export function CommentList() {
  const actionRef = useRef<ActionType>();

  const handleApprove = async (id: number, isApproved: boolean) => {
    try {
      await approveComment(id, isApproved);
      message.success(isApproved ? '审核通过' : '已拒绝');
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteComment(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<CommentWithArticle>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '用户',
      dataIndex: 'githubUsername',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.githubAvatar && (
            <Avatar src={record.githubAvatar} size="small" />
          )}
          <span>{record.githubUsername}</span>
        </Space>
      ),
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '文章',
      dataIndex: 'article',
      width: 200,
      search: false,
      render: (_, record) => (
        <a
          href={`/${record.article?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {record.article?.title || '-'}
        </a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isApproved',
      width: 100,
      valueEnum: {
        true: { text: '已通过', status: 'Success' },
        false: { text: '待审核', status: 'Warning' },
      },
      render: (_, record) => (
        <Tag color={record.isApproved ? 'success' : 'warning'}>
          {record.isApproved ? '已通过' : '待审核'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      search: false,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size="small">
          {!record.isApproved && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id, true)}
            >
              通过
            </Button>
          )}
          {record.isApproved && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleApprove(record.id, false)}
            >
              拒绝
            </Button>
          )}
          <Popconfirm
            title="确认删除"
            description="删除后无法恢复，是否确认删除？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProTable<CommentWithArticle>
      headerTitle="评论列表"
      actionRef={actionRef}
      rowKey="id"
      search={{
        labelWidth: 120,
      }}
      request={async (params) => {
        const queryParams: CommentListParams = {
          page: params.current,
          pageSize: params.pageSize,
          isApproved: params.isApproved,
        };

        const response = await getComments(queryParams);
        return {
          data: response.data,
          success: true,
          total: response.meta.total,
        };
      }}
      columns={columns}
      pagination={{
        defaultPageSize: 20,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
    />
  );
}
