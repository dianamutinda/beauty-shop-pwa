
import { useState } from 'react';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
} from 'lucide-react';

import Header from './Header';
import Sidebar from './Sidebar';
import PageContainer from './PageContainer';

const stats = [
  {
    title: 'Total Products',
    value: '248',
    change: '+12%',
    positive: true,
    icon: Package,
    description: 'Compared to last month',
  },
  {
    title: 'Sales Today',
    value: 'KSh 24,500',
    change: '+8.2%',
    positive: true,
    icon: ShoppingCart,
    description: 'Compared to yesterday',
  },
  {
    title: 'Stock Value',
    value: 'KSh 185,000',
    change: '+4.5%',
    positive: true,
    icon: Wallet,
    description: 'Current inventory value',
  },
  {
    title: 'Low Stock',
    value: '12',
    change: '3 urgent',
    positive: false,
    icon: AlertTriangle,
    description: 'Products need attention',
  },
];

const recentSales = [
  {
    id: '#SAL-001',
    product: 'Premium Sugar 2kg',
    customer: 'Walk-in Customer',
    date: 'Today, 10:42 AM',
    amount: 'KSh 350',
    status: 'Completed',
  },
  {
    id: '#SAL-002',
    product: 'Cooking Oil 1L',
    customer: 'Walk-in Customer',
    date: 'Today, 10:15 AM',
    amount: 'KSh 280',
    status: 'Completed',
  },
  {
    id: '#SAL-003',
    product: 'Maize Flour 2kg',
    customer: 'Walk-in Customer',
    date: 'Today, 9:58 AM',
    amount: 'KSh 180',
    status: 'Completed',
  },
];

const lowStock = [
  { name: 'Premium Sugar 2kg', stock: 3, unit: 'packets' },
  { name: 'Cooking Oil 1L', stock: 5, unit: 'bottles' },
  { name: 'Maize Flour 2kg', stock: 2, unit: 'packets' },
];

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-text-secondary">
            {stat.title}
          </p>

          <h3 className="mt-2 text-xl font-semibold text-text-primary sm:text-2xl">
            {stat.value}
          </h3>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-interactive-soft">
          <Icon size={19} className="text-interactive-primary" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            stat.positive
              ? 'text-status-success'
              : 'text-status-warning'
          }`}
        >
          {stat.positive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {stat.change}
        </span>

        <span className="text-xs text-text-muted">
          {stat.description}
        </span>
      </div>
    </div>
  );
}

export default function AppLayoutPreview() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-background">
      <Header
        brandName="My Shop"
        user={{
          name: 'Diana',
          email: 'owner@myshop.com',
        }}
        notificationCount={3}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="absolute inset-y-0 left-0 z-30 w-fit lg:static lg:z-auto lg:shrink-0">
          <Sidebar
            brandName="My Shop"
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>

        {/* Mobile content dimming */}
        {!sidebarCollapsed && (
          <div className="pointer-events-none absolute inset-0 z-20 bg-black/25 backdrop-blur-[1px] lg:hidden" />
        )}

        {/* Main content */}
        <main className="ml-14 min-w-0 flex-1 overflow-y-auto lg:ml-0">
          <PageContainer>
            {/* Page heading */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Overview
                </p>

                <h1 className="mt-1 text-2xl font-semibold text-text-primary">
                  Dashboard
                </h1>

                <p className="mt-1 text-sm text-text-secondary">
                  Here's what's happening with your shop today.
                </p>
              </div>

              <button className="inline-flex items-center gap-2 rounded-lg bg-interactive-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
                <Plus size={17} />
                New Sale
              </button>
            </div>

            {/* Statistics */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-text-primary">
                  Business Overview
                </h2>

                <span className="text-xs text-text-muted">
                  Today
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.title} stat={stat} />
                ))}
              </div>
            </section>

            {/* Dashboard panels */}
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* Recent sales */}
              <section className="min-w-0 rounded-xl border border-border bg-surface xl:col-span-2">
                <div className="flex items-center justify-between border-b border-divider p-4 sm:p-5">
                  <div>
                    <h2 className="font-semibold text-text-primary">
                      Recent Sales
                    </h2>
                    <p className="mt-1 text-xs text-text-muted">
                      Your latest transactions
                    </p>
                  </div>

                  <button className="rounded-lg p-2 text-text-secondary transition hover:bg-interactive-soft">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-divider text-xs text-text-muted">
                        <th className="px-5 py-3 font-medium">Sale</th>
                        <th className="px-5 py-3 font-medium">Product</th>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Amount</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentSales.map((sale) => (
                        <tr
                          key={sale.id}
                          className="border-b border-divider last:border-0"
                        >
                          <td className="whitespace-nowrap px-5 py-4 font-medium text-text-primary">
                            {sale.id}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-text-secondary">
                            {sale.product}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-text-muted">
                            {sale.date}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium text-text-primary">
                            {sale.amount}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="rounded-full bg-interactive-soft px-2.5 py-1 text-xs font-medium text-status-success">
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Low stock */}
              <section className="rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-divider p-4 sm:p-5">
                  <div>
                    <h2 className="font-semibold text-text-primary">
                      Low Stock
                    </h2>
                    <p className="mt-1 text-xs text-text-muted">
                      Products running low
                    </p>
                  </div>

                  <AlertTriangle
                    size={19}
                    className="text-status-warning"
                  />
                </div>

                <div className="divide-y divide-divider">
                  {lowStock.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3 p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          Remaining stock
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-status-warning">
                          {item.stock}
                        </p>
                        <p className="text-xs text-text-muted">
                          {item.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-divider p-4">
                  <button className="text-sm font-medium text-interactive-primary hover:underline">
                    View all low stock
                  </button>
                </div>
              </section>
            </div>
          </PageContainer>
        </main>
      </div>
    </div>
  );
}
