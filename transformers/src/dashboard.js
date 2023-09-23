import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const [surveysResponse, questionsResponse] = await Promise.all([
        axios.get('/api/member-surveys/<email>'),
        axios.get('/api/questions')
      ]);

      const surveysData = surveysResponse.data;
      const questionsData = questionsResponse.data;

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

  if (isLoading) {
    return <p>Loading surveys...</p>;
  }

  return (
    <div>
      <h4>My Surveys:</h4>
      <br></br>
      {surveys.length === 0 && <p>No surveys available.</p>}
      <div className="row row-cols-1 row-cols-md-3 g-2">
        {surveys.map((survey) => (
          <div className="col" key={survey.id}>
            <div className="card position-relative">
              <div className="card-body">
                <h5 className="card-title">{survey.title}</h5>
                <h6 className="card-text">{survey.created_at}</h6>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/surveys/take/${survey.id}`)}
                  style={{ textDecoration: 'none' }}
                >
                  Take Survey
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
