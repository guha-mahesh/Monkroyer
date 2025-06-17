import React from 'react'
import { useParams } from 'react-router-dom';
import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';




const LeaguePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, logout, loading } = useAuth();
    interface bingoItem{
      score: string;
      content: string;
      id: string;
    }
    interface Data {
    leagueName: string;
    success: boolean;
    members: string[];
    created: boolean;
    leagueCode: string;
    BingoItems: bingoItem[]
    }
    const { leagueId } = useParams<{ leagueId: string }>();
    const [leagueData, setLeagueData] = useState<Data | null>(null);

      useEffect(() => {
        if (!isAuthenticated && !loading) {
          navigate("/login")
          
        }
        
       
      }, [isAuthenticated, navigate, loading]);
    
    useEffect(() =>{
    const fetchLeague = async () => {
      if (!loading){
    const token = localStorage.getItem('authToken')

    if(user)
{
      const userId = user.id

      

    const response = await fetch(`http://localhost:5000/api/league/${leagueId}/${userId}`, {
    method: 'GET',
      headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` },
    });
    
    const data = await response.json();

    setLeagueData(data)
    console.log(data)
  }
    else{
      console.log("no user")
    }}
    }
    fetchLeague();

    }, [leagueId, loading])

    const checkItem = async (item) =>{ 
      const token = localStorage.getItem('authToken')
      const response = await fetch("http://localhost:5000/api/happenstance", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` },
        body: JSON.stringify({ promptId: item.id, score: item.score }),

    });
    const data = await response.json();
    if (data.success){
      console.log("Succesfully updated hapenstance")
      console.log(data.happen)
      console.log(data.points)
    }
    else{
      console.log("fail")
    }
  }

    
  return (<>
    {leagueData?(<div> League: {leagueData.leagueName}<br></br>
    {leagueData.members.map((username, index) => (
    <div key={index}>Member: {username}</div>
))}<br></br><h1>{leagueData.created.toString()}</h1>{leagueData.created?(leagueData.leagueCode):(null)}<br></br><br></br>{leagueData?.BingoItems.map((item, index) => (
  <div key={index} className="p-2 border-b">
    <p onClick = {() => checkItem(item)}><strong>Content:</strong> {item.content}</p>
    <p onClick = {() => checkItem(item)}><strong>Score:</strong> {item.score}</p>
  </div>
))}<button onClick = {() => navigate(`/rankings/${leagueId}`)}>View Rankings</button><br></br><button onClick = {() => navigate("/")}>Go Home</button></div>): (<h1></h1>)}
    </>
  )
}

export default LeaguePage