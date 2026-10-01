import "@aws-amplify/ui-react/styles.css";
import type { Metadata } from "next";
import AmplifyClientProvider from "../components/AmplifyClientProvider";

export const metadata: Metadata = { title: "管理画面", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AmplifyClientProvider>{children}</AmplifyClientProvider>;
}
