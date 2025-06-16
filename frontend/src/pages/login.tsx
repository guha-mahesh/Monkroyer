import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate()
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const response = await fetch("http://localhost:5000/api/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: pwd }),
    });

    const data = await response.json();
    if (data.success){

  login({
    token: data.token,
    user: data.user
  });

    navigate("/")

    }

  }
 
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <section>
          <label>Username</label>
          <input
            type="text"
            name="username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </section>
        <section>
          <label>Password</label>
          <input
            type="password"
            name="password"
            onChange={(e) => setPwd(e.target.value)}
          />
        </section>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login