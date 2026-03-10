import { getArticle, updateArticle } from "@/services/article";
import { getCategories } from "@/services/category";
import type { CategoryWithCount } from "@/services/category";
import { getTags } from "@/services/tag";
import type { TagWithCount } from "@/services/tag";
import { uploadImage } from "@/services/user";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import {
  PageContainer,
  PageLoading,
  ProForm,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import type { UpdatePostInput } from "@blog/shared-types";
import MDEditor from "@uiw/react-md-editor";
import { App, Button, Card, Image, Space, Upload } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function ArticleEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = ProForm.useForm();
  const [, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [content, setContent] = useState("");
  const { message } = App.useApp();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [coverImage, setCoverImage] = useState<string>("");

  useEffect(() => {
    fetchCategoriesAndTags();
    if (id) {
      fetchArticle(Number(id));
    }
  }, [id]);

  const fetchCategoriesAndTags = async () => {
    try {
      const [categoryData, tagData] = await Promise.all([getCategories(), getTags()]);
      setCategories(categoryData);
      setTags(tagData);
    } catch (error) {
      message.error("获取分类或标签失败");
    }
  };

  const fetchArticle = async (articleId: number) => {
    setFetching(true);
    try {
      const article = await getArticle(articleId);
      form.setFieldsValue({
        title: article.title,
        slug: article.slug,
        categoryId: article.categoryId,
        tagIds: article.tags?.map((tag) => tag.id),
        status: article.status,
        summary: article.summary,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
      });
      setContent(article.content);
      setCoverImage(article.coverImage || "");
    } catch (error) {
      message.error("获取文章失败");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!id) return;
    setLoading(true);
    try {
      const data: UpdatePostInput = {
        title: values.title,
        slug: values.slug,
        content: content,
        summary: values.summary,
        coverImage: coverImage,
        status: values.status,
        categoryId: values.categoryId,
        tagIds: values.tagIds,
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
      };

      await updateArticle(Number(id), data);
      message.success("更新成功");
      navigate("/articles");
    } catch (error: any) {
      message.error(error.response?.data?.error || "更新失败");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const url = await uploadImage(file);
      setCoverImage(url);
      message.success("上传成功");
    } catch (error) {
      message.error("上传失败");
    }
  };

  if (fetching) {
    return <PageLoading />;
  }

  return (
    <PageContainer
      title="编辑文章"
      style={{ padding: 0 }}
      header={{
        style: { padding: "16px 24px", margin: 0 },
      }}
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/articles")}>
          返回列表
        </Button>
      }
    >
      <ProForm
        form={form}
        onFinish={handleSubmit}
        submitter={{
          render: (_, dom) => (
            <Space>
              {dom}
              <Button onClick={() => navigate("/articles")}>取消</Button>
            </Space>
          ),
        }}
      >
        <Card title="基本信息" style={{ marginBottom: 24 }}>
          <ProFormText
            name="title"
            label="文章标题"
            rules={[{ required: true, message: "请输入文章标题" }]}
            placeholder="请输入文章标题"
          />

          <ProFormText
            name="slug"
            label="Slug"
            rules={[{ required: true, message: "请输入Slug" }]}
            placeholder="请输入Slug，用于URL"
            help="将用于生成文章URL，如: my-first-post"
          />

          <ProFormSelect
            name="categoryId"
            label="分类"
            options={(categories || []).map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
            placeholder="请选择分类"
          />

          <ProFormSelect
            name="tagIds"
            label="标签"
            mode="multiple"
            options={(tags || []).map((tag) => ({
              label: tag.name,
              value: tag.id,
            }))}
            placeholder="请选择标签"
          />

          <ProFormRadio.Group
            name="status"
            label="发布状态"
            options={[
              { label: "草稿", value: "draft" },
              { label: "已发布", value: "published" },
            ]}
          />

          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>封面图片</div>
            <Space>
              <Upload
                beforeUpload={(file) => {
                  handleUpload(file);
                  return false;
                }}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传封面</Button>
              </Upload>
              {coverImage && (
                <Image
                  src={coverImage}
                  alt="封面"
                  width={100}
                  height={60}
                  style={{ objectFit: "cover" }}
                />
              )}
            </Space>
          </div>
        </Card>

        <Card title="SEO 设置" style={{ marginBottom: 24 }}>
          <ProFormText name="metaTitle" label="Meta 标题" placeholder="自定义 SEO 标题（可选）" />

          <ProFormTextArea
            name="metaDescription"
            label="Meta 描述"
            placeholder="自定义 SEO 描述（可选）"
            fieldProps={{ rows: 2 }}
          />
        </Card>

        <Card title="文章摘要" style={{ marginBottom: 24 }}>
          <ProFormTextArea
            name="summary"
            placeholder="输入文章摘要，如果不填将自动从内容中提取"
            fieldProps={{ rows: 3 }}
          />
        </Card>

        <Card title="文章内容">
          <div data-color-mode="light">
            <MDEditor value={content} onChange={(value) => setContent(value || "")} height={500} />
          </div>
        </Card>
      </ProForm>
    </PageContainer>
  );
}
