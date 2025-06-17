import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContexts';

const enterBingoItem = () => {
    const { isAuthenticated, user, login, logout, loading } = useAuth();
    const navigate = useNavigate()
    const [bingo, setBingo] = useState("")
    const [score, setScore] = useState(0)
    useEffect(() => {
            if (!isAuthenticated && !loading) {
              navigate("/login")
              
            }
            
           
          }, [isAuthenticated, navigate, loading]);

    const handleSubmit =async () => {
        const response = await fetch("http://localhost:5000/api/score", {
        method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: bingo }),
    });
    const data = await response.json();
    console.log("Unlikelihood score:", data.score);
    const rawScore = data.score; 
    const match = rawScore.match(/(\d+(\.\d+)?)/);
    if (match) {
    setScore(parseFloat(match[0]));
    } else {
    setScore(0); 
    }
   


    }
     const handleSave = async () =>{
      if(user){
        const userId = user.id;
        const prompt = bingo;
        const token = localStorage.getItem('authToken')
        console.log("items:", {userId, prompt, token})
        console.log("fetching data")
        const response = await fetch("http://localhost:5000/api/bingoItem", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}`},
        body: JSON.stringify({ prompt , userId, score }),

    });
      const data = await response.json();
      if (data.success){
        console.log("item Saved")
      }
      else{
        console.log(data.error)
      }
      }
      else{
        console.log("no user")
      }


    }
  return (
    <>
    <div>Enter Bingo Item here:</div>
    <input  onChange ={(e)=> setBingo(e.target.value)}/>
    <br></br>
    <br></br>
    <br></br>
    <button onClick = {() => handleSubmit()}>Submit</button>
    <br></br>
    <br></br>
    <br></br>
    {score? (<><h1>{score}</h1> <br></br> <button onClick = {() => handleSave()}>Save Item to ALL Leagues</button></>) :(null)}
    <button onClick = {() => navigate("/")}> go Home</button>
    

    </>
  )
}

export default enterBingoItem