import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((path) => path !== '');

  return (
    <nav className="hide-on-print" aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/surveylist">Home</Link>
        </li>
        {pathnames.map((path, index) => {
          const isLast = index === pathnames.length - 1;
          return (
            <li key={path} className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
              {isLast ? (
                <span>{path}</span>
              ) : (
                <span>{path}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
