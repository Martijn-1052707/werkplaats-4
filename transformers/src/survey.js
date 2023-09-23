import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

import './App.css';

function Survey() {
  const { id } = useParams(); // Use useParams hook to access the route parameters 
  const navigate = useNavigate(); // Use useNavigate hook to navigate to different routes
  const [survey, setSurvey] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [openAnswers, setOpenAnswers] = useState({});
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  useEffect(() => {
    axios.get(`/api/surveys/${id}`)
      .then(response => {
        setSurvey(response.data);
        setUserAnswers(new Array(response.data.questions.length).fill(''));
        console.log(response.data); // Debug: Check survey data
      })
      .catch(error => console.error(error));
  }, [id]);
  
  // Updates the userAnswers array with the selected answer text for a closed question
  const handleAnswerChange = (questionIndex, answerIndex) => {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[questionIndex] = survey.questions[questionIndex].answers[answerIndex].text; // Store the answer text instead of the index
    setUserAnswers(newUserAnswers);
  };

  // Updates the openAnswers object with the entered answer text for an open question
  const handleOpenAnswerChange = (questionIndex, value) => {
    const newOpenAnswers = {...openAnswers}; // Create copy of openAnswers
    newOpenAnswers[questionIndex] = value;
    setOpenAnswers(newOpenAnswers);
  };
  
  // Advances to the next question if available
  const handleNextQuestion = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  // Goes back to the previous question if available
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Handles the submission of the survey responses
  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (currentQuestion === survey.questions.length - 1) {
      const userAnswersWithIds = survey.questions.reduce((acc, question, index) => {
        if (question.type === 'closed_question') {
          acc[question.id] = userAnswers[index];
        }
        return acc;
      }, {});
  
      const openAnswersWithIds = Object.keys(openAnswers).reduce((acc, index) => {
        const question = survey.questions[index];
        if (question.type === 'open_question') {
          acc[question.id] = openAnswers[index];
        }
        return acc;
      }, {});
  
      axios
        .post(`/api/surveys/${id}/responses`, {
          userAnswers: userAnswersWithIds,
          openAnswers: openAnswersWithIds,
        })
        .then((response) => {
          console.log(response);
          setSurveySubmitted(true); // Set surveySubmitted to true on successful submission
        })
        .catch((error) => console.error(error));
    }
  };

  const renderPaginationBar = () => {
    // Render pagination bar for navigating between questions
    return (
      <ul className="pagination justify-content-center mt-4" style={{ borderTop: '1px solid #ccc', paddingTop: '25px' }}>
          {/* Generate pagination items */}
        {Array.from(Array(totalQuestionsCount), (_, index) => (
          <li
            key={index}
            className={`page-item ${index === currentQuestion ? 'active' : ''}`}
            onClick={() => {
             // Update current question when a different pagination item is clicked
              if (index !== currentQuestion) {
                setCurrentQuestion(index);
              }
            }}
            style={{ pointerEvents: index === currentQuestion ? 'auto' : 'none' }}
          >
              {/* Display pagination item */}
            <span className="page-link">{index + 1}</span>
          </li>
        ))}
      </ul>
    );
  };
 
  if (!survey) {
    return <p>Loading survey...</p>;
  }

  if (surveySubmitted) {
    return (
      <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <b>Survey Submitted</b>
            </div>
            <div className="card-body">
              <p>Thanks for taking the survey!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  // retrieves the question data of the current question being displayed
  const currentQuestionData = survey.questions[currentQuestion];

  // calculates several counts related to the survey questions and the user's answers
  const answeredClosedQuestionsCount = userAnswers.filter(answer => answer !== '').length;
  const answeredOpenQuestionsCount = Object.keys(openAnswers).length;
  const totalQuestionsCount = survey.questions.length;
  const totalAnsweredQuestionsCount = answeredClosedQuestionsCount + answeredOpenQuestionsCount;
  
  return (
   <div className="container mt-4">
    <div className="row justify-content-center">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header"><b>Take Survey: </b>Question {totalAnsweredQuestionsCount}/{totalQuestionsCount}</div>
          <form onSubmit={handleSubmit}>
            <h2>{survey.title}</h2>
            <p>{survey.description}</p>
            <div className="question">
              <p>{currentQuestion + 1}. {currentQuestionData.text}</p>
              {currentQuestionData.type === 'open_question' ? (
                <div className="answer-container">
                  <input
                    type="text"
                    value={openAnswers[currentQuestion] || ''}
                    onChange={event => handleOpenAnswerChange(currentQuestion, event.target.value)}
                  />
                </div>
                
              ) : (
                <div className="answer-container">
                  {currentQuestionData.answers.map((answer, answerIndex) => (
                    <label key={answerIndex} className="answer-label">
                      <input
                        type="radio"
                        name={`question${currentQuestion}`}
                        value={answer.text} // Change the value to the answer text
                        checked={userAnswers[currentQuestion] === answer.text} // Check if the user answer matches the answer text
                        onChange={() => handleAnswerChange(currentQuestion, answerIndex)}
                        className="radio-button"
                      />
                      <span className="answer-text">{String.fromCharCode(65 + answerIndex)}. {answer.text}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div className="navigation-buttons">
              <button
                type="button"
                className="back-button"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              {currentQuestion < survey.questions.length - 1 ? (
                <button type="button" className="next-button" onClick={handleNextQuestion}>
                  Next
                </button>
              ) : (
                <button type="button" className="submit-button" onClick={handleSubmit}>
                  Submit Answers
                </button>
              )}
            </div>
            {renderPaginationBar()}
          </form>
        </div>
      </div>
    </div>
  </div>
    
  );
}

export default Survey;