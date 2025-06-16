import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate()

  const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
  const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isUserValid = USER_REGEX.test(username);
    const isPwdValid = PWD_REGEX.test(pwd);

    if (!isUserValid || !isPwdValid) {
      console.log("change shit up");
      return;
    }


    const response = await fetch("http://localhost:5000/api/users", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: pwd }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('User created with ID:', data.user.id);
      login({
    token: data.token,
    user: data.user
    
  });
  navigate("/")
    } else {
      console.error('Failed to create user:', data.error);
    }
  };

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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
