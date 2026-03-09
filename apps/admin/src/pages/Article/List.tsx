import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, Popconfirm, message, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { PostWithRelations, Tag as TagType } from '@blog/shared-types';
import { getArticles, deleteArticle } from '@/services/article';
import type { ArticleListParams } from '@/services/article';

export function ArticleList() {
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>();
  const [loading] = useState(false);

  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns: ProColumns<PostWithRelations>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '封面',
      dataIndex: 'coverImage',
      width: 80,
      search: false,
      render: (_, record) =>
        record.coverImage ? (
          <Image
            src={record.coverImage}
            alt={record.title}
            width={60}
            height={40}
            style={{ objectFit: 'cover' }}
            preview={false}
          />
        ) : (
          <div style={{ width: 60, height: 40, backgroundColor: '#f0f0f0' }} />
        ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      formItemProps: {
        rules: [{ required: true }],
      },
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      ellipsis: true,
      search: false,
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      search: false,
      render: (_, record) => record.category?.name || '-',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      search: false,
      render: (_, record) => (
        <Space size="small" wrap>
          {record.tags?.map((tag: TagType) => (
            <Tag key={tag.id}>
              {tag.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        published: { text: '已发布', status: 'Success' },
      },
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      width: 80,
      search: false,
      sorter: true,
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      width: 180,
      search: false,
      valueType: 'dateTime',
      sorter: true,
      render: (_, record) => record.publishedAt || '-',
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
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/${record.slug}`, '_blank')}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/articles/edit/${record.id}`)}
          >
            编辑
          </Button>
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
    <ProTable<PostWithRelations>
      headerTitle="文章列表"
      actionRef={actionRef}
      rowKey="id"
      search={{
        labelWidth: 120,
      }}
      toolBarRender={() => [
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/articles/create')}
        >
          新建文章
        </Button>,
      ]}
      request={async (params) => {
        const queryParams: ArticleListParams = {
          page: params.current,
          pageSize: params.pageSize,
          status: params.status,
        };

        // Handle title search
        if (params.title) {
          // Title search will be handled by the API
          // For now, we just pass all params
        }

        const response = await getArticles(queryParams);
        return {
          data: response.data,
          success: true,
          total: response.meta.total,
        };
      }}
      columns={columns}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
      loading={loading}
    />
  );
}
