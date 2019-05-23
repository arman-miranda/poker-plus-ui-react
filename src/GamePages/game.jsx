import React from 'react';
import { Redirect } from 'react-router-dom';

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
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
    fetch(`http://localhost:3000/games/${params.id}`)
      .then(response => {this.handleSeatData(response)})
  }

  handleSeatSelection(e) {
    e.preventDefault()
  }

  handleSeatData(data) {
    data.json().then(results => {
      this.setState({
        ...results
      }, () => this.updateSeatNames())
    })
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

  render() {
    const { results } = this.props
    const { params } = this.props.match

    if (results) {
    }

    return (
      <div>
        <h4>Game ID: {params.id}</h4>
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
      </div>
    )
  }
}

export default Game;
