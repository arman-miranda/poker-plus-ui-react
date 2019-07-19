import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  getDataFromServer,
  requestPOSTTo,
  requestPUTTo,
  deleteDataFromServer
} from '../../shared/request_handlers'
import '../../stylesheets/game.css';
import Cable from 'actioncable'
import CommunityCardModal from "./communityCardModal";
import TurnActionAlert from '../sharedComponents/Alerts/TurnActionAlert';
import { parseCards } from '../../shared/card_generator.js';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDotCircle } from '@fortawesome/free-solid-svg-icons'

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
      old_community_card_edit: null,
      new_community_card_edit: null,
      joining_players: [],
      joining_players_count: 0,
      players: [],
      current_logs: "",
      communityCards: {},
      last_action: "",
      new_player: "",
      dealt_player: "",
      round_is_ended: false
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
    this.updateGameLog('new_round_start')
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
          } else if (data.alert_type === 'game_start') {
            this.updateGameLog('session_start')
            this.props.handleAlerts(data)
          } else if (data.action_type === 'game_start') {
            this.updateGameLog(data.action_type)
            this.setState({
              ...data
            })
          } else if (data.event === 'cards_dealt') {
            this.setState({
             ...data
            }, () => this.updateGameLog(data.event))
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
            this.updateGameLog(data.alert_type)
          } else if (data.event === 'round_ended') {
            this.setState({ round_is_ended: true })
            this.handleRoundEnd(data.round)
          } else if (data.event === 'community_card_update') {
            this.setState({ round_is_ended: false })
            this.updateGameLog(data.event)
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
          } else if (data.event === 'player_turn'){
            this.setState({
              last_action: {...data}
            })
            this.updateGameLog(data.event)
          } else if (data.message === 'NewPlayer') {
            this.setState({
              new_player: {...data}
            })
            this.updateGameLog(data.message)
          } else if (data.message === 'session_end') {
            this.updateGameLog(data.message)
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
           data.joining_players ||
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
        this.setState({ current_community_cards: results.community_cards })
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

  handleCommunityCardClick (e) {
    let cardToBeEdited = this.state.current_community_cards.find(card => {
      return e.target.attributes.dataId.value === card.id.toString()
    })

    this.setState({
      community_card_modal: "edit",
      old_community_card_edit: cardToBeEdited
    })
  }

  handleCurrentComCards() {
    const { currentUser } = this.props
    let cardArray = this.state.current_community_cards || []
    let comCardDiv = document.getElementById("communityCards")
    let editable = currentUser.id === this.state.dealer_id

    this.destroyCurrentComCards()

    if (cardArray.length >= 3) {
      let flopDiv = document.createElement("div")
      flopDiv.setAttribute("class", "flopDiv")
      flopDiv.textContent = "Flop:"
      comCardDiv.append(flopDiv)

      let flop = cardArray.slice(0,3)

      flop.map(card=>{
        let flopCard = document.createElement("a")
        flopCard.setAttribute("class", `commCard flopCard${ editable ? " editable" : "" }`)
        flopCard.setAttribute("dataId", card.id)
        if (editable) { flopCard.onclick = this.handleCommunityCardClick.bind(this) }
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
      turnCard.setAttribute("class", `commCard turnCard${ editable ? " editable" : "" }`)
      turnCard.setAttribute("dataId", cardArray[3].id)
      if (editable) { turnCard.onclick = this.handleCommunityCardClick.bind(this) }
      turnCard.textContent = parseCards(cardArray[3].number, cardArray[3].suit)

      turnDiv.append(turnCard)
    }
    if (cardArray.length === 5) {
      let riverDiv = document.createElement("div")
      riverDiv.setAttribute("class", "riverDiv")
      riverDiv.textContent = "River:"
      comCardDiv.append(riverDiv)

      let riverCard = document.createElement("a")
      riverCard.setAttribute("class", `commCard riverCard${ editable ? " editable" : "" }`)
      riverCard.setAttribute("dataId", cardArray[4].id)
      if (editable) { riverCard.onclick = this.handleCommunityCardClick.bind(this) }
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
    if(!this.state.game_is_active){
      var buttons = document.getElementsByClassName("seatButton")
      for(var x=0; x < buttons.length; x++)
      {
        buttons[x].removeAttribute("disabled","disabled")
      }
    }
  }

  updateSeatNameFor(player) {
    let seat_position = document.getElementById(`seat_number_${player.seat_number}`)
    let span = document.createElement('span')
    span.setAttribute("class", "seatSpan")
    span.textContent = ` ${player.player_name}`

    if (player.seat_number === this.state.button){
      seat_position.parentNode
        .insertBefore(span, seat_position.nextSibling.nextSibling)
    } else {
      seat_position.parentNode
        .insertBefore(span, seat_position.nextSibling)
    }
    seat_position.setAttribute("disabled","disabled")

    if (player.player_name === this.props.currentUser.username) {
      this.showOwnCards(player)
    }
  }

  renderIcon(seat){
    if (seat === this.state.button) {
      return(
        <FontAwesomeIcon icon="dot-circle" />
      )
    }
  }


  showOwnCards(player) {
    const { joining_players } = this.state
    let cardsSpanId = `${player.seat_number}_cardsSpan`
    let currentCardsSpan = document.getElementById(cardsSpanId)

    if (currentCardsSpan) {
      currentCardsSpan.parentNode.removeChild(currentCardsSpan)
    }

    const joined_player = joining_players.find((joining_player) => {
      return joining_player.player_id === player.player_id
    })

    if (!joined_player) {
      return;
    }

    const game = getDataFromServer(
      `http://localhost:3000/games/${this.state.id}/`
    )

    let seatPosition = document.getElementById(`seat_number_${player.seat_number}`)
    let seatSpan = seatPosition.nextSibling

    let cardsSpan = document.createElement('span')
    cardsSpan.setAttribute("id", cardsSpanId)

    if (player.seat_number === this.state.button){
      seatSpan.parentNode.insertBefore(cardsSpan, seatSpan.nextSibling.nextSibling)
    } else {
      seatSpan.parentNode.insertBefore(cardsSpan, seatSpan.nextSibling)
    }

    game.then(
      result => {
        let this_joining_player = result.joining_players.find(joining_player => { return joining_player.player_id === player.player_id })
        if (this_joining_player && this_joining_player.cards) {
          this_joining_player.cards.map( (card, i) =>{
            let cardSpan = document.createElement("a")
            cardSpan.setAttribute("class", `card_${player.seat_number}_${i+1}`)
            cardSpan.textContent = parseCards(card.number, card.suit)
            cardsSpan.append(cardSpan)
          })
        }
      }
    )
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

  handleCommunityCardModalClose(e) {
    e.preventDefault()
    this.setState({
      community_card_modal: "",
      old_community_card_edit: null
    })
  }

  handleCommunityCardModalSubmit(e) {
    e.preventDefault()

    if (this.state.community_card_modal === "edit") {
      let selectSuit = document.getElementById("edit1_suit").value
      let selectValue = document.getElementById("edit1_value").value

      let cardId = this.state.old_community_card_edit.id
      let body = {
        "suit": this.state.communityCards["edit1_suit"] || selectSuit,
        "value": this.state.communityCards["edit1_value"] || selectValue
      }
      let url = `http://localhost:3000/cards/${cardId}`

      requestPUTTo(url, body)
      this.nullifyCommunityCards()
      this.setState({
        community_card_modal: "",
        old_community_card_edit: null,
        new_community_card_edit: null
      })
    } else {
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
          this.updateGameLog("insufficient_players")
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
    this.handleShowGameLobby()
  }

  handleLeaveGame(e){
    if(window.confirm('Are you sure you want to leave current the game?')) {
      this.handleDeletePlayerFromGame()
    }
  }

  handleDeletePlayerFromGame(){
    const { id } = this.state
    const { players } = this.state
    const { currentUser } = this.props
    let player_game = players.find(player => {
      return player.player_id === currentUser.id
    })
    deleteDataFromServer(`http://localhost:3000/games/${id}/player_games/${player_game.player_game_id}`)
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
        if (joining_player.seat_number === this.state.button){
          let player_name = document.getElementById(`seat_number_${joining_player.seat_number}`).nextSibling.nextSibling
          player_name.setAttribute("style", "color: black")
        } else {
          let player_name = document.getElementById(`seat_number_${joining_player.seat_number}`).nextSibling
          player_name.setAttribute("style", "color: black")
        }
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

  getPlayerPosition(position) {
    const { players } = this.state
    let playerPosition = players.find(player => {
      return player.seat_number === position
    })
    if (playerPosition){
      return playerPosition.player_name
    }
  }

  updateGameLog(action){
    const { round_number } = this.state
    const { last_action } = this.state
    const { new_player } = this.state
    let game_log = document.getElementById(`game_logs`)
    let player = this.getPlayerPosition(this.state.currently_playing)
    let p = document.createElement('p')
    let cardType = ["flop","turn","river"][round_number-1]

    if(action === 'session_start'){
      p.textContent = 'Dealer started the game.'
      game_log.prepend(p)
    } else if(action === 'insufficient_players'){
      p.textContent = 'Number of willing participants are insufficient.\n Dealer will try to start the game again after a few moments.'
      game_log.prepend(p)
    } else if(action === 'game_start'){
      p.textContent = 'Dealer is dealing cards.'
      game_log.prepend(p)
    } else if(action === 'cards_dealt'){
      let dp = this.getPlayerPosition(this.state.dealt_player)
      p.textContent = ` ${dp} has set their cards.`
      game_log.prepend(p)
      if (this.state.game_is_active && this.readyForRoundStart()) {
        this.updateGameLog("ready_for_round_start")
      }
    } else if(action === 'ready_for_round_start'){
      p.textContent = "All players have set their cards. Dealer may start the round."
      game_log.prepend(p)
    } else if (action === 'small_blind'){
      p.textContent = 'Dealer has started the round.'
      game_log.prepend(p)
    } else if (action === 'new_round_start' && this.state.community_card_id !== null){
      let cardType = ["flop","turn","river"][round_number-1]
      p.textContent = `Dealer is now setting the ${cardType}.`
      game_log.prepend(p)
    } else if (action === 'community_card_update' && this.state.community_card_id !== null){
      let cardType = ["flop","turn","river"][round_number-2]
      p.textContent = `Dealer has set the ${cardType}.`
      game_log.prepend(p)
      this.updateGameLog("awaiting_player_action")
    } else if (action === 'session_end'){
      p.textContent = 'Game session has ended.'
      game_log.prepend(p)
    } else if (action === 'awaiting_player_action'){
      if (!this.state.round_is_ended) {
        p.textContent = `Waiting for ${player}'s action...`
        game_log.prepend(p)
      }
    } else if (action === 'player_turn'){
      let prevPlayer = this.getPlayerPosition(last_action.player)
      if (last_action.last_action === "small_blind") {
        p.textContent = ` ${prevPlayer} has paid the small blind.`
        game_log.prepend(p)
      }
      if (last_action.last_action === "big_blind") {
        p.textContent = ` ${prevPlayer} has paid the big blind.`
        game_log.prepend(p)
        this.updateGameLog("awaiting_player_action")
      }
      if (last_action.last_action !== null && last_action.last_action !== "small_blind" && last_action.last_action !== "big_blind") {
        let prevPlayer = this.getPlayerPosition(last_action.player)
        p.textContent = ` ${prevPlayer} ${last_action.last_action}s.`
        game_log.prepend(p)
        this.updateGameLog("awaiting_player_action")
      }
    } else if (action === 'NewPlayer') {
      p.textContent = ` ${new_player.confirmed_player} joined the game.`
      game_log.prepend(p)
    }
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
      game_name,
      community_card_modal,
      old_community_card_edit
    } = this.state
    const { params } = this.props.match

    var SUITS = ["diamond", "heart", "spade", "club"]
    var NUMBERS = [...Array(11).keys()].slice(1,11)
    NUMBERS[0] = "Ace"
    NUMBERS = NUMBERS.concat(["Jack","Queen","King"])

    let cardCount = 0
    community_card_modal === "flop" ? cardCount = 3 : cardCount = 1
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
        <Link to={`/games/${this.state.id}/game_sessions/`}>Game Sessions</Link>
        <br />
        { this.checkIfExistingPlayer() && !game_is_active &&
          <button onClick={this.handleLeaveGame.bind(this)}>Leave Game</button>
        }
        <h4>
          Game #{params.id}: {game_name} <br />
          Dealer: {dealer_name}
          <span style={{float:"right"}}>{this.props.currentUser.username}</span><br />
          { game_is_active &&
            <p>Button: Seat #{this.state.button}: {this.getPlayerPosition(this.state.button)}</p>
          }
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
            <CommunityCardModal displayModal={community_card_modal !== ""}>
              <form id="communityCardModal" method="post" className={community_card_modal} onSubmit={this.handleCommunityCardModalSubmit.bind(this)}>
                <h4>{ community_card_modal === "edit" ? "Edit community card" : "Set " + community_card_modal }</h4>
                {
                  cardSet.map((i) => {
                    return(
                      <div key={i}>
                        <select id={(community_card_modal) + (i+1) + "_suit"} required={true} defaultValue={ community_card_modal === "edit" ? old_community_card_edit.suit : ""} onChange={this.handleCommunityCardSelectChange.bind(this)}>
                          <option disabled value=""> -- </option>
                          {SUITS.map((suit) => { return <option key={suit + i} value={suit}>{suit.charAt(0).toUpperCase()+suit.slice(1)+"s"}</option> })}
                        </select>
                        <select id={(community_card_modal) + (i+1) + "_value"} required={true} defaultValue={ community_card_modal === "edit" ? old_community_card_edit.number : ""}  onChange={this.handleCommunityCardSelectChange.bind(this)}>
                          <option disabled value=""> -- </option>
                          {NUMBERS.map((number, i) => { return <option key={number + i} value={i+1}>{number}</option> })}
                        </select>
                      </div>
                    )
                  })
                }
                <input type="submit" value={ community_card_modal === "edit" ? "Update" : `Set ${community_card_modal}`} />
                <a href="" onClick={this.handleCommunityCardModalClose.bind(this)} style={ community_card_modal === "edit" ? {} : {display:"none"} }>Cancel</a><br />
              </form>
            </CommunityCardModal>
            <br />
          </div>
        }
        <div id="communityCards" />
        <form>
          <button name="seat_number" className="seatButton" id="seat_number_1" value="1" disabled={game_is_active}>
            Seat 1
          </button>{this.renderIcon(1) }<br/>
          <button name="seat_number" className="seatButton" id="seat_number_2" value="2" disabled={game_is_active}>
            Seat 2
          </button>{this.renderIcon(2) }<br/>
          <button name="seat_number" className="seatButton" id="seat_number_3" value="3" disabled={game_is_active}>
            Seat 3
          </button>{this.renderIcon(3) }<br/>
          <button name="seat_number" className="seatButton" id="seat_number_4" value="4" disabled={game_is_active}>
            Seat 4
          </button>{this.renderIcon(4) }<br/>
          <button name="seat_number" className="seatButton" id="seat_number_5" value="5" disabled={game_is_active}>
            Seat 5
          </button>{this.renderIcon(5) }<br/>
          <button name="seat_number" className="seatButton" id="seat_number_6" value="6" disabled={game_is_active}>
            Seat 6
          </button>{this.renderIcon(6) }<br/>
          <button name="seat_number" className="seatButton" id="seat_number_7" value="7" disabled={game_is_active}>
            Seat 7
          </button>{this.renderIcon(7) }<br/>
          <button name="seat_number" className="seatButton" id="seat_number_8" value="8" disabled={game_is_active}>
            Seat 8
          </button>{this.renderIcon(8) }<br/>
          <button name="seat_number" className="seatButton" id="seat_number_9" value="9" disabled={game_is_active}>
            Seat 9
          </button>{this.renderIcon(9) }<br/>
        </form>

          <div>
            <h4>Game Logs:</h4>
            <div id="game_logs">
            </div>
          </div>

      </div>
    )
  }
}

export default Game;
