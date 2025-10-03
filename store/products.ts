import { create } from 'zustand';
import { Product } from '../types/product';
import { listProducts, createProduct, updateProduct, deleteProduct, getProduct, adjustStock } from '../lib/productRepo';

type State = {
  products: Product[];
  loading: boolean;
  error?: string;
  fetch: (q?: string) => Promise<void>;
  add: (p: Product) => Promise<void>;
  save: (p: Product) => Promise<void>;
  remove: (id: string) => Promise<void>;
  fetchById: (id: string) => Promise<Product | null>;
  changeStock: (id: string, delta: number) => Promise<Product | null>;
};

export const useProducts = create<State>((set, get) => ({
  products: [],
  loading: false,
  async fetch(q) {
    set({ loading: true, error: undefined });
    try {
      const rows = await listProducts(q);
      set({ products: rows, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Erro ao listar' });
    }
  },
  async add(p) {
    await createProduct(p);
    await get().fetch();
  },
  async save(p) {
    await updateProduct(p);
    await get().fetch();
  },
  async remove(id) {
    await deleteProduct(id);
    await get().fetch();
  },
  async fetchById(id) {
    return await getProduct(id);
  },
  async changeStock(id, delta) {
    const updated = await adjustStock(id, delta);
    await get().fetch();
    return updated;
  },
}));
