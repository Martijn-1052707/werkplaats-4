import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const SurveyLink = () => {
  const location = useLocation();
  const [surveyId, setSurveyId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [surveyLink, setSurveyLink] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const surveyIdFromLocation = location.state?.surveyId;
    if (surveyIdFromLocation) {
      setSurveyId(surveyIdFromLocation);
      fetchSurveyData(surveyIdFromLocation);
    }
  }, [location.state]);

  const fetchSurveyData = (surveyId) => {
    axios
      .get(`/api/surveys/${surveyId}`)
      .then((response) => {
        const surveyData = response.data;
        setQuestions(surveyData.questions);
        const baseURL = 'http://localhost:3000/surveys/take/';
        const link = `${baseURL}${surveyId}`;
        setSurveyLink(link);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(surveyLink);
    alert('this link can now be pasted!');
  };

  const handleEmailSend = () => {
    const emails = recipientEmails.split(',').map((email) => email.trim());
    // Make an API call to send the survey link to the recipients
    axios
      .post('/api/send-email', { emails, surveyLink })
      .then((response) => {
        console.log(response);
        setEmailSent(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <b>Survey link</b>
            </div>
            <div className="success-page">
              <h1 className="success-title">Survey Created Successfully!</h1>
              {questions.length > 0 && (
                <div className="email-functionality">
                  {surveyLink && (
                <div className="survey-link-container">
                  <h6>Send survey link anonymously</h6>
                  {/* <h4 className="survey-link-title">Survey Link: </h4> */}
                  <button
                    type="button"
                    className="btn btn-primary generate-link-button"
                    onClick={handleCopyToClipboard}
                  >
                    Generate Link
                  </button>
                </div>
              )}
             <br></br>
                  <h6>Send Survey Link to other Recipients</h6>
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      value={recipientEmails}
                      onChange={(e) => setRecipientEmails(e.target.value)}
                      placeholder="Enter email addresses (comma-separated)"
                    />
                    <h6></h6>
                    <button
                      type="button"
                      className="btn btn-primary send-email-button"
                      onClick={handleEmailSend}
                    >
                      Send
                    </button>
                    {emailSent && (
                      <div className="text-success">Email sent successfully!</div>
                    )}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyLink;
