import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);

  const login = (e) => {
    e.preventDefault(); // Prevent form submission

    axios
      .post('/api/login', { email, password })
      .then((response) => {
        const data = response.data;
        // Authentication successful, call the onLogin prop with the role, username, and email
        onLogin(data.role, data.email, data.username);

        setShowError(false);

        if (data.role === 'admin') {
          navigate('/admin'); // Redirect to the admin dashboard
        } else if (data.role === 'member') {
          navigate('/dashboard'); // Redirect to the member homepage
        }
      })
      .catch((error) => {
        console.error(error);
        setShowError(true);
      });
  };
  

  return (
    <div className="container">
      <div className="text-center">
        <img src="./logo192.svg" alt="Logo" width="300" height="100" />
      </div>
      <div className="row justify-content-center mt-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <form onSubmit={login}>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>
              </form>
              {showError && (
                <div className="text-danger text-center mt-3">
                  Incorrect email or password.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
