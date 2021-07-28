import { LOG_LEVEL } from '../constants';
import { Log } from '../Logger/logger';
import { isProduct, LocalProducts, Product, ProductSource } from './types-catalogue';

/**
 * Provides a list of products currently supported, retrieving them from an API if necessary.
 */
export class Catalogue {
  private products: { [key: string]: Product } = {};

  constructor (productSource: ProductSource, apiSource?: string) {
    if (productSource === 'local') {
      LocalProducts.forEach(product => {
        this.products[product.sku] = { ...product };
      });
    } else if (apiSource !== undefined) {
      this.fetchProducts(apiSource);
    } else {
      throw ReferenceError(
        '[Catalogue] - When not using a local product source, API source must be defined.',
      );
    }
  }

  /**
   * Attempts to retrieve a list of products from the given API location
   */
  private async fetchProducts (apiSource: string): Promise<void> {
    const logTitle = 'fetchProducts';
    Log(logTitle, LOG_LEVEL.DEBUG, `Fetching Product Data from ${apiSource}`);

    // TODO: Implement API fetching
    LocalProducts.forEach(product => {
      if (isProduct(product)) {
        this.products[product.sku] = { ...product };
      } else {
        Log(logTitle, LOG_LEVEL.ERR, `Malformed Product retrieved from ${apiSource}: `, product);
      }
    });
  }

  /**
   * Returns the full Product if the SKU is known, otherwise null
   */
  getProductBySku (sku: string): Product | null {
    const product = this.products[sku];
    if (product !== undefined) {
      return { ...product }; // Return copy instead of reference to avoid mutations
    }

    return null;
  }

  /**
   * Returns total number of products in the Catalogue.
   */
  getNumProducts (): number {
    return Object.keys(this.products).length;
  }
}
