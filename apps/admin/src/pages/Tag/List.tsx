import { createTag, deleteTag, getTags, updateTag } from "@/services/tag";
import type { TagWithCount } from "@/services/tag";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  type ActionType,
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormText,
  ProTable,
} from "@ant-design/pro-components";
import { App, Button, Form, Popconfirm, Space } from "antd";
import { useRef, useState } from "react";

export function TagList() {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null);
  const { message } = App.useApp();

  const handleDelete = async (id: number) => {
    try {
      await deleteTag(id);
      message.success("删除成功");
      actionRef.current?.reload();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTag) {
        await updateTag(editingTag.id, values);
        message.success("更新成功");
      } else {
        await createTag(values);
        message.success("创建成功");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingTag(null);
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.response?.data?.error || "操作失败");
    }
  };

  const openEditModal = (record: TagWithCount) => {
    setEditingTag(record);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const columns: ProColumns<TagWithCount>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      search: false,
    },
    {
      title: "名称",
      dataIndex: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      search: false,
    },
    {
      title: "文章数",
      dataIndex: "articleCount",
      width: 100,
      search: false,
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right",
      search: false,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
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
    <PageContainer
      title="标签管理"
      style={{ padding: 0 }}
      header={{
        style: { padding: "16px 24px", margin: 0 },
      }}
    >
      <ProTable<TagWithCount>
        headerTitle="标签列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            新建标签
          </Button>,
        ]}
        request={async () => {
          const data = await getTags();
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
        pagination={false}
      />

      <ModalForm
        title={editingTag ? "编辑标签" : "新建标签"}
        open={modalVisible}
        onOpenChange={setModalVisible}
        form={form}
        onFinish={handleSubmit}
        autoFocusFirstInput
      >
        <ProFormText
          name="name"
          label="名称"
          rules={[{ required: true, message: "请输入标签名称" }]}
          placeholder="请输入标签名称"
        />
        <ProFormText
          name="slug"
          label="Slug"
          placeholder="可选，用于URL"
          help="将用于生成标签URL，如: javascript"
        />
      </ModalForm>
    </PageContainer>
  );
}
