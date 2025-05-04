'use client';

import { Index } from './components';

interface Thread {
  id: string;
  title: string;
  initialPrompt: string | null;
  createdAt: string;
}

function Thread(): React.JSX.Element {
  return <Index />;
}

export default Thread;
