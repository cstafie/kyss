import { Game } from '@nx/api-interfaces';

interface Props {
  createGame: (gameName: string) => void;
  games: Array<Game>;
}

const GamesList = ({ games, createGame }: Props) => {
  return 'games list';
};

export default GamesList;
