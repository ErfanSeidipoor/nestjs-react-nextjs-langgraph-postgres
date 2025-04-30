import Navbar from '@/components/navbar';
import Chatbot from './components/chatbot';

export default async function Page({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return (
    <div>
      <Navbar />
      <Chatbot threadId={threadId} />
    </div>
  );
}
