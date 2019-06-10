import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  getDataFromServer,
  requestPOSTTo,
  requestPUTTo
} from '../../shared/request_handlers'
import '../../stylesheets/game.css';
import Cable from 'actioncable'

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showPlayerWaitingList: null,
      showGameWaitinglist: null,
      showCardSelectionScreen: null,
      player_preferred_seat: 0,
      dealer_name: null,
      game_is_active: false,
      game_name: null,
      joining_players: [],
      players: []
    }
  }

  componentDidMount() {
    document.querySelectorAll('form button').forEach((button) => {
      button.addEventListener('click', this.handleSeatSelection.bind(this))
    })

    this.handleCurrentSeatAssignments()
    this.handleCurrentComCards()
    this.createSocket()
  }

  componentWillUnmount() {
    this.app.unsubscribe()
  }

  createSocket() {
    let cable = Cable.createConsumer('ws://localhost:3000/cable')
    let gameId = this.props.match.params.id
    const playerId = this.props.currentUser.id

    this.app = cable.subscriptions.create(
      {
        channel: 'GameChannel',
        game_id: gameId,
        player_id: playerId
      },
      {
        connected: () => {},
        received: (data) => {
          console.log(data)
          if (data.new_players) {
            this.setState({
              players: data.new_players
            }, () => this.updateSeatNames())
          } else if (data.joining_players) {
            this.setState({
              ...data
            })
          } else if (data.showCardSelectionScreen) {
            this.setState({
              ...data
            })
          } else {
            this.props.handleAlerts(data)
          }
        },
      }
    )
  }

  handleCurrentSeatAssignments() {
    const { params } = this.props.match
    const data = getDataFromServer(
      `http://localhost:3000/games/${params.id}`)
    data.then(results => {
      if(results.error) {
        this.props.handleUserLogout()
      } else {
        this.setState({...results}, () => this.updateSeatNames())
      }
    })
  }

  handleCurrentComCards() {
    // TODO: GET ACTUAL CARDS FROM API
    let cardArray = [{suit: "diamond",number: "1"}, {suit: "diamond",number: "2"}, {suit: "diamond",number: "3"}, {suit: "diamond",number: "4"}, {suit: "diamond",number: "5"}]
    let comCardDiv = document.getElementById("communityCards")

    if (cardArray.length >= 3) {
      let flopDiv = document.createElement("div")
      flopDiv.setAttribute("class", "flopDiv")
      flopDiv.textContent = "Flop:"
      comCardDiv.append(flopDiv)

      let flop = cardArray.slice(0,3)

      flop.map(card=>{
        let flopCard = document.createElement("a")
        flopCard.setAttribute("class", "flopCard")
        flopCard.textContent = card.number + " of " + card.suit

        flopDiv.append(flopCard)
      })
    }
    if (cardArray.length >=4) {
      let turnDiv = document.createElement("div")
      turnDiv.setAttribute("class", "turnDiv")
      turnDiv.textContent = "Turn:"
      comCardDiv.append(turnDiv)

      let turnCard = document.createElement("a")
      turnCard.setAttribute("class", "turnCard")
      turnCard.textContent = cardArray[3].number + " of " + cardArray[3].suit

      turnDiv.append(turnCard)
    }
    if (cardArray.length === 5) {
      let riverDiv = document.createElement("div")
      riverDiv.setAttribute("class", "riverDiv")
      riverDiv.textContent = "River:"
      comCardDiv.append(riverDiv)

      let riverCard = document.createElement("a")
      riverCard.setAttribute("class", "riverCard")
      riverCard.textContent = cardArray[4].number + " of " + cardArray[4].suit

      riverDiv.append(riverCard)
    }
    comCardDiv.append(document.createElement("br"))
  }

  checkIfExistingPlayer() {
    const { currentUser } = this.props
    const { players } = this.state
    let existingPlayer = players.find(player => {
      return player.player_name === currentUser.username
    })
    return !!existingPlayer
  }

  handleSeatSelection(e) {
    e.preventDefault()
    const preferred_seat = e.target.value
    const { currentUser } = this.props
    if (this.checkIfExistingPlayer()){
      if (window.confirm('This action will send a seat change request to the dealer.')) {
        this.handleSubmitSeat(e)
        window.location.reload()
      }
    } else {
      if (window.confirm(`Are you sure you want to pick seat #${preferred_seat}`)) {
        this.handleSubmitSeat(e)
        this.setState({
          showPlayerWaitingList: `/players/${currentUser.id}/waitinglists`,
          player_preferred_seat: preferred_seat
        })
      }
    }
  }

  handleSubmitSeat(e) {
    const { currentUser } = this.props
    const game_id = this.state.id
    const preferred_seat = e.target.value

    requestPOSTTo(`http://localhost:3000/waitinglists`, {
      preferred_seat: preferred_seat,
      game_id: game_id,
      player_id: currentUser.id
    })
  }

  updateSeatNames() {
    this.clearSeatNames()
    const { players } = this.state

    players.forEach(player => {
      this.updateSeatNameFor(player)
    })
  }

  clearSeatNames() {
    var spans = document.getElementsByClassName("seatSpan")
    while(spans[0]) {
      spans[0].parentNode.removeChild(spans[0])
    }
  }

  updateSeatNameFor(player) {
    let seat_position = document.getElementById(`seat_number_${player.seat_number}`)
    let span = document.createElement('span')
    span.setAttribute("class", "seatSpan")
    span.textContent = ` ${player.player_name}`

    seat_position.parentNode
      .insertBefore(span, seat_position.nextSibling)
    seat_position.setAttribute("disabled","disabled")

    if (player.player_name === this.props.currentUser.username) {
      this.showOwnCards(player)
    }
  }

  showOwnCards(player) {
    var player_game = getDataFromServer(
      `http://localhost:3000/games/${this.state.id}/player_games/${player.player_game_id}`
    )

    let seatPosition = document.getElementById(`seat_number_${player.seat_number}`)
    let seatSpan = seatPosition.nextSibling

    let cardsSpan = document.createElement('span')
    cardsSpan.setAttribute("class", "cardsSpan")
    seatSpan.parentNode.insertBefore(cardsSpan, seatSpan.nextSibling)

    player_game.then(result => result.cards.map( (card, i) =>{
        let cardSpan = document.createElement("a")
        cardSpan.setAttribute("class", `card_${player.seat_number}_${i+1}`)
        cardSpan.textContent = card.number + " of " + card.suit
        cardsSpan.append(cardSpan)
      })
    )
  }

  handleWaitinglistRedirection(e) {
    this.setState({
      showGameWaitinglist: this.props.match.url
    })
  }

  handleStartGame() {
    if(window.confirm('Are you sure you want to start the game?')) {
      getDataFromServer(
        `http://localhost:3000/games/${this.state.id}/request_game_start`
      )
      setTimeout(() => {
        const {joining_players} = this.state
        if (joining_players.length < 2) {
          getDataFromServer(
            `http://localhost:3000/games/${this.state.id}/reset_game_start_request`
          )
        } else {
          requestPUTTo(
            `http://localhost:3000/games/${this.state.id}`,
            {game_is_active: true}
          ).then(result => console.log(result))
        }
      }, 10000)
    }
  }

  readyForRoundStart() {
    const { joining_players } = this.state;

    return joining_players.every((joining_player) => {
      return joining_player['card_dealt?']
    });
  }

  render() {
    const {
      dealer_name,
      game_is_active,
      showGameWaitinglist,
      showPlayerWaitingList,
      showCardSelectionScreen
    } = this.state
    const { params } = this.props.match

    if(showGameWaitinglist) {
      return <Redirect to={`${showGameWaitinglist}/waitinglists`} />
    }

    if(showPlayerWaitingList) {

    }

    if(showCardSelectionScreen) {
      return <Redirect to={showCardSelectionScreen} />
    }

    return (
      <div>
        <h4>Game ID: {params.id}</h4>
        <h4>Dealer: { dealer_name }</h4>
        { this.props.currentUser.is_premium &&
          <div id="dealer_action_buttons">
            <button name="start_game"
              onClick={this.handleStartGame.bind(this)}>
              Start Game
            </button>
            <button name="waitinglist"
              onClick={this.handleWaitinglistRedirection.bind(this)}>
              Waitinglist
            </button>
          </div>
        }<br />
        <div id="communityCards" />
        <form>
          <button name="seat_number" id="seat_number_1" value="1">
            Seat 1
          </button><br/>
          <button name="seat_number" id="seat_number_2" value="2">
            Seat 2
          </button><br/>
          <button name="seat_number" id="seat_number_3" value="3">
            Seat 3
          </button><br/>
          <button name="seat_number" id="seat_number_4" value="4">
            Seat 4
          </button><br/>
          <button name="seat_number" id="seat_number_5" value="5">
            Seat 5
          </button><br/>
          <button name="seat_number" id="seat_number_6" value="6">
            Seat 6
          </button><br/>
          <button name="seat_number" id="seat_number_7" value="7">
            Seat 7
          </button><br/>
          <button name="seat_number" id="seat_number_8" value="8">
            Seat 8
          </button><br/>
          <button name="seat_number" id="seat_number_9" value="9">
            Seat 9
          </button><br/>
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
