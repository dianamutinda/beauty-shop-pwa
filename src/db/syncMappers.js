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
    stock: p.stock,
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