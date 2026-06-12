let currencySymbol = "KSh";

export function formatPrice(amount) {
  return `${currencySymbol} ${(amount || 0).toLocaleString()}`;
}

export function setCurrency(symbol) {
  currencySymbol = symbol;
}

export function getCurrency() {
  return currencySymbol;
}
