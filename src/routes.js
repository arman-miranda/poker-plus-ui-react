import Games from './components/GamePages/games';
import Game from './components/GamePages/game';
import PlayerWaitinglists from './components/GamePages/playerWaitinglists'

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
  }
]
