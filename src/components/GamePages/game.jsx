import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  getDataFromServer,
  requestPOSTTo
} from '../../shared/request_handlers'
import '../../stylesheets/game.css';
import Cable from 'actioncable'
import CommunityCardModal from "./communityCardModal";

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showPlayerWaitingList: null,
      showGameWaitinglist: null,
      player_preferred_seat: 0,
      dealer_name: null,
      game_is_active: false,
      game_name: null,
      players: [],
      community_card_modal: "",
    }
  }

  nullifyCommunityCards() {
    this.setState({
      communityCards: {
        flop1_suit: null,
        flop1_value: null,
        flop2_suit: null,
        flop2_value: null,
        flop3_suit: null,
        flop3_value: null,
        turn1_suit: null,
        turn1_value: null,
        river1_suit: null,
        river1_value: null
      }
    })
  }

  componentDidMount() {
    document.querySelectorAll('form button').forEach((button) => {
      button.addEventListener('click', this.handleSeatSelection.bind(this))
    })

    this.handleCurrentSeatAssignments()
    this.createSocket()
    this.nullifyCommunityCards()
  }

  componentWillUnmount() {
    this.app.unsubscribe()
  }

  createSocket() {
    let cable = Cable.createConsumer('ws://localhost:3000/cable')
    let gameId = this.props.match.params.id

    this.app = cable.subscriptions.create(
      {
        channel: 'GameChannel',
        game_id: gameId
      },
      {
        connected: () => {},
        received: (data) => {
          if (data.new_players) {
            this.setState({
              players: data.new_players
            }, () => this.updateSeatNames())
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
  }

  handleWaitinglistRedirection(e) {
    this.setState({
      showGameWaitinglist: this.props.match.url
    })
  }

  handleSetCommunityCards(e){
    this.setState({
      community_card_modal: e.target.value
    })
  }

  handleCommunityCardModalClose() {
    this.setState({ community_card_modal: "" })
    this.nullifyCommunityCards()
  }

  handleCommunityCardModalSubmit(e) {
    e.preventDefault()
    /* TODO: put API put request here */
    this.setState({ community_card_modal: "" })
  }

  handleCommunityCardSelectChange(e) {
    var communityCards = this.state.communityCards
    communityCards[e.target.id] = e.target.value
    this.setState({communityCards})
  }

  render() {
    const {
      dealer_name,
      game_is_active,
      showGameWaitinglist,
      showPlayerWaitingList
    } = this.state
    const { params } = this.props.match

    var SUITS = ["diamond", "heart", "spade", "club"]
    var NUMBERS = [...Array(11).keys()].slice(1,11)
    NUMBERS[0] = "Ace"
    NUMBERS = NUMBERS.concat(["Jack","Queen","King"])

    let cardCount = 0
    this.state.community_card_modal === "flop" ? cardCount = 3 : cardCount = 1
    var cardSet = [...Array(cardCount).keys()]

    if(showGameWaitinglist) {
      return <Redirect to={`${showGameWaitinglist}/waitinglists`} />
    }

    if(showPlayerWaitingList) {
      return <Redirect to={showPlayerWaitingList} />
    }

    return (
      <div>
        <h4>Game ID: {params.id}</h4>
        <h4>Dealer: { dealer_name }</h4>
        { this.props.currentUser.is_premium &&
          <div id="dealer_action_buttons">
            <button name="start_game">Start Game</button>
            <button name="waitinglist"
              onClick={this.handleWaitinglistRedirection.bind(this)}>
              Waitinglist
            </button>
            <br /> {/* TODO: call handleSetCommunityCards the game logic instead of buttons */}
            {
              ["Flop", "Turn", "River"].map((type, i) => {
                return(
                  <button
                    key = {type + i}
                    name = {"set"+type}
                    value = {type.toLowerCase()}
                    disabled = {this.state.community_card_modal !== ""}
                    onClick = {this.handleSetCommunityCards.bind(this)}>
                    {"Set " + type}</button>
                )
              })
            }
            <CommunityCardModal displayModal={this.state.community_card_modal !== ""}>
              <form id="communityCardModal" method="post" className={this.state.community_card_modal} onSubmit={this.handleCommunityCardModalSubmit.bind(this)}>
                {
                  cardSet.map((i) => {
                    return(
                      <div key={i}>
                        <select id={(this.state.community_card_modal) + (i+1) + "_suit"} defaultValue="" onChange={this.handleCommunityCardSelectChange.bind(this)}>
                          <option disabled value=""> -- </option>
                          {SUITS.map((suit) => { return <option key={suit + i} value={suit}>{suit.charAt(0).toUpperCase()+suit.slice(1)+"s"}</option> })}
                        </select>
                        <select id={(this.state.community_card_modal) + (i+1) + "_value"} defaultValue="" onChange={this.handleCommunityCardSelectChange.bind(this)}>
                          <option disabled value=""> -- </option>
                          {NUMBERS.map((number, i) => { return <option key={number + i} value={i+1}>{number}</option> })}
                        </select>
                      </div>
                    )
                  })
                }
                <input type="submit" value={`Set ${this.state.community_card_modal}`} /><br />
                <input type="submit" value="Close" onClick={this.handleCommunityCardModalClose.bind(this)} />
              </form>
            </CommunityCardModal>
          </div>
        }<br />
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
