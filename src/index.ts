import { Checkout } from './Checkout/checkout';
import { PricingRule } from './Checkout/types-checkout';
import { LOG_LEVEL } from './constants';
import { Log } from './Logger/logger';

const pricingRules: PricingRule[] = [
  {
    id: 0,
    name: 'Apple TV Deal',
    desc: 'Buy 3 Apple TVs for the price of 2',
    skus: ['atv'],
    type: 'free-item',
    discountType: 'num-free-items',
    discountValue: 1,
    qty: 3,
  },
  {
    id: 1,
    name: 'Super iPad Discount',
    desc: 'Bulk discount on Super iPads when purchasing more than 4',
    skus: ['ipd'],
    type: 'bulk-discount',
    discountType: 'cents',
    discountValue: 5000,
    qty: 4,
  },
];

const co = new Checkout(pricingRules);
co.scan('atv');
co.scan('ipd');
co.scan('ipd');
co.scan('atv');
co.scan('atv');
co.scan('atv');
co.scan('ipd');
co.scan('ipd');
co.scan('ipd');
Log('Index', LOG_LEVEL.INFO, co.total());
