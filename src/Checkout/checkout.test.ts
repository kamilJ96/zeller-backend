import { LocalProducts } from '../Catalogue/types-catalogue';
import { Checkout } from './checkout';
import { PricingRule } from './types-checkout';

const freeItemRule: PricingRule = {
  id: 0,
  name: 'Apple TV Deal',
  desc: 'Buy 3 Apple TVs for the price of 2',
  skus: ['atv'],
  type: 'free-item',
  discountType: 'num-free-items',
  discountValue: 1,
  qty: 3,
};

const bulkDiscountRule: PricingRule = {
  id: 1,
  name: 'Super iPad Discount',
  desc: 'Bulk discount on Super iPads when purchasing more than 4',
  skus: ['ipd'],
  type: 'bulk-discount',
  discountType: 'cents',
  discountValue: 5000,
  qty: 4,
};

const bulkDiscountRulePercent: PricingRule = {
  id: 2,
  name: 'Super iPad Discount',
  desc: 'Bulk discount on Super iPads when purchasing more than 4',
  skus: ['ipd'],
  type: 'bulk-discount',
  discountType: 'percent',
  discountValue: 20,
  qty: 1,
};

describe('Checkout - No Pricing Rules', function () {
  const checkouts: Checkout[] = [];
  let coNoPricingRules: Checkout;
  let coBulkDiscountRule: Checkout;
  let coFreeItemRule: Checkout;
  let coMultipleRules: Checkout;

  beforeEach(function () {
    coNoPricingRules = new Checkout([]);
    coBulkDiscountRule = new Checkout([bulkDiscountRule]);
    coFreeItemRule = new Checkout([freeItemRule]);
    coMultipleRules = new Checkout([bulkDiscountRule, freeItemRule]);

    checkouts.push(coNoPricingRules, coBulkDiscountRule, coFreeItemRule, coMultipleRules);
  });

  test('Scanning Valid Products Once', function () {
    LocalProducts.forEach(product => {
      checkouts.forEach(checkout => {
        expect(checkout.scan(product.sku)).toBe(true);
      });
    });
  });

  test('Scanning Valid Products More Than Once', function () {
    for (let i = 0; i < 10; i++) {
      LocalProducts.forEach(product => {
        checkouts.forEach(checkout => {
          expect(checkout.scan(product.sku)).toBe(true);
        });
      });
    }
  });

  test('Scanning Invalid Products Once', function () {
    checkouts.forEach(checkout => {
      expect(checkout.scan('!!!!!!!!!!')).toBe(false);
      expect(checkout.scan('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')).toBe(false);
    });
  });

  test('Scanning Invalid Products More Than Once', function () {
    for (let i = 0; i < 10; i++) {
      checkouts.forEach(checkout => {
        expect(checkout.scan('!!!!!!!!!!')).toBe(false);
        expect(checkout.scan('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')).toBe(false);
      });
    }
  });

  test('Correct Total - No Rules', function () {
    let total = 0;

    for (let i = 0; i < 10; i++) {
      LocalProducts.forEach(product => {
        expect(coNoPricingRules.scan(product.sku)).toBe(true);
        total += product.priceCents;
      });

      expect(total / 100).toBe(coNoPricingRules.total());
    }
  });

  test('Correct Total - Free Item', function () {
    let totalWithDiscount = 0;
    let totalWithoutDiscount = 0;

    freeItemRule.skus.forEach(sku => {
      const product = LocalProducts.find(product => product.sku === sku);
      if (product) {
        for (let i = 0; i < freeItemRule.qty * 2; i++) {
          checkouts.forEach(checkout => checkout.scan(sku));
          totalWithDiscount += product.priceCents;
        }

        totalWithoutDiscount = totalWithDiscount;
        totalWithDiscount -= product.priceCents * freeItemRule.discountValue * 2;
      }
    });

    expect(totalWithoutDiscount / 100).toBe(coNoPricingRules.total());
    expect(totalWithoutDiscount / 100).toBe(coBulkDiscountRule.total());

    expect(totalWithDiscount / 100).toBe(coFreeItemRule.total());
    expect(totalWithDiscount / 100).toBe(coMultipleRules.total());
  });

  test('Correct Total - Bulk Discount Rule', function () {
    let totalWithDiscount = 0;
    let totalWithoutDiscount = 0;

    bulkDiscountRule.skus.forEach(sku => {
      const product = LocalProducts.find(product => product.sku === sku);
      if (product) {
        for (let i = 0; i < bulkDiscountRule.qty; i++) {
          checkouts.forEach(checkout => checkout.scan(sku));
          totalWithDiscount += (product.priceCents - bulkDiscountRule.discountValue);
          totalWithoutDiscount += product.priceCents;
        }
      }
    });

    expect(coNoPricingRules.total()).toBe(totalWithoutDiscount / 100);
    expect(coFreeItemRule.total()).toBe(totalWithoutDiscount / 100);

    expect(coBulkDiscountRule.total()).toBe(totalWithDiscount / 100);
    expect(coMultipleRules.total()).toBe(totalWithDiscount / 100);
  });

  test('Correct Total - Bulk Discount Percent', function () {
    let total = 0;
    const co = new Checkout([bulkDiscountRulePercent]);

    const product = LocalProducts.find(product => product.sku === bulkDiscountRulePercent.skus[0]);

    if (product) {
      for (let i = 0; i < 10; i++) {
        co.scan(product.sku);
        total += product.priceCents;
      }

      const discountValueFraction = 1 - (bulkDiscountRulePercent.discountValue / 100);
      total *= discountValueFraction;
    }

    expect(total).toBeGreaterThan(0);
    expect(co.total()).toBe(total / 100);
  });

  test('Correct Total - Integration', function () {
    const coMultipleRulesOneSku = new Checkout([
      freeItemRule, bulkDiscountRule, bulkDiscountRulePercent,
    ]);

    const integrationTestEnv = [
      {
        skus: ['atv', 'atv', 'atv', 'vga'],
        expectedTotal: 249,
      },
      {
        skus: ['atv', 'ipd', 'ipd', 'atv', 'ipd', 'ipd', 'ipd'],
        expectedTotal: 2718.95,
      },
    ];

    integrationTestEnv.forEach(env => {
      env.skus.forEach(sku => {
        coMultipleRules.scan(sku);
        coMultipleRulesOneSku.scan(sku);
      });

      // Since the Percent rule is ordered after the free item rule, the ipd SKUs
      // should only take the first bulk discount rule, hence same values
      expect(coMultipleRules.total()).toBe(env.expectedTotal);
      expect(coMultipleRulesOneSku.total()).toBe(env.expectedTotal);

      coMultipleRules.clearSkus();
      coMultipleRulesOneSku.clearSkus();
      expect(coMultipleRules.total()).toBe(0);
    });
  });
});
