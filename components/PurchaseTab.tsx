import React, { useState } from 'react';
import { Product, PurchaseLog } from '../types';
import { PlusCircle, History, Calendar, Download } from 'lucide-react';
import { downloadCSV } from '../utils/csvExport';

interface PurchaseTabProps {
  products: Product[];
  purchaseHistory: PurchaseLog[];
  onAddStock: (productId: string, quantity: number) => void;
}

const PurchaseTab: React.FC<PurchaseTabProps> = ({ products, purchaseHistory, onAddStock }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) return;
    
    onAddStock(selectedProductId, parseInt(quantity, 10));
    
    // Reset form
    setSelectedProductId('');
    setQuantity('');
  };

  const handleExport = () => {
    downloadCSV<PurchaseLog>(purchaseHistory, [
      { header: 'Date', accessor: log => new Date(log.date).toLocaleString() },
      { header: 'Product ID', accessor: log => log.productId },
      { header: 'Product Name', accessor: log => log.productName },
      { header: 'Quantity Added', accessor: log => log.quantity },
    ], `purchases_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Purchase Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 sticky top-6">
          <div className="flex items-center gap-2 mb-6 text-emerald-800">
            <PlusCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">New Purchase</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.company})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Purchased</label>
              <input
                required
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Enter quantity"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedProductId || !quantity}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-md mt-4"
            >
              Add Stock
            </button>
          </form>
        </div>
      </div>

      {/* History Log */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-4 border-b border-emerald-50 bg-emerald-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800">
              <History className="w-5 h-5" />
              <h2 className="text-lg font-bold">Purchase History</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                {purchaseHistory.length} Records
              </span>
              <button
                onClick={handleExport}
                className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Export CSV"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3 text-right">Quantity Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseHistory.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                      No purchase history yet.
                    </td>
                  </tr>
                ) : (
                  purchaseHistory.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-emerald-500" />
                          {new Date(log.date).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{log.productName}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                          +{log.quantity}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTab;