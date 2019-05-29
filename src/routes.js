import Games from './components/GamePages/games';
import Game from './components/GamePages/game';
import Login from './components/LoginPages/login';
import PlayerWaitinglists from './components/PlayerPages/playerWaitinglists';
import GameWaitinglists from './components/GamePages/gameWaitinglists';
import CardSelection from './components/GamePages/cardSelection';

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
  },
  {
    exact: true,
    path: '/games/:game_id/player_games/:id/edit',
    component: CardSelection
  }
];
