import React from 'react';
import './App.css';
import { BrowserRouter, Route, Router, Switch, useHistory } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Profile from './Profile';
import PageNotFound from './PageNotFound';
import Navbar from './Navbar';
import Footer from './Footer';
import StockInfo from './StockInfo';
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  return (
    <div className="App">

      <BrowserRouter>
        <Navbar />
        <Switch>
          <Route path='/' exact component={Home} />
          <Route path='/login' component={Login} />
          <Route path='/logout' component={Logout} />
          <Route path='/profile' component={Profile} />
          <Route exact path='/stock/:stockId' component={StockInfo} />
          <Route component={PageNotFound} />
        </Switch>
      </BrowserRouter>
      <br />
      <br />
      <Footer />
    </div>
  );
}

export default App;
