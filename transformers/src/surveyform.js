import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SurveyForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('New Survey');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState('anonymous');
  const [email, setEmail] = useState('');
  const [recipientEmails, setRecipientEmails] = useState([]);

  useEffect(() => {
    fetchAllQuestions();
  }, []);

  const fetchAllQuestions = () => {
    axios
      .get('/api/questions')
      .then((response) => {
        setAllQuestions(response.data);
      })
      .catch((error) => console.error(error));
  };

  const handleQuestionChange = (event, index) => {
    const newQuestions = [...questions];
    newQuestions[index].text = event.target.value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (event, questionIndex, answerIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].answers) {
      newQuestions[questionIndex].answers[answerIndex].text = event.target.value;
      setQuestions(newQuestions);
    }
  };

  const handleAddQuestion = () => {
    const newQuestions = [...questions];
    newQuestions.push({
      text: 'Question',
      answers: [
        { text: 'Option 1' },
        { text: 'Option 2' },
        { text: 'Option 3' },
        { text: 'Option 4' },
      ],
    });
    setQuestions(newQuestions);
  };

  const handleAddOpenQuestion = () => {
    const newQuestions = [...questions];
    newQuestions.push({
      text: 'Question',
      type: 'open_question',
    });
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleToggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleOptionSelection = (option) => {
    if (option === 'multiple_choice') {
      handleAddQuestion();
    } else if (option === 'open_question') {
      handleAddOpenQuestion();
    }
    setShowOptions(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (title.trim() === '' || description.trim() === '' || questions.length === 0) {
      alert('Please fill in all fields and add at least one question.');
      return;
    }
  
    let isAnonymous = 1;
    let userEmails = [];
    if (selectedOption === 'email') {
      if (!recipientEmails || recipientEmails.length === 0) {
        alert('Please enter recipient email(s).');
        return;
      }
      isAnonymous = 0;
      userEmails = recipientEmails;
    }

    const data = {
      title,
      description,
      questions,
      userEmails,
      isAnonymous,
    };
  
    axios
      .post('/api/surveys', data)
      .then((response) => {
        const surveyId = response.data.id;
        navigate('/surveylink', { state: { surveyId } });
      })
      .catch((error) => console.error(error));
  };
  
  const handleRecipientEmailsChange = (event) => {
    setRecipientEmails(event.target.value.split(',').map((email) => email.trim()));
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <b>Create Survey</b>
            </div>

            <div className="card-body">
              <form className="survey-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Options:</label>
                  <div className="options-wrapper">
                    <div className="form-check">
                      <input
                        type="radio"
                        id="anonymous"
                        name="options"
                        value="anonymous"
                        checked={selectedOption === 'anonymous'}
                        onChange={() => setSelectedOption('anonymous')}
                      />
                      <label htmlFor="anonymous">Anonymous</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="email"
                        name="options"
                        value="email"
                        checked={selectedOption === 'email'}
                        onChange={() => setSelectedOption('email')}
                      />
                      <label htmlFor="email">Email</label>
                    </div>
                  </div>
                  {selectedOption === 'email' && (
                    <div className="form-group">
                      <label>Recipient Email:</label>
                      <input
                        type="text"
                        className="form-input"
                        value={recipientEmails.join(', ')}
                        onChange={handleRecipientEmailsChange}
                      />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="title">Title:</label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <input
                    id="description"
                    type="text"
                    className="form-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {questions.map((question, index) => (
                  <div key={index} className="question-wrapper">
                    <div className="form-group">
                      <div className="form-group">
                        <label>Question pool:</label>
                        <br />
                        <select
                          value={question.text}
                          onChange={(e) => handleQuestionChange(e, index)}
                          className="form-input"
                        >
                          <option value="">Select a question</option>
                          {allQuestions.map((q, idx) => (
                            <option key={idx} value={q.text}>
                              {q.text}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="question-row">
                      <div className="question-input">
                        <label>Question {index + 1}:</label>
                        <input
                          type="text"
                          className="form-input"
                          value={question.text}
                          onChange={(e) => handleQuestionChange(e, index)}
                        />
                      </div>
                      <button
                        type="button"
                        className="del-question-btn"
                        onClick={() => handleDeleteQuestion(index)}
                      >
                        X
                      </button>
                    </div>
                    {question.type === 'open_question' ? (
                      <p></p>
                    ) : (
                      <div>
                        <p></p>
                        {question.answers &&
                          question.answers.map((answer, answerIndex) => (
                            <div key={answerIndex} className="radio-input">
                              <input
                                type="radio"
                                name={`question${index}`}
                                value={answerIndex}
                                onChange={(e) => handleAnswerChange(e, index, answerIndex)}
                                className="radio-button"
                              />
                              <label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={answer.text}
                                  onChange={(e) => handleAnswerChange(e, index, answerIndex)}
                                />
                              </label>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="new-addition-container">
                  <button type="button" className="new-addition-btn" onClick={handleToggleOptions}>
                    + Add new
                  </button>

                  {showOptions && (
                    <div className="addition-options">
                      <button
                        type="button"
                        className="new-addition-btn"
                        onClick={() => handleOptionSelection('multiple_choice')}
                      >
                        Multiple Choice
                      </button>
                      <button
                        type="button"
                        className="new-addition-btn"
                        onClick={() => handleOptionSelection('open_question')}
                      >
                        Open Question
                      </button>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary">
                  Create Survey
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyForm;