import React from 'react'
import { useAuth } from '../contexts/AuthContexts'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyLeagues = () => {
    interface LeagueInfo {
    leagueName: string;
    league_id: number;
    createdBy: string;
}

interface Data {
    success: boolean;
    league: LeagueInfo[];
}
    const { isAuthenticated, user, login, logout } = useAuth();
    const [myLeagues, setMyLeagues] = useState<LeagueInfo[] | null>(null);

    const navigate = useNavigate();
    useEffect(() => {
        console.log(user)
        if (!isAuthenticated) {
          navigate("/");
        }
      }, [isAuthenticated, navigate]);
    useEffect(() => {
        const fetchClubData = async () =>{


        if (user){
            const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:5000/api/myLeagues/${user.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` },
        
        });
        const data = await response.json();
        if (data.success){
            console.log("Your leagues are fetched");
            setMyLeagues(data.league)
        }
        else{
            console.error(data.error)
        }

    }
    else{
        navigate("/")
    }
        }
        fetchClubData();
        
    }, [])

    

  return (
    <div>
  <button onClick={() => {
    if (!myLeagues || myLeagues.length === 0) {
      alert("No leagues");
    }
  }}>
    click me
  </button>
  {myLeagues && myLeagues.length > 0 && (
    <ul>
      {myLeagues.map((league) => (
        <li key={league.league_id}>
          <strong>League Name:</strong> {league.leagueName} <br />
          <a href = {`/leagues/${league.league_id}`}>
          <strong>League ID:</strong> {league.league_id} <br /></a>
          <strong>Created By:</strong> {league.createdBy}
          <hr />
        </li>
      ))}
    </ul>
  )}
  <button onClick = {() => navigate("/")}>Go Home</button>
</div>
  )
}

export default MyLeagues