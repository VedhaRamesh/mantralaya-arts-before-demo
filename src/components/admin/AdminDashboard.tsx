import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserManagementView } from './UserManagementView';
import { ProductManagementView } from './ProductManagementView';
import { CategoryManagementView } from './CategoryManagementView';
import { ShopSettingsView } from './ShopSettingsView';
import { ReportsDashboardView } from './ReportsDashboardView';
import {
  Shield,
  Users,
  Package,
  Layers,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  Settings,
  BarChart3,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab?: (tab: 'store' | 'orders' | 'admin' | 'supplier') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { products, categories, orders, allUsers, resetToSeedData, shopSettings, updateShopSettings } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'reports' | 'users' | 'products' | 'categories' | 'settings'>('reports');

  // KPI Calculations
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity < 10).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0 || p.status === 'OUT_OF_STOCK').length;
  const totalOrders = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.currentStatus === 'PENDING_SUPPLIER_REVIEW').length;
  const totalCustomers = allUsers.filter((u) => u.role === 'CUSTOMER').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-28">
      {/* Admin Executive Header */}
      <div className="bg-[#581216] rounded-3xl p-6 text-amber-50 shadow-md border border-amber-600/30 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-100">
                Administrator Headquarters
              </h1>
              <p className="text-xs text-amber-200/80">
                Mantralaya Arts Business Management Console · Products, Orders &amp; Profiles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Reset catalog, users, and orders to initial seed state?')) {
                  resetToSeedData();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-amber-200 text-xs font-medium border border-amber-400/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Cards (Feature 7) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-amber-600/30">
          <div className="bg-black/20 p-3 rounded-2xl border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Total Products</p>
            <p className="text-xl font-bold font-mono text-amber-300 mt-0.5">{totalProducts}</p>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Low Stock (&lt;10)</p>
            <p className="text-xl font-bold font-mono text-amber-400 mt-0.5">{lowStockCount}</p>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Out of Stock</p>
            <p className="text-xl font-bold font-mono text-rose-300 mt-0.5">{outOfStockCount}</p>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Total Orders</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">{totalOrders}</p>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Pending Review</p>
            <p className="text-xl font-bold font-mono text-amber-300 mt-0.5">{pendingOrdersCount}</p>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl border border-amber-400/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-semibold">Total Devotees</p>
            <p className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
              {totalCustomers}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveAdminTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'reports'
              ? 'bg-[#701A1E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-300" />
          <span>Reports &amp; Analytics</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'users'
              ? 'bg-[#701A1E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Users className="w-4 h-4 text-amber-300" />
          <span>User Profile Management</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-mono">
            {allUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'products'
              ? 'bg-[#701A1E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Package className="w-4 h-4 text-amber-300" />
          <span>Product Management</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 font-mono">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'categories'
              ? 'bg-[#701A1E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-300" />
          <span>Category Management</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 font-mono">
            {categories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'settings'
              ? 'bg-[#701A1E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Settings className="w-4 h-4 text-amber-300" />
          <span>Store &amp; WhatsApp Settings</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeAdminTab === 'reports' && <ReportsDashboardView />}
      {activeAdminTab === 'users' && <UserManagementView />}
      {activeAdminTab === 'products' && <ProductManagementView />}
      {activeAdminTab === 'categories' && <CategoryManagementView />}
      {activeAdminTab === 'settings' && (
        <ShopSettingsView settings={shopSettings} onSave={updateShopSettings} />
      )}
    </div>
  );
};
