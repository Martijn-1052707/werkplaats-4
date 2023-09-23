import React from 'react';
import './enquete.css';
import { Link } from "react-router-dom";
import { useState } from 'react';
import axios from 'axios'
import { Dropdown, DropdownButton } from 'react-bootstrap';

function Survey() {
  const [formName, setFormName] = useState('');
  const [questions, setQuestions] = useState([]);

  const handleAddShortAnswerQuestion = () => {
    setQuestions([...questions, { type: 'short-answer', text: '' }]);
  };

  const handleAddMultipleChoiceQuestion = () => {
    setQuestions([...questions, { type: 'multiple-choice', text: '', choices: [] }]);
  };

  const handleQuestionTextChange = (index, text) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const handleChoiceTextChange = (questionIndex, choiceIndex, text) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices[choiceIndex] = text;
    setQuestions(newQuestions);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    // submit form data to backend API
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <label>
        Form Name:
        <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} />
      </label>
      {questions.map((question, index) => (
        <div key={index}>
          <label>
            Question {index + 1}:
            <input type="text" value={question.text} onChange={(e) => handleQuestionTextChange(index, e.target.value)} />
          </label>
          {question.type === 'multiple-choice' && (
            <div>
              {question.choices.map((choice, choiceIndex) => (
                <label key={choiceIndex}>
                  Choice {choiceIndex + 1}:
                  <input type="text" value={choice} onChange={(e) => handleChoiceTextChange(index, choiceIndex, e.target.value)} />
                </label>
              ))}
              <button type="button" onClick={() => {
                const newQuestions = [...questions];
                newQuestions[index].choices.push('');
                setQuestions(newQuestions);
              }}>Add Choice</button>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={handleAddShortAnswerQuestion}>Add Short Answer Question</button>
      <button type="button" onClick={handleAddMultipleChoiceQuestion}>Add Multiple Choice Question</button>
      <button type="submit">Save Form</button>
    </form>
  );
}


export default Survey;
