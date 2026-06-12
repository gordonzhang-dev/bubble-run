import "./globals.css";

export const metadata = {
  title: "Bubble Run — Group CoCo Orders",
  description: "Drop your bubble tea order in. One person runs to CoCo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
