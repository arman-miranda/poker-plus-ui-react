import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  getDataFromServer,
  requestPOSTTo,
  requestPUTTo
} from '../../shared/request_handlers'
import '../../stylesheets/game.css';
import Cable from 'actioncable'
import CommunityCardModal from "./communityCardModal";
import TurnActionAlert from '../sharedComponents/Alerts/TurnActionAlert';
import { parseCards } from '../../shared/card_generator.js';

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      alert_props: null,
      showPlayerWaitingList: null,
      showGameWaitinglist: null,
      showCardSelectionScreen: null,
      showGameLobby: null,
      player_preferred_seat: 0,
      dealer_name: null,
      game_is_active: false,
      game_name: null,
      community_card_modal: "",
      joining_players: [],
      players: [],
      current_logs: "",
      communityCards: {}
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
    this.getCurrentComCards()
    this.createSocket()
  }

  componentWillUnmount() {
    this.app.unsubscribe()
  }

  handleGameStateSetting() {
    this.handleCurrentSeatAssignments()
    this.handleCurrentComCards()
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
          } else if (data.action_type === 'game_start') {
            this.setState({
              ...data
            })
          } else if (data.action_type === 'player_round_creation') {
            this.setState({
              ...data
            }, () => {
              if(this.state.dealer_id === this.props.currentUser.id && this.state.big_blind) {
                this.handleRoundStates()
              }
            })
          } else if (data.alert_type === 'turn_action') {
            this.setState({
              alert_props: {...data}
            })
          } else if (data.event === 'round_ended') {
            this.handleRoundEnd(data.round)
          } else if (data.event === 'community_card_update') {
            if(data.community_cards.length > 0) {
              this.getCurrentComCards()
            }
          } else if (data.action_type === 'new_round_start') {
            this.setState({
              ...data
            }, () => { this.handleGameStateSetting() })
          } else if (this.willUpdateStateData(data)) {
            this.setState({
              ...data
            })
          } else {
            this.props.handleAlerts(data)
          }
        },
        reset_game_state: () => {
          const { currentUser } = this.props
          const { dealer_id } = this.state
          if (dealer_id === currentUser.id) {
            this.app.perform("reset_game_state", {game_id: this.state.id})
          }
        },
      }
    )
  }

  handleAlertDismissal() {
    this.setState({alert_props: null})
  }

  willUpdateStateData(data) {
    return data.joining_players_count ||
           data.showCardSelectionScreen ||
           data.button ||
           data.action_type === 'new_round_start'
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

  getCurrentComCards() {
    var game = getDataFromServer(
      `http://localhost:3000/games/${this.props.match.params.id}/`
    ).then(results => {
      if (results.community_cards !== null) {
        this.setState({ current_community_cards: [...results.community_cards.cards] })
        this.handleCurrentComCards()
      }
    })
  }

  destroyCurrentComCards() {
    var comCardDiv = document.getElementById("communityCards")
    if(comCardDiv != null) {
      while (comCardDiv.firstChild) {
        comCardDiv.removeChild(comCardDiv.firstChild)
      }
    }
  }

  handleCurrentComCards() {
    let cardArray = this.state.current_community_cards || []
    let comCardDiv = document.getElementById("communityCards")

    this.destroyCurrentComCards()

    if (cardArray.length >= 3) {
      let flopDiv = document.createElement("div")
      flopDiv.setAttribute("class", "flopDiv")
      flopDiv.textContent = "Flop:"
      comCardDiv.append(flopDiv)

      let flop = cardArray.slice(0,3)

      flop.map(card=>{
        let flopCard = document.createElement("a")
        flopCard.setAttribute("class", "flopCard")
        flopCard.textContent = parseCards(card.number, card.suit)

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
      turnCard.textContent = parseCards(cardArray[3].number, cardArray[3].suit)

      turnDiv.append(turnCard)
    }
    if (cardArray.length === 5) {
      let riverDiv = document.createElement("div")
      riverDiv.setAttribute("class", "riverDiv")
      riverDiv.textContent = "River:"
      comCardDiv.append(riverDiv)

      let riverCard = document.createElement("a")
      riverCard.setAttribute("class", "riverCard")
      riverCard.textContent = parseCards(cardArray[4].number, cardArray[4].suit)

      riverDiv.append(riverCard)
    }
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
    const { game_is_active } = this.state

    players.forEach(player => {
      this.updateSeatNameFor(player)
    })

    if (game_is_active) {
      this.handleNotPlaying()
    }
  }

  handleRoundStates() {
    const { currentUser } = this.props
    const {
      id,
      dealer_id,
      currently_playing,
      big_blind,
      small_blind,
      joining_players } = this.state

    if (currently_playing === small_blind && dealer_id === currentUser.id) {
      requestPOSTTo(`http://localhost:3000/games/${id}/player_rounds`, {
        player_action: 'small_blind',
        currently_playing: currently_playing,
        joining_players: joining_players
      })
    } else if (currently_playing === big_blind && dealer_id === currentUser.id) {
      requestPOSTTo(`http://localhost:3000/games/${id}/player_rounds`, {
        player_action: 'big_blind',
        currently_playing: currently_playing,
        joining_players: joining_players
      })
    } else if (!big_blind && !small_blind) {
      requestPOSTTo(`http://localhost:3000/games/${id}/player_rounds`, {
        player_action: null,
        currently_playing: currently_playing,
        joining_players: joining_players
      })
    }
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
    let cardsSpanId = `${player.seat_number}_cardsSpan`
    if ( document.getElementById(cardsSpanId) === null ) {
      var player_game = getDataFromServer(
        `http://localhost:3000/games/${this.state.id}/player_games/${player.player_game_id}`
      )

      let seatPosition = document.getElementById(`seat_number_${player.seat_number}`)
      let seatSpan = seatPosition.nextSibling

      let cardsSpan = document.createElement('span')
      cardsSpan.setAttribute("id", cardsSpanId)
      seatSpan.parentNode.insertBefore(cardsSpan, seatSpan.nextSibling)

      /* player_game.then(result => result.cards.map( (card, i) =>{
       *     let cardSpan = document.createElement("a")
       *     cardSpan.setAttribute("class", `card_${player.seat_number}_${i+1}`)
       *     cardSpan.textContent = parseCards(card.number, card.suit)
       *     cardsSpan.append(cardSpan)
       *   })
       * ) */
    }
  }

  handleWaitinglistRedirection(e) {
    this.setState({
      showGameWaitinglist: this.props.match.url
    })
  }

  handleRoundEnd(round) {
    const joining_players = this.state.joining_players

    if (round < 4 && joining_players.length > 1) {
      let cardType = ["flop","turn","river"][round-1]
      this.setState({ community_card_modal: cardType })
      if (this.props.currentUser.id === this.state.dealer_id) { this.incrementRound(round+1) }
    } else {
      this.app.reset_game_state()
    }
  }

  incrementRound(round) {
    requestPUTTo(
      `http://localhost:3000/games/${this.state.id}/increment_round`,
      {round: round}
    )
  }

  initializeGameCard(community_card_id) {
    this.setState({ community_card_id })
  }

  handleSetCommunityCards(e){
    this.setState({ community_card_modal: e.target.value })
  }

  handleCommunityCardModalSubmit(e) {
    e.preventDefault()
    let body = []
    let cardType = e.target.className
    let cardCount = 0
    cardType === "flop" ? cardCount = 3 : cardCount = 1
    let cardSet = [...Array(cardCount).keys()]

    cardSet.map((i) => {
      body.push({
        "suit": this.state.communityCards[cardType + (i+1) + "_suit"],
        "value": this.state.communityCards[cardType + (i+1) + "_value"]
      })
    })

    let url = `http://localhost:3000/games/${this.state.id}/community_cards/${this.state.community_card_id}`
    requestPUTTo(url, {"cards": body})

    this.nullifyCommunityCards()
    this.setState({
      community_card_modal: "",
      last_playing_player: this.state.button
    }, () => {
      this.handleRoundStates()
    })
  }

  handleCommunityCardSelectChange(e) {
    var communityCards = this.state.communityCards
    communityCards[e.target.id] = e.target.value
    this.setState({communityCards})
  }

  handleStartGame() {
    if(window.confirm('Are you sure you want to start the game?')) {
      getDataFromServer(
        `http://localhost:3000/games/${this.state.id}/request_game_start`
      )
      setTimeout(() => {
        const {joining_players_count} = this.state
        console.log(joining_players_count)
        if (joining_players_count < 2) {
          getDataFromServer(
            `http://localhost:3000/games/${this.state.id}/reset_game_start_request`
          )
        } else {
          requestPUTTo(
            `http://localhost:3000/games/${this.state.id}`,
            {
              game_is_active: true,
              change_button: true,
            }
          ).then(result => {
            this.initializeGameCard(result.game_sessions[0].community_card.id)
          })
        }
      }, 10000)
    }
  }

  handleAutomaticFoldingAlert() {
    if(this.state.game_is_active) {
      if(window.confirm('This action will automatically fold your current game. Are you sure you want to continue?')) {
        this.handleShowGameLobby()
      }
    }
    else {
      this.handleShowGameLobby()
    }
  }

  handleShowGameLobby() {
    this.setState({
      showGameLobby: this.props.match.url
    })
  }

  handleNotPlaying() {
    const { joining_players } = this.state
    const { game_is_active } = this.state

    if(game_is_active) {
      let seat_span = document.getElementsByClassName('seatSpan')
      for (var i = 0; i < seat_span.length; i++ ) {
        seat_span[i].style.color = "gray";
      }

      joining_players.forEach(joining_player => {
        let player_name = document.getElementById(`seat_number_${joining_player.seat_number}`).nextSibling
        player_name.setAttribute("style", "color: black")
      })
    }
  }

  readyForRoundStart() {
    const { joining_players } = this.state;

    return joining_players.every((joining_player) => {
      return joining_player['cards_dealt?']
    });
  }

  gameIncludesCurrentUser() {
    const current_user_id = this.props.currentUser.id
    const joining_player_ids = this.state.joining_players.map(
      player => player.player_id)

    return joining_player_ids.includes(current_user_id)
  }

  render() {
    const {
      alert_props,
      dealer_name,
      game_is_active,
      showGameWaitinglist,
      showPlayerWaitingList,
      showCardSelectionScreen,
      showGameLobby,
      game_name
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

    }

    if(showCardSelectionScreen && this.gameIncludesCurrentUser()) {
      return <Redirect to={showCardSelectionScreen} />
    }

    if(showCardSelectionScreen && !this.gameIncludesCurrentUser()) {
      window.location.reload()
    }

    if(showGameLobby) {
      return <Redirect to='/games' />
    }

    return (
      <div>
        { alert_props &&
          <TurnActionAlert
            {...this.state.alert_props}
            round_just_started = {this.state.round_just_started}
            game_id = {this.state.id}
            currently_playing = { this.state.currently_playing }
            joining_players = {this.state.joining_players}
            handleAlertDismissal = {this.handleAlertDismissal.bind(this)}
            handleAppAlertDismissal = { this.props.handleDismissAlert.bind(this)}
          />
        }
        <button onClick={this.handleAutomaticFoldingAlert.bind(this)}>Go Back to Games</button>
        <h4>
          Game #{params.id}: {game_name} <br />
          Dealer: {dealer_name}
          <span style={{float:"right"}}>{this.props.currentUser.username}</span>
        </h4>
        { this.props.currentUser.id === this.state.dealer_id &&
          <div id="dealer_action_buttons">
            {!game_is_active &&
             <button name="start_game"
               onClick={this.handleStartGame.bind(this)}>
               Start Game
             </button>
            }
            {(game_is_active && this.readyForRoundStart()) &&
             <button name="round_start"
               onClick={this.handleRoundStates.bind(this)}>
               Round Start
             </button>
            }
            <button name="waitinglist"
              onClick={this.handleWaitinglistRedirection.bind(this)}>
              Waitinglist
            </button><br />
            <CommunityCardModal displayModal={this.state.community_card_modal !== ""}>
              <form id="communityCardModal" method="post" className={this.state.community_card_modal} onSubmit={this.handleCommunityCardModalSubmit.bind(this)}>
                <h4>Set {this.state.community_card_modal}</h4>
                {
                  cardSet.map((i) => {
                    return(
                      <div key={i}>
                        <select id={(this.state.community_card_modal) + (i+1) + "_suit"} required={true} defaultValue="" onChange={this.handleCommunityCardSelectChange.bind(this)}>
                          <option disabled value=""> -- </option>
                          {SUITS.map((suit) => { return <option key={suit + i} value={suit}>{suit.charAt(0).toUpperCase()+suit.slice(1)+"s"}</option> })}
                        </select>
                        <select id={(this.state.community_card_modal) + (i+1) + "_value"} required={true} defaultValue="" onChange={this.handleCommunityCardSelectChange.bind(this)}>
                          <option disabled value=""> -- </option>
                          {NUMBERS.map((number, i) => { return <option key={number + i} value={i+1}>{number}</option> })}
                        </select>
                      </div>
                    )
                  })
                }
                <input type="submit" value={`Set ${this.state.community_card_modal}`} /><br />
              </form>
            </CommunityCardModal>
            <br />
          </div>
        }
        <div id="communityCards" />
        <form>
          <button name="seat_number" id="seat_number_1" value="1" disabled={game_is_active}>
            Seat 1
          </button><br/>
          <button name="seat_number" id="seat_number_2" value="2" disabled={game_is_active}>
            Seat 2
          </button><br/>
          <button name="seat_number" id="seat_number_3" value="3" disabled={game_is_active}>
            Seat 3
          </button><br/>
          <button name="seat_number" id="seat_number_4" value="4" disabled={game_is_active}>
            Seat 4
          </button><br/>
          <button name="seat_number" id="seat_number_5" value="5" disabled={game_is_active}>
            Seat 5
          </button><br/>
          <button name="seat_number" id="seat_number_6" value="6" disabled={game_is_active}>
            Seat 6
          </button><br/>
          <button name="seat_number" id="seat_number_7" value="7" disabled={game_is_active}>
            Seat 7
          </button><br/>
          <button name="seat_number" id="seat_number_8" value="8" disabled={game_is_active}>
            Seat 8
          </button><br/>
          <button name="seat_number" id="seat_number_9" value="9" disabled={game_is_active}>
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
