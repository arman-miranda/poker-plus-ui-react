import Games from './components/GamePages/games';
import Game from './components/GamePages/game';
import PlayerWaitinglists from './components/PlayerPages/playerWaitinglists';
import GameWaitinglists from './components/GamePages/gameWaitinglists';

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
    path: '/players/:id/waitinglists',
    component: PlayerWaitinglists
  },
  {
    exact: true,
    path: '/games/:id/waitinglists',
    component: GameWaitinglists
  }
]
