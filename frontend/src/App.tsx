import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/home';
import SignUp from './pages/signUp';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContexts'
import EnterBingoItem from './pages/enterBingoItem';
import JoinALeague from './pages/JoinALeague';
import CreateLeague from './pages/CreateLeague';
import LeaguePage from './pages/LeaguePage';

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element = {<SignUp/>}/>
          <Route path = "/login" element = {<Login/>}/>
          <Route path ="/enterItem" element = {<EnterBingoItem/>} />
          <Route path = "/joinLeague" element = {<JoinALeague/>}/>
          <Route path = "/createLeague" element = {<CreateLeague/>}/>
           <Route path="/leagues/:leagueId" element={<LeaguePage />} />
        </Routes>
      </Router>
    </AuthProvider>
    </>
  )
}

export default App
