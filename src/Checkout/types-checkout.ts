type PricingRuleType = 'free-item' | 'bulk-discount';
type DiscountType = 'percent' | 'cents' | 'num-free-items';

export interface PricingRule {
  id: number;
  name: string;
  desc: string;
  skus: string[];
  type: PricingRuleType;
  qty: number;
  discountType: DiscountType;
  discountValue: number;
};
