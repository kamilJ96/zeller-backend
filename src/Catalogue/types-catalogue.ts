export type Product = {
  sku: string;
  name: string;
  priceCents: number;
};

export type ProductSource = 'api' | 'local';

export const LocalProducts: Product[] = [
  {
    sku: 'ipd',
    name: 'Super iPad',
    priceCents: 54999,
  },
  {
    sku: 'mbp',
    name: 'MacBook Pro',
    priceCents: 139999,
  },
  {
    sku: 'atv',
    name: 'Apple TV',
    priceCents: 10950,
  },
  {
    sku: 'vga',
    name: 'VGA adapter',
    priceCents: 3000,
  },
];

export function isProduct (data: any): data is Product {
  if (!data || typeof data !== 'object') {
    return false;
  } else {
    const { sku, name, priceCents } = data;
    return (sku !== undefined && name !== undefined && priceCents !== undefined);
  }
}
