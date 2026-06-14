import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toast";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ReactQueryProvider>
          {children}
          <Toaster />
        </ReactQueryProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}