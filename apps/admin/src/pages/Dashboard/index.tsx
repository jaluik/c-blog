import { getArticles } from "@/services/article";
import { getCategories } from "@/services/category";
import { getComments } from "@/services/comment";
import { getTags } from "@/services/tag";
import {
  CommentOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import type { PostWithRelations } from "@blog/shared-types";
import { Card, Col, List, Row, Space, Statistic, Tag } from "antd";
import { useEffect, useState } from "react";

interface DashboardStats {
  articleCount: number;
  publishedCount: number;
  draftCount: number;
  commentCount: number;
  pendingCommentCount: number;
  categoryCount: number;
  tagCount: number;
  totalViews: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    articleCount: 0,
    publishedCount: 0,
    draftCount: 0,
    commentCount: 0,
    pendingCommentCount: 0,
    categoryCount: 0,
    tagCount: 0,
    totalViews: 0,
  });
  const [recentArticles, setRecentArticles] = useState<PostWithRelations[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [articlesRes, commentsRes, categories, tags] = await Promise.all([
        getArticles({ page: 1, pageSize: 100 }),
        getComments({ page: 1, pageSize: 100 }),
        getCategories(),
        getTags(),
      ]);

      const articles = articlesRes.data;
      const comments = commentsRes.data;

      setStats({
        articleCount: articles.length,
        publishedCount: articles.filter((a) => a.status === "published").length,
        draftCount: articles.filter((a) => a.status === "draft").length,
        commentCount: comments.length,
        pendingCommentCount: comments.filter((c) => !c.isApproved).length,
        categoryCount: categories.length,
        tagCount: tags.length,
        totalViews: articles.reduce((sum, a) => sum + (a.viewCount || 0), 0),
      });

      setRecentArticles(articles.slice(0, 5));
      setRecentComments(comments.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Dashboard" loading={loading}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="总文章数" value={stats.articleCount} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已发布"
              value={stats.publishedCount}
              valueStyle={{ color: "#3f8600" }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="草稿"
              value={stats.draftCount}
              valueStyle={{ color: "#cf1322" }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="总浏览量" value={stats.totalViews} prefix={<EyeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="评论总数" value={stats.commentCount} prefix={<CommentOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审核评论"
              value={stats.pendingCommentCount}
              valueStyle={{ color: stats.pendingCommentCount > 0 ? "#cf1322" : "#3f8600" }}
              prefix={<CommentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="分类数量" value={stats.categoryCount} prefix={<FolderOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="标签数量" value={stats.tagCount} prefix={<TagsOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="最近文章">
            <List
              dataSource={recentArticles}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <Space>
                        <Tag color={item.status === "published" ? "success" : "default"}>
                          {item.status === "published" ? "已发布" : "草稿"}
                        </Tag>
                        <span>{item.category?.name}</span>
                        <span>{item.viewCount} 浏览</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近评论">
            <List
              dataSource={recentComments}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      item.githubAvatar ? (
                        <img
                          src={item.githubAvatar}
                          alt={item.githubUsername}
                          style={{ width: 32, height: 32, borderRadius: "50%" }}
                        />
                      ) : null
                    }
                    title={
                      <Space>
                        <span>{item.githubUsername}</span>
                        <Tag color={item.isApproved ? "success" : "warning"}>
                          {item.isApproved ? "已通过" : "待审核"}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>文章: {item.article?.title}</div>
                        <div style={{ color: "#999", marginTop: 4 }}>{item.content}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
