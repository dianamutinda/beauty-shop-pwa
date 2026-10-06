export function productToRow(p) {
  return {
    id: p.id,
    shop_id: p.shopId,
    sku: p.sku,
    name: p.name,
    category_id: p.categoryId,
    selling_price: p.sellingPrice,
    buying_price: p.buyingPrice,
    description: p.description,
    attributes: p.attributes,
    low_stock_level: p.lowStockLevel ?? null,
    updated_at: p.lastUpdated,
  }
}

export function categoryToRow(c) {
  return {
    id: c.id,
    shop_id: c.shopId,
    name: c.name,
    icon: c.icon,
  }
}

export function movementToRow(m) {
  return {
    id: m.id,
    shop_id: m.shopId,
    product_id: m.productId,
    type: m.type,
    quantity: m.quantity,
    timestamp: m.timestamp,
    note: m.note ?? null,
  }
}

export function rowToCategory(r) {
  return {
    id: r.id,
    shopId: r.shop_id,
    name: r.name,
    icon: r.icon ?? null,
    synced: 1,
  }
}

export function rowToProduct(r) {
  return {
    id: r.id,
    shopId: r.shop_id,
    sku: r.sku,
    name: r.name,
    categoryId: r.category_id,
    sellingPrice: Number(r.selling_price),
    // Workers read from a view that has no buying_price column.
    buyingPrice: r.buying_price == null ? null : Number(r.buying_price),
    description: r.description ?? '',
    attributes: r.attributes ?? {},
    stock: Number(r.stock ?? 0),
    lowStockLevel: r.low_stock_level ?? undefined,
    lastUpdated: r.updated_at,
    synced: 1,
  }
}