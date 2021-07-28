import { Catalogue } from './catalogue';
import { isProduct, LocalProducts, Product } from './types-catalogue';

describe('Catalogue', function () {
  test('should populate from local catalogue', function () {
    const cat = new Catalogue('local');
    expect(cat.getNumProducts()).toEqual(LocalProducts.length);
  });

  test('should throw when no API source is specified', function () {
    expect(function () {
      const shouldThrow = new Catalogue('api');
      expect(shouldThrow.getNumProducts()).toBe(0);
    }).toThrowError(ReferenceError);
  });

  test('should populate from API source', function () {
    const cat = new Catalogue('api', 'test-local');
    expect(cat.getNumProducts()).toEqual(LocalProducts.length);
  });

  test('should correctly retrieve product by SKU', function () {
    const cat = new Catalogue('local');
    expect(cat.getNumProducts()).toEqual(LocalProducts.length);

    LocalProducts.forEach(product => {
      const retrievedProduct = cat.getProductBySku(product.sku);
      expect(retrievedProduct).not.toBeNull();
      expect(JSON.stringify(retrievedProduct)).toEqual(JSON.stringify(product));
    });
  });

  test('should return NULL on invalid products by SKU', function () {
    const cat = new Catalogue('local');
    expect(cat.getNumProducts()).toEqual(LocalProducts.length);

    const product = cat.getProductBySku('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    expect(product).toBeNull();
  });

  test('should correctly identify Product objects', function () {
    const validProduct: Product = {
      sku: 'abc',
      name: 'abc',
      priceCents: 100,
    };

    expect(isProduct(validProduct)).toEqual(true);

    const invalidProducts = [
      {
        sku: 'abc',
      },
      {
        sku: 'abc',
        name: 'abc',
      },
      {
        sku: 'abc',
        priceCents: 100,
      },
      {
        name: 'abc',
        priceCents: 100,
      },
      {
        priceCents: 100,
      },
      {
        name: 'abc',
      },
      'abc'];

    invalidProducts.forEach(product => {
      expect(isProduct(product)).toEqual(false);
    });
  });
});
