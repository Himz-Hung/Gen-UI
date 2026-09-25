interface PriceTagProps { amount: number; currency: 'USD' | 'EUR'; strike?: boolean; onClick?: () => void }
export function PriceTag({ amount, currency, strike }: PriceTagProps) { return <span style={{ textDecoration: strike ? 'line-through' : undefined }}>{currency} {amount}</span>; }
