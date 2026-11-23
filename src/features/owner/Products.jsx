import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Search,
  Plus,
  ChevronRight,
  Package,
  AlertTriangle,
  PackageX,
  Wallet,
} from 'lucide-react'

import { searchProducts } from '../../db/products'
import { formatKsh, stockStatus } from '../../lib/format'

import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import StatCard from '../../components/ui/StatCard'
import PageContainer from '../../components/layout/PageContainer'
import PageHeader from '../../components/layout/PageHeader'

function ProductCard({ product }) {
  const threshold = product.lowStockAt ?? 5
  const status = stockStatus(product.stock, threshold)

  const badgeVariant =
    product.stock <= 0
      ? 'danger'
      : product.stock <= threshold
        ? 'warning'
        : 'success'

  return (
    <Link
      to={`/owner/products/${product.id}/edit`}
      className="block h-full"
    >
      <Card
        variant="outlined"
        padding="md"
        hoverable
        className="h-full transition-colors"
      >
        <div className="flex items-center justify-between gap-4 lg:h-full lg:flex-col lg:items-stretch">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {product.name}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              SKU: {product.sku || 'Not provided'}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Badge variant={badgeVariant} size="sm">
                {status.label}
              </Badge>

              <span className="text-xs text-text-secondary">
                {product.stock} in stock
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:mt-auto lg:justify-between lg:border-t lg:border-divider lg:pt-4">
            <div className="text-right lg:text-left">
              <p className="text-sm font-semibold text-text-primary">
                {formatKsh(product.sellingPrice)}
              </p>

              <p className="mt-1 text-[11px] text-text-muted">
                Selling price
              </p>
            </div>

            <ChevronRight
              size={18}
              strokeWidth={1.8}
              className="text-text-muted lg:hidden"
            />
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function Products() {
  const [text, setText] = useState('')

  const products = useLiveQuery(
    () => searchProducts(text),
    [text]
  )

  const allProducts = useLiveQuery(
    () => searchProducts(''),
    []
  )

  const stats = {
    total: allProducts?.length ?? 0,

    lowStock: allProducts?.filter((product) => {
      const threshold = product.lowStockAt ?? 5
      return product.stock > 0 && product.stock <= threshold
    }).length ?? 0,

    outOfStock: allProducts?.filter(
      (product) => product.stock <= 0
    ).length ?? 0,

    stockValue: allProducts?.reduce(
      (total, product) =>
        total +
        (Number(product.sellingPrice) || 0) *
          (Number(product.stock) || 0),
      0
    ) ?? 0,
  }

  const statsLoading = !allProducts

  return (
    <PageContainer
      maxWidth="max-w-[1440px]"
      className="pb-24"
    >
      <div className="space-y-6">
        <PageHeader
          title="Products"
          description="Manage your products, prices, and stock."
        />

        {/* Inventory statistics */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            title="Total Products"
            value={statsLoading ? '—' : stats.total}
            icon={<Package size={20} />}
          />

          <StatCard
            title="Low Stock"
            value={statsLoading ? '—' : stats.lowStock}
            icon={<AlertTriangle size={20} />}
          />

          <StatCard
            title="Out of Stock"
            value={statsLoading ? '—' : stats.outOfStock}
            icon={<PackageX size={20} />}
          />

          <StatCard
            title="Stock Value"
            value={statsLoading ? '—' : formatKsh(stats.stockValue)}
            icon={<Wallet size={20} />}
          />
        </div>

        {/* Search */}
        <div className="max-w-xl">
          <Input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search by name or SKU..."
            leftIcon={<Search size={18} strokeWidth={1.8} />}
          />
        </div>

        {/* Product list */}
        {!products ? (
          <Card variant="outlined" padding="lg">
            <p className="text-center text-sm text-text-muted">
              Loading products...
            </p>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">
                {products.length}{' '}
                {products.length === 1 ? 'product' : 'products'}
              </p>

              {text && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setText('')}
                >
                  Clear search
                </Button>
              )}
            </div>

            {products.length === 0 ? (
              <Card
                variant="outlined"
                padding="lg"
                className="text-center"
              >
                <p className="text-sm font-semibold text-text-primary">
                  {text ? 'No products found' : 'No products yet'}
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                  {text
                    ? `Nothing matches "${text}". Try another name or SKU.`
                    : 'Add your first product to start managing your inventory.'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Add Product */}
      <Link
        to="/owner/products/new"
        className="fixed bottom-7 right-7 z-30"
      >
        <Button
          size="lg"
          className="rounded-full shadow-md"
        >
          <Plus size={19} strokeWidth={2.2} />
          Add Product
        </Button>
      </Link>
    </PageContainer>
  )
}