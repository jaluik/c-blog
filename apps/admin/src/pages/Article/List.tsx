import { deleteArticle, getArticles } from "@/services/article";
import type { ArticleListParams } from "@/services/article";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { type ActionType, PageContainer, type ProColumns, ProTable } from "@ant-design/pro-components";
import type { PostWithRelations, Tag as TagType } from "@blog/shared-types";
import { App, Button, Popconfirm, Space, Tag } from "antd";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function ArticleList() {
  const navigate = useNavigate();
  const actionRef = useRef<ActionType>();
  const [loading] = useState(false);
  const { message } = App.useApp();

  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(id);
      message.success("删除成功");
      actionRef.current?.reload();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const columns: ProColumns<PostWithRelations>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 50,
      search: false,
    },
    {
      title: "标题",
      dataIndex: "title",
      ellipsis: true,
      formItemProps: {
        rules: [{ required: true }],
      },
    },
    {
      title: "分类",
      dataIndex: "category",
      width: 100,
      search: false,
      render: (_, record) => record.category?.name || "-",
    },
    {
      title: "标签",
      dataIndex: "tags",
      width: 140,
      search: false,
      render: (_, record) => (
        <Space size="small" wrap>
          {record.tags?.slice(0, 2).map((tag: TagType) => (
            <Tag key={tag.id} size="small">{tag.name}</Tag>
          ))}
          {record.tags && record.tags.length > 2 && (
            <Tag size="small">+{record.tags.length - 2}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 80,
      valueEnum: {
        draft: { text: "草稿", status: "Default" },
        published: { text: "已发布", status: "Success" },
      },
    },
    {
      title: "浏览量",
      dataIndex: "viewCount",
      width: 70,
      search: false,
      sorter: true,
    },
    {
      title: "发布时间",
      dataIndex: "publishedAt",
      width: 110,
      search: false,
      sorter: true,
      render: (_, record) =>
        record.publishedAt
          ? new Date(record.publishedAt).toLocaleDateString("zh-CN")
          : "-",
    },
    {
      title: "操作",
      key: "action",
      width: 140,
      fixed: "right",
      search: false,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/${record.slug}`, "_blank")}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/articles/edit/${record.id}`)}
          />
          <Popconfirm
            title="确认删除"
            description="删除后无法恢复，是否确认删除？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="文章管理"
      style={{ padding: 0 }}
      header={{
        style: { padding: "16px 24px", margin: 0 },
      }}
    >
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
            onClick={() => navigate("/articles/create")}
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
    </PageContainer>
  );
}
