import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Search, AlertTriangle, Package, Download, Pencil, Trash2 } from 'lucide-react';
import AddProductModal from './AddProductModal';
import { downloadCSV } from '../utils/csvExport';

interface InventoryTabProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const InventoryTab: React.FC<InventoryTabProps> = ({ products, onAddProduct, onEditProduct, onDeleteProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    downloadCSV<Product>(products, [
      { header: 'Product Name', accessor: p => p.name },
      { header: 'Company', accessor: p => p.company },
      { header: 'Wholesale Price', accessor: p => p.wholesalePrice },
      { header: 'Retail Price', accessor: p => p.retailPrice },
      { header: 'Current Stock', accessor: p => p.currentStock },
      { header: 'Stock Value (Retail)', accessor: p => (p.currentStock * p.retailPrice).toFixed(2) },
    ], `inventory_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = (product: Product) => {
    if (editingProduct) {
      onEditProduct(product);
    } else {
      onAddProduct(product);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm active:transform active:scale-95 justify-center flex-1 sm:flex-none"
            title="Export to CSV"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm active:transform active:scale-95 flex-1 sm:flex-none justify-center whitespace-nowrap"
          >
            <Plus size={18} />
            Add New Product
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-emerald-50 text-emerald-900 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4 text-right">W. Price</th>
                <th className="px-6 py-4 text-right">R. Price</th>
                <th className="px-6 py-4 text-center">Current Stock</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Package size={48} className="text-slate-300" />
                      <p className="text-lg">No products found</p>
                      <p className="text-sm">Add a new product to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-6 py-4 text-slate-600">{product.company}</td>
                    <td className="px-6 py-4 text-right text-slate-600 font-mono">
                      ${product.wholesalePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900 font-mono font-medium">
                      ${product.retailPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono font-bold text-slate-800 text-lg">
                        {product.currentStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.currentStock < 10 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <AlertTriangle size={12} />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product.id)}
                          className="p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSave={handleSave}
        initialData={editingProduct}
      />
    </div>
  );
};

export default InventoryTab;