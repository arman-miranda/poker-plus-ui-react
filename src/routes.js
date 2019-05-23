import Games from './GamePages/games';
import Game from './GamePages/game';
import Login from './LoginPages/login';

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
  },
  {
    exact: true,
    path: '/login',
    component: Login
  }
]
