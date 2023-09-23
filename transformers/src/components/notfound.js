import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="wrapper">
      <div className="center">
        <div className="notfound">
          <h1>Oops! You seem to be lost :(</h1>
          <p className="info">Here are some helpful links:</p>
          <p>
            <button className="link" onClick={handleLogin}>
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
