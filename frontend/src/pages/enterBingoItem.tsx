import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const enterBingoItem = () => {
    const navigate = useNavigate()
    const [bingo, setBingo] = useState("")
    const [score, setScore] = useState(0)
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
    {score? (<h1>{score}</h1>) :(null)}
    <button onClick = {() => navigate("/")}> go Home</button>

    </>
  )
}

export default enterBingoItem