import React from 'react';
import { Link, Redirect } from 'react-router-dom'
import { getDataFromServer, requestPOSTTo } from '../../shared/request_handlers'
import GamesTable from './games_table'
import Modal from "./modal";
import Cable from 'actioncable';

class Games extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      games: [],
      gameID: null,
      displayModal: false,
      gameName: "",
      showGamePage: null,
      newGameID:""
    }
  }

  componentDidMount() {
    this.getAllGamesFromServer()
    this.createSocket()
  }

  componentWillUnmount() {
    this.app.unsubscribe()
  }

  createSocket() {
    let cable = Cable.createConsumer('ws://localhost:3000/cable')

    this.app = cable.subscriptions.create(
      {
        channel: 'LobbyChannel'
      },
      {
        connected: () => {},
        received: (data) => {
          if (data.message === "LobbyUpdated") {
            this.getAllGamesFromServer()
          } else if (data.message === "NewGameAdded"){
            this.setState({
              newGameID: data.game_id
            }, () => this.handleGameRedirect())
          }
        },
      }
    )
  }

  getAllGamesFromServer() {
    const data = getDataFromServer('http://localhost:3000/games')
    data.then(results => {
      if (results.error) {
        this.props.handleUserLogout()
      } else {
        this.setState({games: results})
      }
    })
  }

  showModal() {
    this.setState({ displayModal: !this.state.displayModal })
  }

  onModalChange(e) {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  onModalSubmit(e) {
    e.preventDefault()
    var url = `http://localhost:3000/games/`
    var body = {
      name: this.state.name
    }

    requestPOSTTo(url, body).then(response => {
      if (response.status !== "error") {
        this.setState({
          displayModal: false
        })
      }
    })
  }

  onFormSubmit(e) {
    e.preventDefault()
    this.setState({gameID: e.target[0].value})
  }

  handleGameRedirect(){
    if (this.props.currentUser.is_premium){
      this.setState({showGamePage: this.props.match.url})
    }
  }

  render() {
    if(this.state.showGamePage) {
      return <Redirect to={`/games/${this.state.newGameID}`} />
    }

    if(this.state.gameID) {
      return <Redirect to={`/games/${this.state.gameID}`} />
    }

    return(
      <div>
        <Link to={`/players/${this.props.currentUser.id}/waitinglists`}>{this.props.currentUser.username}'s Waitinglist</Link>
        <form onSubmit={this.onFormSubmit.bind(this)}>
          <h4>
            GameID:
            <input type="number" name="game_id" required={true} min="1"/>
            <input type="submit" value="Join" />
            {this.props.currentUser.is_premium &&
            <input type="button" value="Host Game" onClick={this.showModal.bind(this)}/>}
          </h4>
        </form>
        <Modal displayModal={this.state.displayModal} onClose={this.showModal.bind(this)}>
          <form id="hostGameForm" method="post" onSubmit={this.onModalSubmit.bind(this)} >
            <input id="name" autoFocus={true} name="gameName" required={true} onChange={this.onModalChange.bind(this)} />
            <input type="submit" value="Create Game" />
          </form>
        </Modal>
        <GamesTable {...this.state} />
      </div>
    )
  }
}

export default Games;
