import './global.css';

export const metadata = {
  title: 'Welcome to client',
  description: 'login to your account and use the chatbot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
