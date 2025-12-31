import { Product, PurchaseLog, MonthEndReport } from '../types';

const KEYS = {
  PRODUCTS: 'gg_products',
  PURCHASES: 'gg_purchases',
  REPORTS: 'gg_reports',
};

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(KEYS.PRODUCTS);
  return stored ? JSON.parse(stored) : [];
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const getPurchases = (): PurchaseLog[] => {
  const stored = localStorage.getItem(KEYS.PURCHASES);
  return stored ? JSON.parse(stored) : [];
};

export const savePurchase = (log: PurchaseLog) => {
  const purchases = getPurchases();
  const updated = [log, ...purchases];
  localStorage.setItem(KEYS.PURCHASES, JSON.stringify(updated));
};

export const getReports = (): MonthEndReport[] => {
  const stored = localStorage.getItem(KEYS.REPORTS);
  return stored ? JSON.parse(stored) : [];
};

export const saveReport = (report: MonthEndReport) => {
  const reports = getReports();
  const updated = [report, ...reports];
  localStorage.setItem(KEYS.REPORTS, JSON.stringify(updated));
};
