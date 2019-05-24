import Games from './components/GamePages/games';
import Game from './components/GamePages/game';

export const routes = [
  {
    exact: true,
    path: '/games',
    component: Games
  },
  {
    exact: true,
    path: '/games/:id',
    component: Game
  }
]
