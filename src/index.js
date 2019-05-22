import React from 'react';
import ReactDOM from 'react-dom';
import {
  Route,
  Switch,
  BrowserRouter as Router
} from 'react-router-dom';
import { routes } from './routes';
import PageNotFound from './public/pageNotFound'

const routing = (
    <Router>
      <Switch>
        { routes.map((route) => {
            return (<Route
              exact={route.exact}
              key={route.path}
              path={route.path}
              component={route.component}
            />)
          })
        }
        <Route component={PageNotFound} />
      </Switch>
    </Router>
)

ReactDOM.render(
  routing,
  document.getElementById('root')
)
