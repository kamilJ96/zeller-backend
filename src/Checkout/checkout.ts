import { Catalogue } from '../Catalogue/catalogue';
import { Product } from '../Catalogue/types-catalogue';
import { LOG_LEVEL } from '../constants';
import { Log } from '../Logger/logger';
import { PricingRule } from './types-checkout';

/**
 * Provides functionality to scan items, and calculate totals based on the cart
 * and any pricing/discount rules supplied. Maintains its own Catalogue of items.
 */
export class Checkout {
  private catalogue: Catalogue;
  private pricingRules: { [key: string]: PricingRule[] } = {};
  private cartBySku: { [key: string]: number } = {};

  constructor (pricingRules: PricingRule[]) {
    pricingRules.forEach(rule => {
      rule.skus.forEach(sku => {
        const skuRules = this.pricingRules[sku];
        if (skuRules) {
          skuRules.push({ ...rule });
        } else {
          this.pricingRules[sku] = [{ ...rule }];
        }
      });
    });

    this.catalogue = new Catalogue('local');
  }

  /**
   * Adds an item to the cart if it is a valid (known) product.
   */
  scan (sku: string): boolean {
    if (this.catalogue.getProductBySku(sku)) {
      if (this.cartBySku[sku]) {
        this.cartBySku[sku]++;
      } else {
        this.cartBySku[sku] = 1;
      }

      return true;
    } else {
      Log('Scan', LOG_LEVEL.ERR, 'Unknown SKU provided: ', sku);
      return false;
    }
  }

  /**
   * Calculates the total price, in dollars, for all the SKUs scanned.
   */
  total (): number {
    let total = 0;
    let numSkus = 0;

    Object.keys(this.cartBySku).forEach(sku => {
      const product = this.catalogue.getProductBySku(sku);

      // Should never happen, but just in case
      if (!product) {
        throw ReferenceError('UNKNOWN SKU IN CART: ' + sku);
      }

      const qty = this.cartBySku[sku];

      total += (product.priceCents * qty);
      numSkus += qty;

      if (this.pricingRules[sku]) {
        // Go through all the discount rules and only match the first one (if applicable)
        // - i.e. no multi-discountss
        for (let i = 0; i < this.pricingRules[sku].length; i++) {
          const rule = this.pricingRules[sku][i];
          const discountValue = this.getDiscountValueForSku(product, qty, rule);

          if (discountValue) {
            total -= discountValue;
            Log('Total', LOG_LEVEL.DEBUG, 'Applied a discount value of $' +
              `${(discountValue / 100).toFixed(2)} for ${qty} x ${product.name}`);
            break;
          }
        }
      }
    });

    // Convert to dollarydoos
    total /= 100;

    Log('Total', LOG_LEVEL.INFO, `Calculated a total of $${total} for ${numSkus} items.`);
    return total;
  }

  clearSkus (): void {
    this.cartBySku = {};
  }

  /**
   * Calculates how much of a discount (in cents) should be given based on a product in a certain
   * quantity, and according to a specific rule. 0 means no discount.
   */
  private getDiscountValueForSku (product: Product, qty: number, rule: PricingRule): number {
    if (qty < rule.qty) {
      return 0;
    }

    if (rule.type === 'free-item') {
      // The discount for a free item is (how many free items they're entitled to) * (product value)
      // So if entitled to 1 free item, we simply return the product value,
      // which discounts the total by one item
      const numFreeItems = Math.floor(qty / rule.qty);
      return (numFreeItems * rule.discountValue) * product.priceCents;
    } else if (rule.type === 'bulk-discount') {
      // Calculate how much each item needs to be discounted by according to the
      // type of discount applied, and then return the total discount value for all items
      const discountValuePerSku = rule.discountType === 'percent'
        ? (rule.discountValue / 100) * product.priceCents
        : rule.discountType === 'cents'
          ? rule.discountValue
          : 0;

      return discountValuePerSku * qty;
    }

    // Shouldn't happen - don't know what the rule type is so just ignore it
    return 0;
  }
}
