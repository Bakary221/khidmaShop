import { categoriesSeed } from "@/services/mock-db";
import { Category } from "@/types/product";
import { delay } from "@/utils/delay";
import { createId } from "@/utils/id";

let categories: Category[] = [...categoriesSeed];

type ListCategoriesOptions = {
  includeInactive?: boolean;
};

export async function listCategories(options?: ListCategoriesOptions) {
  await delay(400);
  if (options?.includeInactive) {
    return [...categories];
  }
  return categories.filter((category) => category.active);
}

export async function createCategory(input: Omit<Category, "id">) {
  await delay(500);
  const category = { ...input, id: createId("cat"), active: input.active ?? true };
  categories = [category, ...categories];
  return category;
}

export async function updateCategory(id: string, input: Omit<Category, "id">) {
  await delay(500);
  categories = categories.map((category) => (category.id === id ? { id, ...input } : category));
  return categories.find((category) => category.id === id) ?? null;
}

export async function toggleCategoryActive(id: string, active: boolean) {
  await delay(350);
  categories = categories.map((category) => (category.id === id ? { ...category, active } : category));
  return categories.find((category) => category.id === id) ?? null;
}

export async function deleteCategory(id: string) {
  await delay(400);
  categories = categories.filter((category) => category.id !== id);
  return true;
}

export function getCategorySnapshot() {
  return [...categories];
}
