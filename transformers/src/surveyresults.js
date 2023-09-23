import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SurveyResults() {
  const [surveyResults, setSurveyResults] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    fetchSurveyResults();
    fetchSurveys();
  }, []);

  const fetchSurveyResults = () => {
    axios
      .get('/api/surveyresults')
      .then((response) => {
        setSurveyResults(response.data);
        console.log('Survey results response data: ', response.data);
      })
      .catch((error) => console.error(error));
  };

  const fetchSurveys = () => {
    axios
      .get('/api/surveys')
      .then((response) => {
        setSurveys(response.data);
      })
      .catch((error) => console.error(error));
  };

  const handleSurveySelect = (surveyId) => {
    const selected = surveyResults?.find((survey) => survey.id === surveyId);
    const filteredResults = selected?.submitted_surveys.filter((submittedSurvey) => {
      if (submittedSurvey.is_anonymous) {
        return true; // Include anonymous survey responses
      } else {
        return submittedSurvey.email !== null; // Include responses filled in by email
      }
    });
    setSelectedSurvey({ ...selected, submitted_surveys: filteredResults });
  };

  const renderSurveyDescription = (survey) => {
    let anonymityIndicator = "";
    if (survey.is_anonymous === 0) {
      anonymityIndicator = "(Anonymous)";
    } else if (survey.email) {
      anonymityIndicator = `(Email: ${survey.email})`;
    }
    return `${survey.description} ${anonymityIndicator}`;
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <b>Survey Results</b>
            </div>
            <div className="card-body">
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="surveyDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Select Survey
                </button>
                <ul className="dropdown-menu" aria-labelledby="surveyDropdown">
                  {surveys?.length > 0 ? (
                    surveys.map((survey) => (
                      <li key={survey.id} onClick={() => handleSurveySelect(survey.id)}>
                        <button className="dropdown-item" type="button">
                          {renderSurveyDescription(survey)}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li>No surveys available</li>
                  )}
                </ul>
              </div>
              {selectedSurvey && selectedSurvey.submitted_surveys?.length > 0 ? (
                <div className="survey-results">
                  <h2>{selectedSurvey.description}</h2>
                  {selectedSurvey.submitted_surveys.map((submittedSurvey) => (
                    <div key={submittedSurvey.response_id}>
                      {submittedSurvey.questions?.length > 0 ? (
                        submittedSurvey.questions.map((question) => (
                          <div key={question.id}>
                            <h5>{question.text}</h5>
                            {question.type === 'closed_question' ? (
                              <ul>
                                {submittedSurvey.selected_answers
                                  .filter((selectedAnswer) => selectedAnswer.question_id === question.id)
                                  .map((selectedAnswer, index) => (
                                    <li key={index}>
                                      Selected answer: {selectedAnswer.selected_answer}
                                    </li>
                                  ))}
                              </ul>
                            ) : (
                              <div>
                                <ul>
                                  {submittedSurvey.selected_answers
                                    .filter((selectedAnswer) => selectedAnswer.question_id === question.id)
                                    .map((selectedAnswer, index) => (
                                      <li key={index}>
                                        Selected answer: {selectedAnswer.selected_answer}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>No questions available</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No survey selected</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyResults;
