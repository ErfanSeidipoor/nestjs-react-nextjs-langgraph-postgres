export const metadata = {
  title: 'Chat with Server',
  description: 'Engage in seamless conversations with the server using Next.js, React, LangChain, and NestJS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>  
      {children}
    </>
  );
}
