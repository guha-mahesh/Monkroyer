import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContexts'


const home = () => {
const { isAuthenticated, user, login, logout } = useAuth();
const navigate = useNavigate();
return (
  <>
    <div>hey {isAuthenticated ? user?.username : null}!... welcome to...</div>
    <div>monkroyer...</div>
    {!isAuthenticated ? (
      <>
        <button onClick={() => navigate('/signup')}>Sign Up</button>
        <button onClick={() => navigate('/login')}>Sign In</button>
      </>
    ) : (
      <>
        <button onClick={logout}>Log Out</button>
        <button onClick={() => navigate("/enterItem")}>Enter Item</button>
        <button onClick = {() => navigate("/joinLeague")}>Join a League</button>
        <br></br>
        <br></br>
        <br></br>
        <button onClick = {() => navigate("/myLeagues")}>My Leagues</button>
      </>
    )}
  </>
);
}

export default home