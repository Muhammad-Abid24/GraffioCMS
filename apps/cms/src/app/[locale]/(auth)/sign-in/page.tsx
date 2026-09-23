import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function SignInPage() {
  return <SignInForm />;
}
