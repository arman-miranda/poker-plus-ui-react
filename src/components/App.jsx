import React from 'react';
import {
  Route,
  Switch,
  BrowserRouter as Router
} from 'react-router-dom';
import { routes } from '../routes';
import { Redirect } from 'react-router-dom';
import PageNotFound from '../public/pageNotFound'
import Cable from 'actioncable'
import { deleteDataFromServer } from '../shared/request_handlers'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentUser: JSON.parse(localStorage.getItem('currentUser'))
    }
  }

  componentDidMount() {
    if(this.state.currentUser) {
      this.createSocket()
    }
  }

  createSocket() {
    let cable = Cable.createConsumer('ws://localhost:3000/cable')
    this.app = cable.subscriptions.create({
      channel: 'UserChannel'
    }, {
      connected: () => {},
      received: (data) => {
        console.log(data)
      },
    }
    )
  }

  handleUserLogout() {
    localStorage.currentUser = null;
    this.setState({
      currentUser: null
    })
    deleteDataFromServer('localhost:3000/logout')
  }

  handleUserLogin() {
    this.setState({
      currentUser: JSON.parse(localStorage.getItem('currentUser'))
    })
  }

  render() {
    return(
      <Router>
        <Switch>
          { routes.map((route) => {
              return (
                <Route
                  exact={route.exact}
                  key={route.path}
                  path={route.path}
                  render={props =>
                    this.state.currentUser || route.public ? (
                      <route.component
                        {...props}
                        currentUser={this.state.currentUser}
                        handleUserLogout={this.handleUserLogout.bind(this)}
                        handleUserLogin={this.handleUserLogin.bind(this)}
                      />
                    ) : (
                      <Redirect to={{pathname:'/login', state:{ from: props.location }}} />
                    )
                  }
                />
              )
          })
          }
          <Route component={PageNotFound} />
        </Switch>
      </Router>
    )
  }
}


export default App;
