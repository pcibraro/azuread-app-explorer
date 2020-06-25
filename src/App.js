import React from 'react';
import './App.css';
import TopNavbar from './components/TopNavbar';
import Apps from './components/Apps';
import AppDetail from './components/AppDetail'
import { useMsal } from './msal-context';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

function App() {  
  const { isLoading } = useMsal();


  if(isLoading) {
    return <div>loading...</div>
  }

  return (
    <Router>
      <div className="App">
        <TopNavbar/>
      </div>
      <Switch>
        <Route exact path="/apps/:id" component={AppDetail} />
        <Route path="/apps/" component={Apps} />
        <Route path="/" component={Apps}/>
      </Switch>
    </Router>
  );
}

export default App;
