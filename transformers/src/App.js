import './App.css';

import Navigation from './components/navbar.js';
import Login from './pages/login/login';
import NotFound from './components/notfound.js';
// import Home from './pages/home/home.js';


import Survey from './survey';
import SurveyForm from './surveyform'
import SurveyEdit from './surveyedit';
import SurveyLink from './surveylink';

import SurveyResults from './surveyresults';

import Dashboard from './dashboard';

import Admin from './admin';

import React, { useState, useEffect } from 'react';

import { useNavigate, Link, Route, Routes } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Row, Col } from 'react-bootstrap';

import Breadcrumbs from './breadcrumbs';

function App() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false); // State to track authentication status
  const [user, setUser] = useState(''); // State to store the user's name
  const [role, setRole] = useState(''); // State to store the user's role

  useEffect(() => {
    const storedAuthenticated = localStorage.getItem('authenticated');
    
    if (storedAuthenticated === 'true') {
      setAuthenticated(true);
      setUser(localStorage.getItem('user'));
      setRole(localStorage.getItem('role'));
    }
  }, []);
  
  const handleLogin = (role, email, name) => {
    localStorage.setItem('authenticated', 'true');
    // Perform login logic here (e.g., validate credentials, set authentication tokens)
    const token = 'your-authentication-token'; // Replace with your actual authentication token
    localStorage.setItem('authToken', token); // Store the authentication token in localStorage
    localStorage.setItem('user', name); // Store the user's name in localStorage
    localStorage.setItem('role', role); // Store the user's role in localStorage
    setAuthenticated(true); // Set authentication status to true
    setUser(name); // Set the user's name
    setRole(role); // Set the user's role
  
    if (role === 'admin') {
      navigate('/admin'); // Redirect to the admin dashboard
    } else if (role === 'member') {
      navigate('/member'); // Redirect to the member homepage
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('authenticated');
    // Perform logout logic here (e.g., clear authentication tokens, reset state)
    localStorage.removeItem('authToken'); // Remove the authentication token from localStorage
    localStorage.removeItem('user'); // Remove the user from localStorage
    localStorage.removeItem('role'); // Remove the user's role from localStorage
    setAuthenticated(false); // Set authentication status to false
    setUser(''); // Clear the user's name
    setRole(''); // Clear the user's role
    navigate('/');
  };
  
    return (
    <>
    {authenticated && (
      <Navbar className="hide-on-print" bg="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="#">
            <img
              src={process.env.PUBLIC_URL + '/logo192.svg'}
              width="150"
              height="50"
              className="d-inline-block align-top"
              alt="React Bootstrap logo"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            
                {role === 'admin' && (
                  <Nav.Link as={Link} to="/admin">
                    Dashboard
                  </Nav.Link>
                )}
                {role === 'member' && (
                  <Nav.Link as={Link} to="/dashboard">
                    Dashboard
                  </Nav.Link>
                )}
            </Nav>
            {authenticated && (
            <div className="d-flex align-items-center">
              <span className="me-2">Welcome, {user}</span>
              <Button variant="btn btn-primary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    )}
      <Container>
        <Row>
          <Col>
            
            <br></br>
            {/* <h2>360 Feedback tool</h2> */}
            
            {authenticated && <Breadcrumbs />} {/* Show breadcrumbs only when authenticated */}
  
          </Col>
        </Row>
        <Row>
          <Routes>
          <Route
            path="/surveys/take/:id"
                element={<Survey />}
              />
            {!authenticated ? (
              <Route path="/" element={<Login onLogin={handleLogin} />} />
            ) : (
              <>
               
                <Route
                  path="/surveys/create"
                  element={<SurveyForm />}
                />
                
                <Route
                  path="/surveys/edit/:id"
                  element={<SurveyEdit />}
                />

                {role === 'member' && (
                  <Route path="/dashboard" element={<Dashboard />} />
                )}

                {role === 'admin' && (
                  <Route path="/admin" element={<Admin />} />
                )}

                <Route path="/surveylink" element={<SurveyLink />} />
                 
                <Route path="/survey/:id" element={<Survey />}  /> 
                <Route path="/surveyresults" element={<SurveyResults />}  />       
                {/* <Route path="/surveysend/:id" element={<SendSurveyLink />}  />        */}
              </>
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Row>
      </Container>

      <footer className="fixed-footer">
        <div className="text-center p-3 hide-on-print">© 2023 Transformers</div>
      </footer>
      
    </>
  );
}

export default App;