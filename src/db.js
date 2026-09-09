import Dexie from "dexie";

export const db = new Dexie('BeautyShopDB')

db.version(1).stores({
    products: '++id, sku, name, category, sellingPrice, stock, lastUpdated, synced',
    categories: '++id, name, synced',
    stockMovements: '++id, productId, type, quantity, timestamp, synced',
})

export async function recordStockMovement(productId, type, quantity) {
    await db.transaction('rw', db.products, db.stockMovements, async () => {
        await db.stockMovements.add({
            productId,
            type,
            quantity,
            timestamp: new Date().toISOString(),
            synced: false,
        })

        const product = await db.products.get(productId)
        await db.products.update(productId, {
            stock: product.stock + quantity,
            lastUpdated: new Date().toISOString(),
            synced: false,
        })
    })
}