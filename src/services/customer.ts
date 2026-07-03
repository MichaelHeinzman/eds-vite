import { useMutation, useQuery } from "@tanstack/react-query";

import type { Customer, CustomerCredentials, CustomerRegistration } from "@/types/customer";
import { adobeGraphQl, CREATE_CUSTOMER_MUTATION, CUSTOMER_QUERY, CUSTOMER_TOKEN_MUTATION, REQUEST_PASSWORD_RESET_MUTATION, RESET_PASSWORD_MUTATION } from "@services/adobe-graphql";
import { commerceQueryClient, commerceQueryKeys } from "@services/query-client";

const tokenKey = "eds-vite-adobe-customer-token";
type AdobeCustomer = { firstname: string; lastname: string; email: string };
const normalize = (customer: AdobeCustomer): Customer => ({ firstName: customer.firstname, lastName: customer.lastname, email: customer.email });

export function getCustomerToken() { return window.sessionStorage.getItem(tokenKey); }
export function isAuthenticated() { return Boolean(getCustomerToken()); }

export async function signIn(credentials: CustomerCredentials) {
  const data = await adobeGraphQl<{ generateCustomerToken: { token: string } }>(CUSTOMER_TOKEN_MUTATION, credentials);
  window.sessionStorage.setItem(tokenKey, data.generateCustomerToken.token);
  return fetchCustomer();
}

export async function fetchCustomer() {
  const token = getCustomerToken();
  if (!token) return null;
  const data = await adobeGraphQl<{ customer: AdobeCustomer }>(CUSTOMER_QUERY, {}, false, token);
  return normalize(data.customer);
}

export async function createAccount(input: CustomerRegistration) {
  const data = await adobeGraphQl<{ createCustomerV2: { customer: AdobeCustomer } }>(CREATE_CUSTOMER_MUTATION, { input: { firstname: input.firstName, lastname: input.lastName, email: input.email, password: input.password } });
  return normalize(data.createCustomerV2.customer);
}

export async function requestPasswordReset(email: string) { return adobeGraphQl<{ requestPasswordResetEmail: boolean }>(REQUEST_PASSWORD_RESET_MUTATION, { email }); }
export async function resetPassword(email: string, resetPasswordToken: string, newPassword: string) { return adobeGraphQl<{ resetPassword: boolean }>(RESET_PASSWORD_MUTATION, { email, resetPasswordToken, newPassword }); }
export function signOut() { window.sessionStorage.removeItem(tokenKey); commerceQueryClient.setQueryData(commerceQueryKeys.customer(), null); commerceQueryClient.removeQueries({ queryKey: commerceQueryKeys.wishlist() }); }
export function useCustomer() { return useQuery({ queryKey: commerceQueryKeys.customer(), queryFn: fetchCustomer, enabled: isAuthenticated(), staleTime: 60_000 }); }
export function useSignIn() { return useMutation({ mutationKey: ["commerce", "adobe", "customer", "login"], mutationFn: signIn, onSuccess: (customer) => commerceQueryClient.setQueryData(commerceQueryKeys.customer(), customer) }); }
export function useCreateAccount() { return useMutation({ mutationKey: ["commerce", "adobe", "customer", "create"], mutationFn: createAccount }); }
export function useRequestPasswordReset() { return useMutation({ mutationKey: ["commerce", "adobe", "customer", "forgot"], mutationFn: requestPasswordReset }); }
export function useResetPassword() { return useMutation({ mutationKey: ["commerce", "adobe", "customer", "reset"], mutationFn: ({ email, token, password }: { email: string; token: string; password: string }) => resetPassword(email, token, password) }); }
