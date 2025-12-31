import React, { useState, useEffect } from 'react';
import { Product, PurchaseLog, SaleItem, Tab, MonthEndReport } from './types';
import * as storage from './services/storageService';
import Navbar from './components/Navbar';
import InventoryTab from './components/InventoryTab';
import PurchaseTab from './components/PurchaseTab';
import StocktakingTab from './components/StocktakingTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.INVENTORY);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseLog[]>([]);
  const [reports, setReports] = useState<MonthEndReport[]>([]);

  // Load initial data
  useEffect(() => {
    setProducts(storage.getProducts());
    setPurchaseHistory(storage.getPurchases());
    setReports(storage.getReports());
  }, []);

  // --- Product Management ---

  const handleAddProduct = (newProduct: Product) => {
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    storage.saveProducts(updatedProducts);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updatedProducts = products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    );
    setProducts(updatedProducts);
    storage.saveProducts(updatedProducts);
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    storage.saveProducts(updatedProducts);
  };

  // --- Stock & Purchase Management ---

  const handleAddStock = (productId: string, quantity: number) => {
    // 1. Update Product Stock
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return { ...p, currentStock: p.currentStock + quantity };
      }
      return p;
    });
    setProducts(updatedProducts);
    storage.saveProducts(updatedProducts);

    // 2. Add Purchase Log
    const product = products.find(p => p.id === productId);
    if (product) {
      const newLog: PurchaseLog = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        productId,
        productName: product.name,
        quantity,
      };
      const updatedHistory = [newLog, ...purchaseHistory];
      setPurchaseHistory(updatedHistory);
      storage.savePurchase(newLog);
    }
  };

  // --- Month-End Processing ---

  const handleFinalizeMonth = (salesData: SaleItem[]) => {
    // 1. Create Report
    const newReport: MonthEndReport = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      totalSales: salesData.reduce((acc, item) => acc + item.revenue, 0),
      totalProfit: salesData.reduce((acc, item) => acc + item.profit, 0),
      details: salesData
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    storage.saveReport(newReport);

    // 2. Update stock levels to the "Actual Stock"
    const updatedProducts = products.map(p => {
      const saleRecord = salesData.find(s => s.productId === p.id);
      if (saleRecord) {
        return { ...p, currentStock: saleRecord.actualStock };
      }
      return p;
    });
    
    setProducts(updatedProducts);
    storage.saveProducts(updatedProducts);

    alert('Month finalized! Report saved to History.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {activeTab === Tab.INVENTORY && (
            <InventoryTab 
              products={products} 
              onAddProduct={handleAddProduct}
              onEditProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === Tab.PURCHASE && (
            <PurchaseTab 
              products={products} 
              purchaseHistory={purchaseHistory} 
              onAddStock={handleAddStock} 
            />
          )}

          {activeTab === Tab.STOCKTAKING && (
            <StocktakingTab 
              products={products} 
              reports={reports}
              onFinalizeMonth={handleFinalizeMonth} 
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} GreenGrowth Inventory System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;