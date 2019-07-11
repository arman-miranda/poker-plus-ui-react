import React from 'react';
import '../../stylesheets/games_table.css';
import { Link } from 'react-router-dom';

class GamesTable extends React.Component {
  renderTableHeaders() {
    return (
      <thead>
        <tr>
          <th>
            GameID
          </th>
          <th>
            Game Name
          </th>
          <th>
            Small Blind Price
          </th>
          <th>
            Big Blind Price
          </th>
          <th>
            # of Players
          </th>
          <th>
            Dealer
          </th>
          <th>
            Status
          </th>
          <th>
          </th>
        </tr>
      </thead>
    )
  }

  handleGameJoining(game_id) {
  }

  renderTableBody(){
    const { games } = this.props
    return(
      <tbody>
        { games.map(game => {
            return(
              <tr key={game.id}>
                <td>
                  {game.id}
                </td>
                <td>
                  {game.game_name}
                </td>
                <td>
                  {game.small_blind_price}
                </td>
                <td>
                  {game.big_blind_price}
                </td>
                <td>
                  {game.number_of_players}
                </td>
                <td>
                  {game.dealer}
                </td>
                <td>
                  {game.game_is_active ? 'Ongoing' : 'Waiting'}
                </td>
                <td>
                  <Link to={`/games/${game.id}`}>Join</Link>
                </td>
              </tr>
            )
        })}
      </tbody>
    )
  }

  render() {
    return(
      <table>
        {this.renderTableHeaders()}
        {this.renderTableBody()}
      </table>
    )
  }
}

export default GamesTable;
