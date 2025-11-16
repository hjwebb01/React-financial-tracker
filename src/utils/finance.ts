import { sampleCategories } from "../sampleData";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatMoney = (amountCents: number): string =>
  currencyFormatter.format(amountCents / 100);

export const parseMoneyInput = (value: string): number | null => {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/[^0-9.-]/g, "").trim();
  if (cleaned === "" || cleaned === "-" || cleaned === ".") {
    return null;
  }

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 100);
};

export { sampleCategories };

export const categoryIndexMap = new Map(sampleCategories.map((cat, idx) => [cat.id, idx]));

export const getCategoryIndex = (categoryId: string): number => {
  return categoryIndexMap.get(categoryId) ?? -1;
};

export const getCurrentMonthStart = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

export const getCurrentMonthEnd = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
};
