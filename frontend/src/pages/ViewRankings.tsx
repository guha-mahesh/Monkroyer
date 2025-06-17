import React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContexts'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom';

const ViewRankings = () => {
    
    interface pointDataInterface{
        username: string;
        points: number;
    }
    const { leagueId } = useParams<{ leagueId: string }>();
const [pointData, setPointData] = useState<pointDataInterface[] | null>(null);


    const navigate = useNavigate();
    const { isAuthenticated, user, loading } = useAuth();
    useEffect(()=>{
        if (!loading && !isAuthenticated){
            navigate("/login")

        }

    }, [navigate, isAuthenticated, loading])
    useEffect(()=>{
        const fetchPoints = async () => {
      if (!loading){
    const token = localStorage.getItem('authToken')

    if(user)
{
      const userId = user.id

      

    const response = await fetch(`http://localhost:5000/api/points/${leagueId}`, {
    method: 'GET',
      headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` },
    });
    
    const data = await response.json();


    if (data.success){
  console.log(data);
  const sorted = [...data.userData].sort((a, b) => b.points - a.points);
  setPointData(sorted);

}
    else{
        console.log(data.error)
    }

  }
    else{
      console.log("nothing found")
    }}
    }
    fetchPoints();

    }, [leagueId, loading])

     

  return (
    <div>
        {pointData && pointData.map((user, index) => (
  <div key={index}>
    <p>Username: {user.username}</p>
    <p>Points: {user.points}</p>
  </div>
))}<br></br>
        <button onClick = {() => navigate("/")}>Go Home</button>
    </div>
  )
}

export default ViewRankings