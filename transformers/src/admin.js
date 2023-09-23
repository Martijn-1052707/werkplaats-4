import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faPlus } from '@fortawesome/free-solid-svg-icons';

const Admin = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSurveyLinkClick = (surveyId) => {
    navigate('/surveylink', { state: { surveyId } });
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const [surveysResponse, questionsResponse] = await Promise.all([
        axios.get('/api/surveys'),
        axios.get('/api/questions')
      ]);

      const surveysData = surveysResponse.data;
      const questionsData = questionsResponse.data;

      // Merge the questions data into the surveys
      const surveysWithQuestions = surveysData.map(survey => ({
        ...survey,
        questions: questionsData.filter(question => question.survey_id === survey.id)
      }));

      setSurveys(surveysWithQuestions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeSurvey = (surveyId) => {
    navigate(`/surveys/take/${surveyId}`);
  };

  const deleteSurvey = (surveyId, event) => {
    event.preventDefault();
  
    const confirmation = window.confirm("Are you sure you want to delete this survey?");
    if (!confirmation) {
      return;
    }
  
    axios
      .delete(`/api/surveys/${surveyId}`)
      .then((response) => {
        // Handle success response
        console.log(response.data);
        // Update the surveys list in the state if necessary
        window.location.reload(); // Refresh the page after deletion
      })
      .catch((error) => {
        // Handle error response
        console.error(error);
      });
  };

  if (isLoading) {
    return <p>Loading surveys...</p>;
  }

  return (
    <div>
      <div className="mb-3">
        <Link to="/surveys/create" className="btn btn-primary">
          New Survey
        </Link>
        <Link to="/surveyresults" className="btn btn-primary">
          Survey Results
        </Link>
      </div>
      {surveys.length === 0 && <p>No surveys available.</p>}
      <div className="row row-cols-1 row-cols-md-3 g-2">
        {surveys.map((survey) => (
          <div className="col" key={survey.id}>
            <div className="card position-relative">
              <div className="card-body">
                <h5 className="card-title">{survey.title}</h5>
                <h6 className="card-title">{survey.description}</h6>
                {/* <h6 className="card-text">{survey.questions?.length || 0} Questions</h6>
                <h6 className="card-text">{survey.submitted_surveys.length} Answers</h6> */}
                <h6 className="card-text">{survey.created_at}</h6>
                <button className="btn btn-primary" onClick={() => handleTakeSurvey(survey.id)}>
                Take Survey
              </button>
              </div>
              <div className="position-absolute bottom-0 end-0">
                <div className="dropdown">
                  <button
                    className="btn btn-link "
                    type="button"
                    id={`dropdownMenuButton${survey.id}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FontAwesomeIcon icon={faEllipsisH} className="horizontal-icon" />
                  </button>
                  <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${survey.id}`}>
                    <li>
                      <Link to={`/surveys/edit/${survey.id}`} className="dropdown-item">Edit</Link>
                    </li>
                    <li>
                      <Link to={`/${survey.id}`} className="dropdown-item" onClick={(event) => deleteSurvey(survey.id, event)}>
                        Delete 
                      </Link>
                    </li>                      
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-2">
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
