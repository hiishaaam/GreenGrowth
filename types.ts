export interface Product {
  id: string;
  name: string;
  company: string;
  wholesalePrice: number;
  retailPrice: number;
  currentStock: number;
}

export interface PurchaseLog {
  id: string;
  date: string;
  productId: string;
  productName: string; // Store name denormalized for easier display if product deleted
  quantity: number;
}

export interface MonthEndReport {
  id: string;
  date: string;
  totalSales: number;
  totalProfit: number;
  details: SaleItem[];
}

export interface SaleItem {
  productId: string;
  productName: string;
  systemStock: number;
  actualStock: number;
  soldQuantity: number;
  revenue: number;
  profit: number;
}

export enum Tab {
  INVENTORY = 'INVENTORY',
  PURCHASE = 'PURCHASE',
  STOCKTAKING = 'STOCKTAKING',
}