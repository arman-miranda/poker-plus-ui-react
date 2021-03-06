import Games from './components/GamePages/games';
import Game from './components/GamePages/game';
import Login from './components/LoginPages/login';
import PlayerWaitinglists from './components/PlayerPages/playerWaitinglists';
import GameWaitinglists from './components/GamePages/gameWaitinglists';
import GameHistory from './components/HistoryPages/gameHistory';
import GameHistories from './components/HistoryPages/gameHistories'
import PlayerGameHistories from './components/HistoryPages/playerGameHistories';

export const routes = [
  {
    public: false,
    exact: true,
    path: '/',
    component: Games
  },
  {
    public: false,
    exact: true,
    path: '/games',
    component: Games
  },
  {
    public: false,
    exact: true,
    path: '/games/:id',
    component: Game
  },
  {
    public: true,
    exact: true,
    path: '/login',
    component: Login
  },
  {
    public: false,
    exact: true,
    path: '/players/:id/waitinglists',
    component: PlayerWaitinglists
  },
  {
    public: false,
    exact: true,
    path: '/games/:id/waitinglists',
    component: GameWaitinglists
  },
  {
    exact: true,
    path: '/games/:game_id/game_sessions/:id/',
    component: GameHistory
  },
  {
    exact: true,
    path: '/games/:game_id/game_sessions/',
    component: GameHistories
  },
  {
    exact: true,
    path: '/players/:player_id/game_sessions/',
    component: PlayerGameHistories
  }
];
