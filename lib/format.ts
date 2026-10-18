const pkr = new Intl.NumberFormat("en-US",{ maximumFractionDigits: 0 });

/** Integer PKR → "Rs. 12,500" */
export function formatPrice(amount: number): string {
  return `Rs. ${pkr.format(amount)}`;
}
