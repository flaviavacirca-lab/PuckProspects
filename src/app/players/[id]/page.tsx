import { ALL_MOCK_PLAYERS } from '@/data/mock-players';
import PlayerProfile from './PlayerProfile';

export function generateStaticParams() {
  return ALL_MOCK_PLAYERS.map((player) => ({
    id: String(player.id),
  }));
}

export default function PlayerProfilePage() {
  return <PlayerProfile />;
}
