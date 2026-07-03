import { render } from "preact";
import "./account-page.css";
import { useState } from "preact/hooks";
import { CommerceQueryProvider } from "@services/query-client";
import { signOut, useCreateAccount, useCustomer, useRequestPasswordReset, useResetPassword, useSignIn } from "@services/customer";

type View = "login" | "create" | "forgot" | "reset";
function Field({ name, type = "text", label }: { name: string; type?: string; label: string }) { return <label><span>{label}</span><input name={name} type={type} required /></label>; }
function AccountPage() {
  const [view, setView] = useState<View>("login"); const [message, setMessage] = useState("");
  const customer = useCustomer(); const login = useSignIn(); const create = useCreateAccount(); const forgot = useRequestPasswordReset(); const reset = useResetPassword();
  if (customer.data) return <div class="account-page"><h1>Hello, {customer.data.firstName}</h1><p>{customer.data.email}</p><sp-button onClick={() => { signOut(); customer.refetch(); }}>Sign out</sp-button></div>;
  const active = view === "login" ? login : view === "create" ? create : view === "forgot" ? forgot : reset;
  async function submit(event: SubmitEvent) { event.preventDefault(); setMessage(""); const data = Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement)); try { if (view === "login") await login.mutateAsync({ email: String(data.email), password: String(data.password) }); if (view === "create") { await create.mutateAsync({ firstName: String(data.firstName), lastName: String(data.lastName), email: String(data.email), password: String(data.password) }); setView("login"); setMessage("Account created. You can now sign in."); } if (view === "forgot") { await forgot.mutateAsync(String(data.email)); setMessage("If that account exists, Adobe Commerce will send reset instructions."); } if (view === "reset") { await reset.mutateAsync({ email: String(data.email), token: String(data.token), password: String(data.password) }); setView("login"); setMessage("Password updated. You can now sign in."); } } catch { /* mutation error is rendered below */ } }
  return <div class="account-page"><p class="page-eyebrow">Adobe Commerce account</p><h1>{view === "login" ? "Sign in" : view === "create" ? "Create account" : view === "forgot" ? "Reset password" : "Choose a new password"}</h1><form onSubmit={submit}>{view === "create" ? <><Field name="firstName" label="First name" /><Field name="lastName" label="Last name" /></> : null}<Field name="email" type="email" label="Email" />{view === "reset" ? <Field name="token" label="Reset token" /> : null}{view !== "forgot" ? <Field name="password" type="password" label={view === "reset" ? "New password" : "Password"} /> : null}<sp-button type="submit" disabled={active.isPending}>{active.isPending ? "Please wait…" : "Continue"}</sp-button></form><p role="status">{active.error?.message || message}</p><nav>{view !== "login" ? <button onClick={() => setView("login")}>Sign in</button> : <><button onClick={() => setView("create")}>Create account</button><button onClick={() => setView("forgot")}>Forgot password?</button><button onClick={() => setView("reset")}>I have a reset token</button></>}</nav></div>;
}
export default function decorate(block: HTMLElement) { render(<CommerceQueryProvider><AccountPage /></CommerceQueryProvider>, block); }
