import {
  type ModerateCommentData,
  deleteComment,
  getComments,
  moderateComment,
} from "@/services/comment";
import type { CommentListParams } from "@/services/comment";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from "@ant-design/pro-components";
import type { Comment, CommentStatus } from "@blog/shared-types";
import {
  App,
  Avatar,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from "antd";
import { useRef, useState } from "react";

const { Text, Paragraph } = Typography;

interface CommentWithArticle extends Comment {
  article?: {
    id: number;
    title: string;
    slug: string;
  };
}

const statusMap: Record<
  CommentStatus,
  { text: string; color: string; status: "success" | "error" | "warning" | "default" }
> = {
  approved: { text: "已通过", color: "success", status: "success" },
  rejected: { text: "已拒绝", color: "error", status: "error" },
  pending: { text: "待审核", color: "warning", status: "warning" },
};

export function CommentList() {
  const actionRef = useRef<ActionType>();
  const { message } = App.useApp();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingComment, setRejectingComment] = useState<CommentWithArticle | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewingComment, setViewingComment] = useState<CommentWithArticle | null>(null);

  const handleApprove = async (id: number) => {
    try {
      await moderateComment(id, { status: "approved" });
      message.success("审核通过");
      actionRef.current?.reload();
    } catch (error) {
      message.error("操作失败");
    }
  };

  const handleReject = (record: CommentWithArticle) => {
    setRejectingComment(record);
    setRejectionReason("");
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectingComment) return;

    if (!rejectionReason.trim()) {
      message.error("请输入拒绝原因");
      return;
    }

    try {
      await moderateComment(rejectingComment.id, {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
      });
      message.success("已拒绝并发送原因");
      setRejectModalVisible(false);
      setRejectingComment(null);
      setRejectionReason("");
      actionRef.current?.reload();
    } catch (error) {
      message.error("操作失败");
    }
  };

  const handleResetToPending = async (id: number) => {
    try {
      await moderateComment(id, { status: "pending" });
      message.success("已重置为待审核");
      actionRef.current?.reload();
    } catch (error) {
      message.error("操作失败");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteComment(id);
      message.success("删除成功");
      actionRef.current?.reload();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const showDetail = (record: CommentWithArticle) => {
    setViewingComment(record);
    setDetailModalVisible(true);
  };

  const columns: ProColumns<CommentWithArticle>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      search: false,
    },
    {
      title: "用户",
      dataIndex: "githubUsername",
      width: 150,
      render: (_, record) => (
        <Space>
          {record.githubAvatar && <Avatar src={record.githubAvatar} size="small" />}
          <span>{record.githubUsername}</span>
        </Space>
      ),
    },
    {
      title: "评论内容",
      dataIndex: "content",
      ellipsis: true,
      render: (_, record) => (
        <div className="cursor-pointer hover:text-neon-cyan" onClick={() => showDetail(record)}>
          {record.content.length > 50 ? `${record.content.slice(0, 50)}...` : record.content}
        </div>
      ),
    },
    {
      title: "文章",
      dataIndex: "article",
      width: 200,
      search: false,
      render: (_, record) => (
        <a href={`/${record.article?.slug}`} target="_blank" rel="noopener noreferrer">
          {record.article?.title || "-"}
        </a>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      valueEnum: {
        pending: { text: "待审核", status: "Warning" },
        approved: { text: "已通过", status: "Success" },
        rejected: { text: "已拒绝", status: "Error" },
      },
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={statusMap[record.status].color}>{statusMap[record.status].text}</Tag>
          {record.status === "rejected" && record.rejectionReason && (
            <Text type="secondary" className="text-xs">
              有拒绝原因
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 180,
      search: false,
      valueType: "dateTime",
      sorter: true,
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right",
      search: false,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            详情
          </Button>
          {record.status !== "approved" && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id)}
            >
              通过
            </Button>
          )}
          {record.status !== "rejected" && (
            <Button
              type="link"
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record)}
            >
              拒绝
            </Button>
          )}
          {record.status === "rejected" && (
            <Button
              type="link"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => handleResetToPending(record.id)}
            >
              重置
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
    <PageContainer
      title="评论管理"
      style={{ padding: 0 }}
      header={{
        style: { padding: "16px 24px", margin: 0 },
      }}
    >
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
            status: params.status as CommentStatus,
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

      {/* 拒绝原因输入弹窗 */}
      <Modal
        title="拒绝评论"
        open={rejectModalVisible}
        onOk={handleRejectSubmit}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectingComment(null);
          setRejectionReason("");
        }}
        okText="确认拒绝"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" className="w-full" size="large">
          <div>
            <Text type="secondary">评论内容：</Text>
            <Paragraph className="mt-1 p-3 bg-gray-50 rounded">
              {rejectingComment?.content}
            </Paragraph>
          </div>
          <div>
            <Text>拒绝原因（用户将看到此原因）：</Text>
            <Input.TextArea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="请输入拒绝原因，例如：评论包含不当内容"
              rows={4}
              maxLength={500}
              showCount
            />
          </div>
        </Space>
      </Modal>

      {/* 评论详情弹窗 */}
      <Modal
        title="评论详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setViewingComment(null);
        }}
        footer={
          <Space>
            {viewingComment?.status !== "approved" && (
              <Button
                type="primary"
                onClick={() => {
                  if (viewingComment) {
                    handleApprove(viewingComment.id);
                    setDetailModalVisible(false);
                  }
                }}
              >
                通过
              </Button>
            )}
            {viewingComment?.status !== "rejected" && (
              <Button
                danger
                onClick={() => {
                  if (viewingComment) {
                    setDetailModalVisible(false);
                    handleReject(viewingComment);
                  }
                }}
              >
                拒绝
              </Button>
            )}
            <Button
              onClick={() => {
                setDetailModalVisible(false);
                setViewingComment(null);
              }}
            >
              关闭
            </Button>
          </Space>
        }
        width={600}
      >
        {viewingComment && (
          <Card bordered={false}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="评论ID">{viewingComment.id}</Descriptions.Item>
              <Descriptions.Item label="评论者">
                <Space>
                  {viewingComment.githubAvatar && (
                    <Avatar src={viewingComment.githubAvatar} size="small" />
                  )}
                  <span>{viewingComment.githubUsername}</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="评论文章">
                <a
                  href={`/${viewingComment.article?.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {viewingComment.article?.title || "-"}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={statusMap[viewingComment.status].color}>
                  {statusMap[viewingComment.status].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(viewingComment.createdAt).toLocaleString()}
              </Descriptions.Item>
              {viewingComment.updatedAt !== viewingComment.createdAt && (
                <Descriptions.Item label="最后更新">
                  {new Date(viewingComment.updatedAt).toLocaleString()}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="评论内容">
                <Paragraph style={{ whiteSpace: "pre-wrap" }}>{viewingComment.content}</Paragraph>
              </Descriptions.Item>
              {viewingComment.rejectionReason && (
                <Descriptions.Item label="拒绝原因">
                  <Text type="danger" style={{ whiteSpace: "pre-wrap" }}>
                    {viewingComment.rejectionReason}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </Modal>
    </PageContainer>
  );
}
