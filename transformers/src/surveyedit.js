import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const SurveyEdit = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deletedQuestions, setDeletedQuestions] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/surveys/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setDescription(res.data.description);
        setQuestions(res.data.questions);
      })
      .catch((err) => setError(err.response.data.message));
  }, [id]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleQuestionChange = (event, index) => {
      const sanitizedInput = sanitizeInput(event.target.value);
  
      if (isValidInput(sanitizedInput)) {
          const updatedQuestions = [...questions];
          updatedQuestions[index].text = sanitizedInput;
      } else {
      }
  }
  
  function sanitizeInput(input) {
      // Remove any HTML tags and trim whitespace
      const sanitized = input.replace(/<[^>]*>?/gm, '').trim();
      return sanitized;
  }
  
  function isValidInput(input) {
      // Check if the input is not empty
      return input.length > 0;
  }

  const handleAnswerChange = (event, questionIndex, answerIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex].text = event.target.value;
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (questionIndex) => {
    const updatedQuestions = [...questions];
    const deletedQuestion = updatedQuestions.splice(questionIndex, 1)[0];
    setQuestions(updatedQuestions);
    if (deletedQuestion.id) {
      setDeletedQuestions([...deletedQuestions, deletedQuestion.id]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Submitting survey data:', { title, description, questions, deletedQuestions });
    axios
      .put(`/api/surveys/${id}`, { title, description, questions, deletedQuestions })
      .then(() => {
        console.log('Survey data successfully updated');
        // navigate('/surveys');
      })
      .catch((err) => {
        console.error('Error updating survey data:', err);
        // setError(err.response.data.message);
      });
    setSuccessMessage('Changes saved successfully!');
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <b>Edit Survey</b>
            </div>

            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={title}
                    onChange={handleTitleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={description}
                    onChange={handleDescriptionChange}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="questions">Question</label>
                  {questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="mb-3">
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control"
                          id={`question${question}`}
                          value={question.text}
                          onChange={(event) => handleQuestionChange(event, questionIndex)}
                        />
                        <button
                          type="button"
                          className="del-question-btn ml-2"
                          onClick={() => handleDeleteQuestion(questionIndex)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                      {question.type === 'closed_question' && (
                        <div>
                          {question.answers.map((answer, answerIndex) => (
                            <div key={answerIndex} className="form-check d-flex align-items-center mb-1">
                              <input
                                type="text"
                                className="form-control mt-2"
                                rows="3"
                                value={answer.text}
                                onChange={(event) => handleAnswerChange(event, questionIndex, answerIndex)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                
                {successMessage && <div className="success-message">{successMessage}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyEdit;
