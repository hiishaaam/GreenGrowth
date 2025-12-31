import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, ShoppingCart, ClipboardCheck, Sprout } from 'lucide-react';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: Tab.INVENTORY, label: 'Inventory', icon: LayoutDashboard },
    { id: Tab.PURCHASE, label: 'Restock / Purchase', icon: ShoppingCart },
    { id: Tab.STOCKTAKING, label: 'Stocktaking', icon: ClipboardCheck },
  ];

  return (
    <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">GreenGrowth</h1>
              <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Inventory System</p>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-inner'
                      : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-300' : 'text-emerald-400'} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button - simplified for this implementation */}
          <div className="md:hidden flex space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-2 rounded-md transition-colors ${
                  activeTab === item.id ? 'bg-emerald-800 text-white' : 'text-emerald-200'
                }`}
                aria-label={item.label}
              >
                <item.icon size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;