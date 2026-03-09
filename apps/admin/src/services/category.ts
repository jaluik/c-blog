import type { Category, CreateCategoryInput } from "@blog/shared-types";
import { request } from "./api";

export interface CategoryWithCount extends Category {
  articleCount?: number;
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  const response = await request<{ data: CategoryWithCount[] }>({
    method: "GET",
    url: "/admin/categories",
  });
  return response.data;
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  const response = await request<{ data: Category }>({
    method: "POST",
    url: "/admin/categories",
    data,
  });
  return response.data;
}

export async function updateCategory(
  id: number,
  data: Partial<CreateCategoryInput>,
): Promise<Category> {
  const response = await request<{ data: Category }>({
    method: "PUT",
    url: `/admin/categories/${id}`,
    data,
  });
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await request<void>({
    method: "DELETE",
    url: `/admin/categories/${id}`,
  });
}
