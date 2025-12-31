import React, { useState, useMemo } from 'react';
import { Product, SaleItem, MonthEndReport } from '../types';
import { Calculator, Save, AlertCircle, TrendingUp, DollarSign, Download, Archive, Calendar, ArrowLeft } from 'lucide-react';
import { downloadCSV } from '../utils/csvExport';

interface StocktakingTabProps {
  products: Product[];
  reports: MonthEndReport[];
  onFinalizeMonth: (salesData: SaleItem[]) => void;
}

const StocktakingTab: React.FC<StocktakingTabProps> = ({ products, reports, onFinalizeMonth }) => {
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');
  const [selectedReport, setSelectedReport] = useState<MonthEndReport | null>(null);

  // --- Current Month Logic ---
  const [actualStocks, setActualStocks] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);

  const handleStockChange = (id: string, value: string) => {
    setActualStocks(prev => ({ ...prev, [id]: value }));
    if (showSummary) setShowSummary(false);
  };

  const calculationResult = useMemo(() => {
    let totalRevenue = 0;
    let totalProfit = 0;
    const items: SaleItem[] = [];

    products.forEach(p => {
      const actualStr = actualStocks[p.id];
      const actual = actualStr === undefined || actualStr === '' ? p.currentStock : parseInt(actualStr, 10);
      const safeActual = Math.max(0, actual);
      const salesQty = p.currentStock - safeActual;
      const revenue = salesQty * p.retailPrice;
      const profit = salesQty * (p.retailPrice - p.wholesalePrice);

      totalRevenue += revenue;
      totalProfit += profit;

      items.push({
        productId: p.id,
        productName: p.name,
        systemStock: p.currentStock,
        actualStock: safeActual,
        soldQuantity: salesQty,
        revenue,
        profit
      });
    });

    return { totalRevenue, totalProfit, items };
  }, [products, actualStocks]);

  const handleFinalize = () => {
    if (window.confirm("Are you sure you want to finalize the month? This will save the current report to history and reset the stock.")) {
      onFinalizeMonth(calculationResult.items);
      setActualStocks({});
      setShowSummary(false);
    }
  };

  // --- Export Helpers ---
  const exportItems = (items: SaleItem[], suffix: string) => {
    downloadCSV<SaleItem>(items, [
      { header: 'Product Name', accessor: i => i.productName },
      { header: 'System Stock', accessor: i => i.systemStock },
      { header: 'Actual Stock', accessor: i => i.actualStock },
      { header: 'Sold Quantity', accessor: i => i.soldQuantity },
      { header: 'Revenue', accessor: i => i.revenue.toFixed(2) },
      { header: 'Profit', accessor: i => i.profit.toFixed(2) },
    ], `report_${suffix}.csv`);
  };

  // --- Render Functions ---

  const renderHistory = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar: List of Months */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden h-fit">
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 font-bold text-emerald-800 flex items-center gap-2">
           <Archive size={18} /> Past Reports
        </div>
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No reports saved yet.</div>
          ) : (
            reports.map((report) => {
               const date = new Date(report.date);
               const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' });
               const isActive = selectedReport?.id === report.id;
               
               return (
                 <button
                   key={report.id}
                   onClick={() => setSelectedReport(report)}
                   className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${
                     isActive ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-slate-50 text-slate-600'
                   }`}
                 >
                   <Calendar size={16} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
                   {label}
                 </button>
               );
            })
          )}
        </div>
      </div>

      {/* Main Content: Selected Report Details */}
      <div className="lg:col-span-3">
        {selectedReport ? (
          <div className="space-y-6 animate-fade-in">
             {/* Report Header */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex flex-wrap gap-6 items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Report: {new Date(selectedReport.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Generated on {new Date(selectedReport.date).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => exportItems(selectedReport.details, selectedReport.date.split('T')[0])}
                  className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-medium hover:bg-emerald-200 transition-colors"
                >
                  <Download size={18} /> Download CSV
                </button>
             </div>

             {/* Summary Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-slate-800 font-mono">${selectedReport.totalSales.toFixed(2)}</div>
               </div>
               <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm">
                  <div className="text-sm text-emerald-600 mb-1">Total Profit</div>
                  <div className="text-2xl font-bold text-emerald-700 font-mono">${selectedReport.totalProfit.toFixed(2)}</div>
               </div>
             </div>

             {/* Details Table */}
             <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-3">Product</th>
                        <th className="px-4 py-3 text-center">System Stock</th>
                        <th className="px-4 py-3 text-center">Actual Stock</th>
                        <th className="px-4 py-3 text-right">Sold</th>
                        <th className="px-6 py-3 text-right">Revenue</th>
                        <th className="px-6 py-3 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedReport.details.map((item) => (
                        <tr key={item.productId} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-medium text-slate-900">{item.productName}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{item.systemStock}</td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-800">{item.actualStock}</td>
                          <td className="px-4 py-3 text-right text-emerald-600">{item.soldQuantity}</td>
                          <td className="px-6 py-3 text-right font-mono">${item.revenue.toFixed(2)}</td>
                          <td className="px-6 py-3 text-right font-mono text-emerald-700 font-medium">${item.profit.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-slate-400">
             <Archive size={48} className="mb-4 opacity-50" />
             <p className="text-lg">Select a report from the list to view details</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation for Sub-views */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setViewMode('current')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'current' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator size={18} /> Current Month
        </button>
        <button
          onClick={() => setViewMode('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'history' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Archive size={18} /> History / Archives
        </button>
      </div>

      {viewMode === 'history' ? renderHistory() : (
        // Existing Stocktaking UI (Current Month)
        <div className="space-y-8 animate-fade-in">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4 text-emerald-900">
            <AlertCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-lg">Current Month Stocktaking</h2>
              <p className="text-emerald-800/80 text-sm mt-1">
                Enter physical counts. Finalizing will save a permanent report to the History tab and update inventory levels.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-4 py-4 text-center">System Stock</th>
                        <th className="px-4 py-4 w-40">Actual Stock</th>
                        <th className="px-4 py-4 text-right">Est. Sales</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map(p => {
                        const actualVal = actualStocks[p.id] ?? '';
                        const actualNum = actualVal === '' ? p.currentStock : parseInt(actualVal, 10);
                        const diff = p.currentStock - actualNum;
                        
                        return (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{p.name}</div>
                              <div className="text-xs text-slate-500">{p.company}</div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono text-sm">
                                {p.currentStock}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="number"
                                min="0"
                                value={actualVal}
                                placeholder={p.currentStock.toString()}
                                onChange={(e) => handleStockChange(p.id, e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg text-center font-bold focus:ring-2 outline-none transition-all ${
                                    actualVal !== '' && actualNum !== p.currentStock 
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 focus:ring-emerald-500' 
                                    : 'border-slate-300 focus:ring-slate-400'
                                }`}
                              />
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className={`font-mono font-medium ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                {diff > 0 ? '+' : ''}{diff}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100 sticky top-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  Summary Report
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                      <TrendingUp size={16} /> Est. Revenue
                    </div>
                    <div className="text-2xl font-bold text-slate-800 font-mono">
                      ${calculationResult.totalRevenue.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="text-sm text-emerald-700 mb-1 flex items-center gap-2">
                      <DollarSign size={16} /> Est. Profit
                    </div>
                    <div className="text-2xl font-bold text-emerald-700 font-mono">
                      ${calculationResult.totalProfit.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => setShowSummary(true)}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      showSummary 
                      ? 'bg-slate-100 text-slate-400 cursor-default' 
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                    disabled={showSummary}
                  >
                    {showSummary ? 'Calculated' : 'Calculate Sales'}
                  </button>

                  {showSummary && (
                    <div className="flex flex-col gap-2 animate-fade-in">
                       <button
                        onClick={() => exportItems(calculationResult.items, 'draft')}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 py-2.5 rounded-lg font-medium transition-all"
                      >
                        <Download size={18} />
                        Download Draft
                      </button>
                      <button
                        onClick={handleFinalize}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-200 transition-all active:transform active:scale-95"
                      >
                        <Save size={18} />
                        Finalize & Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StocktakingTab;