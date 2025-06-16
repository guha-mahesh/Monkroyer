import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContexts';
import { useNavigate } from 'react-router-dom';

const CreateLeague = () => {
  interface Data {
    code: string;
    success: boolean;
  }

  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [leagueName, setLeagueName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const createdBy = user;

    const response = await fetch("http://localhost:5000/api/league", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ createdBy, leagueName }),
    });

    const json = await response.json();
    if (json.success) {
      setData(json);
    }
  };

  return (
    <div>
      {data && data.success ? (
        <div>Success! Your league code is {data.code}</div>
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
        </form>
      )}
    </div>
  );
};

export default CreateLeague;
