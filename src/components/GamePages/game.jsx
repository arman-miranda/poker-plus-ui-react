import React from 'react';
import { Redirect } from 'react-router-dom';
import { getDataFromServer } from '../../shared/request_handlers'
import '../../stylesheets/game.css';

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showGameWaitinglist: null,
      dealer_name: null,
      game_is_active: false,
      game_name: null,
      players: []
    }
  }

  componentDidMount() {
    document.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', this.handleSeatSelection.bind(this))
    })

    this.handleCurrentSeatAssignments()
  }

  handleCurrentSeatAssignments() {
    const { params } = this.props.match
    const data = getDataFromServer(
      `http://localhost:3000/games/${params.id}`)
    data.then(results =>
      this.setState({...results}, () => this.updateSeatNames())
    )
  }

  handleSeatSelection(e) {
    e.preventDefault()
  }

  updateSeatNames() {
    const { players } = this.state

    players.forEach(player => {
      this.updateSeatNameFor(player)
    })
  }

  updateSeatNameFor(player) {
    let seat_position = document.getElementById(`seat_number_${player.seat_number}`)
    let span = document.createElement('span')
    span.textContent = ` ${player.player_name}`
    seat_position.parentNode
      .insertBefore(span, seat_position.nextSibling)
  }

  handleWaitinglistRedirection(e) {
    this.setState({
      showGameWaitinglist: this.props.match.url
    })
  }

  render() {
    const {
      dealer_name,
      game_is_active,
      showGameWaitinglist
    } = this.state
    const { params } = this.props.match

    if(showGameWaitinglist) {
      return <Redirect to={`${showGameWaitinglist}/waitinglists`} />
    }

    return (
      <div>
        <h4>Game ID: {params.id}</h4>
        <h4>Dealer: { dealer_name }</h4>
        <div id="dealer_action_buttons">
          <button name="start_game">Start Game</button>
          <button name="waitinglist"
            onClick={this.handleWaitinglistRedirection.bind(this)}>
            Waitinglist
          </button>
        </div><br />
        <form>
          <button name="seat_number" id="seat_number_1" value="1"> Seat 1 </button><br/>
          <button name="seat_number" id="seat_number_2" value="2"> Seat 2 </button><br/>
          <button name="seat_number" id="seat_number_3" value="3"> Seat 3 </button><br/>
          <button name="seat_number" id="seat_number_4" value="4"> Seat 4 </button><br/>
          <button name="seat_number" id="seat_number_5" value="5"> Seat 5 </button><br/>
          <button name="seat_number" id="seat_number_6" value="6"> Seat 6 </button><br/>
          <button name="seat_number" id="seat_number_7" value="7"> Seat 7 </button><br/>
          <button name="seat_number" id="seat_number_8" value="8"> Seat 8 </button><br/>
          <button name="seat_number" id="seat_number_9" value="9"> Seat 9 </button><br/>
        </form>
        { game_is_active &&
          <div>
            <h4>Game Logs:</h4>
            <div id="game_logs">
            </div>
          </div>
        }
      </div>
    )
  }
}

export default Game;
