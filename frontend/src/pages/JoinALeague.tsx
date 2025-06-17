import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContexts'


const JoinALeague = () => {
  const { isAuthenticated, user, login, logout, loading } = useAuth();
  const navigate = useNavigate()
  useEffect(() => {
              if (!isAuthenticated && !loading) {
                navigate("/login")
                
              }
              
             
            }, [isAuthenticated, navigate, loading]);

  const [code, setCode] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {


      
    e.preventDefault()
    console.log('fetching response')
    const createdBy = user;
    const token = localStorage.getItem('authToken')
    const response = await fetch("http://localhost:5000/api/member", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}`},
      body: JSON.stringify({ code, user }),
    });
    console.log('checking for data')
    const data = await response.json();
    if (data.success) {
      console.log('Club Joined!')
    }
    else {
      console.log(data.error)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          placeholder="Enter League Code" 
          value={code}
          onChange={(e) => setCode(e.target.value)} 
        />
        <button type="submit">Submit Code</button>
      </form>
      <br></br>
      <br></br>
      OR
      <br></br>
      <br></br>
      <button onClick={() => navigate("/createLeague")}>Create a League</button>
      <button onClick = {() => navigate("/")}>Go Home</button>
    </div>
  )
}

export default JoinALeague