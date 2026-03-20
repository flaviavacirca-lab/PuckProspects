'use client';

import { ReactNode } from 'react';
import { PlayersProvider } from '@/context/PlayersContext';

export default function Providers({ children }: { children: ReactNode }) {
  return <PlayersProvider>{children}</PlayersProvider>;
}
