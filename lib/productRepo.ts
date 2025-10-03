import { getDb } from '@/store/db';
import type { Product } from '@/types/product';
import { nanoid } from 'nanoid/non-secure';

function mapRow(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    price: Number(row.price),
    quantity: Number(row.quantity),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

export async function listProducts(q?: string): Promise<Product[]> {
  const db = getDb();
  const query = (q ?? '').trim();
  const like = `%${query}%`;

  if (query) {
    const rows = await db.getAllAsync<any>(
      `SELECT id, name, description, price, quantity, created_at, updated_at
         FROM products
        WHERE name LIKE ?
        ORDER BY name ASC`,
      [like]
    );
    return rows.map(mapRow);
  }

  const rows = await db.getAllAsync<any>(
    `SELECT id, name, description, price, quantity, created_at, updated_at
       FROM products
      ORDER BY name ASC`
  );
  return rows.map(mapRow);
}

export async function getProduct(id: string): Promise<Product | null> {
  const db = getDb();
  const row = await db.getFirstAsync<any>(
    `SELECT id, name, description, price, quantity, created_at, updated_at
       FROM products WHERE id = ?`,
    [id]
  );
  return row ? mapRow(row) : null;
}

export async function createProduct(p: Product): Promise<void> {
  const db = getDb();

  const id = p.id ?? nanoid();
  const now = Date.now();

  const name = p.name?.trim();
  if (!name) throw new Error('Nome obrigatório.');
  if (name.length > 120) throw new Error('Nome deve ter no máximo 120 caracteres.');

  const desc = (p.description ?? '').trim() || null;

  const price = Number(p.price);
  if (!Number.isFinite(price) || price < 0) throw new Error('Preço inválido.');

  const qty = Math.max(0, Number(p.quantity ?? 0));
  if (!Number.isFinite(qty)) throw new Error('Quantidade inválida.');

  await db.runAsync(
    `INSERT INTO products (id, name, description, price, quantity, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, desc, price, qty, now, now]
  );
}

export async function updateProduct(p: Product): Promise<void> {
  const db = getDb();
  if (!p?.id) throw new Error('Produto sem ID.');

  const name = p.name?.trim();
  if (!name) throw new Error('Nome obrigatório.');
  if (name.length > 120) throw new Error('Nome deve ter no máximo 120 caracteres.');

  const desc = (p.description ?? '').trim() || null;

  const price = Number(p.price);
  if (!Number.isFinite(price) || price < 0) throw new Error('Preço inválido.');

  const qty = Math.max(0, Number(p.quantity ?? 0));
  if (!Number.isFinite(qty)) throw new Error('Quantidade inválida.');

  const now = Date.now();

  await db.runAsync(
    `UPDATE products
        SET name = ?, description = ?, price = ?, quantity = ?, updated_at = ?
      WHERE id = ?`,
    [name, desc, price, qty, now, p.id]
  );
}

export async function deleteProduct(id: string): Promise<void> {
  const db = getDb();
  await db.runAsync(`DELETE FROM products WHERE id = ?`, [id]);
}

export async function adjustStock(id: string, delta: number): Promise<Product | null> {
  const db = getDb();
  const now = Date.now();

  await db.runAsync(
    `UPDATE products
        SET quantity = MAX(0, quantity + ?), updated_at = ?
      WHERE id = ?`,
    [Number(delta || 0), now, id]
  );

  return getProduct(id);
}
