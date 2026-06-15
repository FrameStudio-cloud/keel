let paymentMethods = ["Cash", "M-Pesa", "Bank"];
let defaultPayment = "Cash";

export function getPaymentMethods() {
  return paymentMethods;
}

export function setPaymentConfig(methods, defaultMethod) {
  if (methods) paymentMethods = methods;
  if (defaultMethod) defaultPayment = defaultMethod;
}

export function getDefaultPayment() {
  return defaultPayment;
}
