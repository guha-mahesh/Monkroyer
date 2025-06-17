import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContexts';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


const CreateLeague = () => {
  interface Data {
    code: string;
    success: boolean;
    id: string;
  }

  const { isAuthenticated, user, loading } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [leagueName, setLeagueName] = useState("");
  const navigate = useNavigate();

 useEffect(() => {
             if (!isAuthenticated && !loading) {
               navigate("/login")
               
             }
             
            
           }, [isAuthenticated, navigate, loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const createdBy = user;
    const token = localStorage.getItem('authToken')


    if (!token) {

  console.error('No token found');
  navigate("/login")
  return;
    }


    const response = await fetch("http://localhost:5000/api/league", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',  'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ createdBy, leagueName }),
    });

    const json = await response.json();
    if (json.success) {
      setData(json);
    }
    else{
      console.log(json.error)
    }
  };

  return (
    <div>
      {data && data.success ? (
        <div>Success! Your league code is {data.code}<Link to={`/leagues/${data.id}`}>Go To League</Link>
        <button onClick = {() => navigate("/")}>Go Home</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <section>
            <label htmlFor="leagueName">League name</label>
            <input
              type="text"
              id="leagueName"
              name="leagueName"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              required
            />
          </section>
          <button type="submit">Create League</button>
          <button onClick = {() => navigate("/")}>Go Home</button>
          <button onClick = {() => navigate("/joinLeague")}>Join a League</button>
          
        </form>
      )}
    </div>
  );
};

export default CreateLeague;
