export type Customer = { firstName: string; lastName: string; email: string };
export type CustomerCredentials = { email: string; password: string };
export type CustomerRegistration = CustomerCredentials & { firstName: string; lastName: string };
