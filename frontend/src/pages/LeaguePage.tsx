import React from 'react'
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';


const LeaguePage = () => {

    interface Data {
    leagueName: string;
    success: boolean;
    members: string[]
    }
    const { leagueId } = useParams<{ leagueId: string }>();
    const [leagueData, setLeagueData] = useState<Data | null>(null);
    
    useEffect(() =>{
    const fetchLeague = async () => {
     
    const response = await fetch(`http://localhost:5000/api/league/${leagueId}`, {
    method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    setLeagueData(data)
    }
    fetchLeague();



    



    }, [leagueId])

    
  return (<>
    {leagueData?(<div>{leagueData.leagueName}<br></br>
    {leagueData.members.map((username, index) => (
    <div key={index}>{username}</div>
))}</div>): (<h1></h1>)}
    </>
  )
}

export default LeaguePage