import React from 'react';
import '../../stylesheets/games_table.css';
import { Redirect } from 'react-router-dom';
import { getDataFromServer } from '../../shared/request_handlers';
import { Link } from 'react-router-dom';

class GameHistories extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sessions: []
    }
  }

  componentDidMount() {
    this.fetchHistory()
  }

  fetchHistory() {
    let params = this.props.match.params
    var game = getDataFromServer(
      `/games/${params.game_id}/game_sessions/`
    ).then(results => {
      if (results !== null) {
        this.setState({ sessions: results })
        this.renderHistoryIndex()
      }
    })
  }

  renderHistoryIndex() {
    let sessions = this.state.sessions
    let sessionIndex = document.getElementById("sessionIndex")
    const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    sessions.map(session=>{
      var sessionIndexItem = document.createElement("li")
      var created_at = new Date(session.updated_at)

      var sessionHistoryLink = document.createElement("a")
      sessionHistoryLink.setAttribute("href", `/games/${session.game_id}/game_sessions/${session.id}`)

      function appendLeadingZeroes(n){
        if(n < 10){
          return "0" + n;
        }
        return n
      }
      let dateString = `${created_at.getDate()} ${months[created_at.getMonth()]} ${created_at.getFullYear()}`
      let timeString = `${appendLeadingZeroes(created_at.getHours())}:${appendLeadingZeroes(created_at.getMinutes())}`

      sessionHistoryLink.textContent = `${dateString} ${timeString}`

      sessionIndexItem.append(sessionHistoryLink)
      sessionIndex.append(sessionIndexItem)
    })
  }

  render() {
    return(
      <div>
        <div>
          <h4>Sessions:</h4>
          <ul id="sessionIndex" />
        </div>
        <Link to={`/games/${this.props.match.params.game_id}`}>Back to Game</Link>
      </div>
    )
  }
}

export default GameHistories;
