import sqlite3

from flask import Flask, request, jsonify, render_template, g
from flask_cors import CORS

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

CORS(app)

DATABASE = './database/wp4.db'

@app.route("/")
def index():
    return render_template('/index.html')

# Utility function to get a database connection
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

# Helper function to convert rows to dictionaries
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

# fetch all questions
@app.route('/api/questions', methods=['GET'])
def get_all_questions():
    conn = sqlite3.connect('./database/wp4.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()
    cur.execute('SELECT * FROM questions')
    questions = cur.fetchall()
    conn.close()
    return jsonify(questions)

# Endpoint to get all surveys
@app.route('/api/surveys', methods=['GET'])
def get_surveys():
    conn = sqlite3.connect('./database/wp4.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()

    cur.execute('SELECT * FROM surveys')
    surveys = cur.fetchall()

    for survey in surveys:
        survey_id = survey['id']

        # Retrieve the submitted surveys for the survey
        cur.execute('SELECT * FROM responses WHERE survey_id = ?', (survey_id,))
        responses = cur.fetchall()

        submitted_surveys = []
        for response in responses:
            response_id = response['id']
            cur.execute('SELECT * FROM submitted_answers WHERE response_id = ?', (response_id,))
            submitted_answers = cur.fetchall()

            # Add the submitted answers to the response object
            response['submitted_answers'] = submitted_answers

            submitted_surveys.append(response)

        # Add the submitted surveys to the survey object
        survey['submitted_surveys'] = submitted_surveys

    conn.close()
    return jsonify(surveys), 200

# this function gets a specific survey by id
@app.route('/api/surveys/<int:id>', methods=['GET'])
def get_survey(id):
    conn = sqlite3.connect('./database/wp4.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()

    # Retrieve the survey data
    cur.execute('SELECT * FROM surveys WHERE id = ?', (id,))
    survey = cur.fetchone()

    if survey:
        # Retrieve the questions for the survey
        cur.execute('SELECT * FROM questions WHERE survey_id = ?', (id,))
        questions = cur.fetchall()

        for question in questions:
            # Retrieve the answers for each question
            cur.execute('SELECT * FROM answers WHERE question_id = ?', (question['id'],))
            answers = cur.fetchall()
            question['answers'] = answers

        # Add the questions to the survey object
        survey['questions'] = questions

        # Retrieve the submitted surveys for the survey
        cur.execute('SELECT * FROM responses WHERE survey_id = ?', (id,))
        responses = cur.fetchall()

        submitted_surveys = []
        for response in responses:
            response_id = response['id']
            cur.execute('SELECT * FROM submitted_answers WHERE response_id = ?', (response_id,))
            submitted_answers = cur.fetchall()

            # Retrieve the open-ended answers for each response
            cur.execute('SELECT * FROM open_answers WHERE response_id = ?', (response_id,))
            open_answers = cur.fetchall()

            # Add the submitted answers and open-ended answers to the response object
            response['submitted_answers'] = submitted_answers
            response['open_answers'] = open_answers

            submitted_surveys.append(response)

        # Add the submitted surveys to the survey object
        survey['submitted_surveys'] = submitted_surveys

        conn.close()
        return jsonify(survey), 200
    else:
        conn.close()
        return jsonify({"error": "Survey not found"}), 404

# Handle the creation of a new survey via POST request
@app.route('/api/surveys', methods=['POST'])
def create_survey():
    # Retrieve the JSON data from the request
    data = request.get_json()

    # Extract the title and description of the survey
    title = data['title']
    description = data['description']

    # Extract the email and determine the value of is_anonymous
    userEmails = data.get('userEmails', [])
    email = userEmails[0] if userEmails else None
    is_anonymous = 1 if email else 0  # If an email is provided, survey is not anonymous

    # Connect to the SQLite database
    conn = sqlite3.connect('./database/wp4.db')
    cur = conn.cursor()

    # Insert the survey into the surveys table
    cur.execute('INSERT INTO surveys (title, description, is_anonymous, email) VALUES (?, ?, ?, ?)',
                (title, description, is_anonymous, email))

    survey_id = cur.lastrowid

    # Extract and process the questions of the survey
    questions = data['questions']
    for question in questions:
        # Extract the question text and type
        text = question['text']
        question_type = question.get('type', 'closed_question')

        # Insert the question into the questions table
        cur.execute('INSERT INTO questions (survey_id, text, type) VALUES (?, ?, ?)', (survey_id, text, question_type))
        question_id = cur.lastrowid

        if question_type == 'closed_question':
            # Process closed question answers
            answers = question['answers']
            for answer in answers:
                # Insert the answer into the answers table
                text = answer['text']
                cur.execute('INSERT INTO answers (question_id, text) VALUES (?, ?)', (question_id, text))
        else:
            # Insert an empty open answer into the open_answers table
            cur.execute('INSERT INTO open_answers (question_id, text) VALUES (?, ?)', (question_id, ''))

    # Commit the changes to the database
    conn.commit()
    conn.close()

    # Return the survey details as JSON response
    return jsonify({'id': survey_id, 'title': title, 'description': description, 'userEmail': email}), 200


# Handle retrieving a specific survey response via GET request
@app.route('/api/surveys/<int:survey_id>/responses/<int:response_id>', methods=['GET'])
def get_survey_response(survey_id, response_id):
    # Connect to the SQLite database
    conn = sqlite3.connect('./database/wp4.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()

    # Fetch the response with the specified survey and response IDs
    cur.execute("SELECT * FROM responses WHERE survey_id=? AND id=?", (survey_id, response_id))
    response = cur.fetchone()

    if response:
        # Fetch the submitted answers for the response
        cur.execute("SELECT * FROM submitted_answers WHERE response_id=?", (response_id,))
        submitted_answers = cur.fetchall()
        response['submitted_answers'] = submitted_answers

        # for loop can be removed since i am already fetching the answers this caused a duplication problem
        for submitted_answer in submitted_answers:
            response['submitted_answers'].append(submitted_answer['text'])

        # Fetch the open answers for the response
        cur.execute("SELECT * FROM open_answers WHERE response_id=?", (response_id,))
        open_answers = cur.fetchall()
        response['open_answers'] = open_answers

        # Fetch additional survey information
        cur.execute("SELECT title, description FROM surveys WHERE id=?", (survey_id,))
        survey_info = cur.fetchone()
        response['survey_title'] = survey_info['title']
        response['survey_description'] = survey_info['description']

        # Fetch questions and their answers
        cur.execute("SELECT * FROM questions WHERE survey_id=?", (survey_id,))
        questions = cur.fetchall()

        for question in questions:
            cur.execute("SELECT * FROM answers WHERE question_id=?", (question['id'],))
            submitted_answers = cur.fetchall()
            question['submitted_answers'] = submitted_answers

        response['questions'] = questions

        # Close the database connection and return the response as JSON
        conn.close()
        return jsonify(response), 200
    else:
        # Close the database connection and return an error if the submitted survey is not found
        conn.close()
        return jsonify({"error": "Submitted survey not found"}), 404

# Handle updating a survey via PUT request or retrieving a specific survey via GET request
@app.route('/api/surveys/<int:id>', methods=['PUT', 'GET'])
def update_survey(id):
    # Retrieve the JSON data from the request
    data = request.get_json()

    # Extract the title and description of the survey
    title = data['title']
    description = data['description']

    # Connect to the SQLite database
    conn = sqlite3.connect('./database/wp4.db')
    cur = conn.cursor()

    # Update the title and description of the survey in the surveys table
    cur.execute('UPDATE surveys SET title = ?, description = ? WHERE id = ?', (title, description, id))

    # Retrieve the questions from the JSON data and process each question
    questions = data['questions']
    for question in questions:
        question_id = question.get('id', None)
        if question_id is None:
            # Insert a new question into the questions table
            text = question['text']
            cur.execute('INSERT INTO questions (survey_id, text) VALUES (?, ?)', (id, text))
            question_id = cur.lastrowid
        else:
            # Update the text of an existing question in the questions table
            text = question['text']
            cur.execute('UPDATE questions SET text = ? WHERE id = ?', (text, question_id))

        answers = question['answers']
        for answer in answers:
            answer_id = answer.get('id', None)
            if answer_id is None:
                # Insert a new answer into the answers table
                text = answer['text']
                cur.execute('INSERT INTO answers (question_id, text) VALUES (?, ?)', (question_id, text))
            else:
                # Update the text of an existing answer in the answers table
                text = answer['text']
                cur.execute('UPDATE answers SET text = ? WHERE id = ?', (text, answer_id))

        # Delete answers that were marked for deletion
        deleted_answers = [answer for answer in answers if answer.get('delete', False)]
        for deleted_answer in deleted_answers:
            deleted_answer_id = deleted_answer.get('id', None)
            if deleted_answer_id is not None:
                cur.execute('DELETE FROM answers WHERE id = ?', (deleted_answer_id,))

    # Delete questions that were marked for deletion
    deleted_questions = data.get('deletedQuestions', [])
    for deleted_question_id in deleted_questions:
        cur.execute('DELETE FROM questions WHERE id = ?', (deleted_question_id,))

    # Commit the changes to the database
    conn.commit()

    # Fetch the updated survey data
    updated_survey = cur.execute('SELECT * FROM surveys WHERE id=?', (id,)).fetchone()

    # Close the database connection
    conn.close()

    # Convert the survey data to a JSON object and return it in the response
    updated_survey_data = {
        'id': updated_survey[0],
        'title': updated_survey[1],
        'description': updated_survey[2],
    }
    return jsonify(updated_survey_data), 200

# handles to delete a survey and questions
@app.route('/api/surveys/<int:id>', methods=['DELETE'])
def delete_survey(id):
    conn = sqlite3.connect('./database/wp4.db')
    cur = conn.cursor()

    # Delete the responses for the survey
    cur.execute('DELETE FROM responses WHERE survey_id = ?', (id,))

    # Delete the open answers for the survey
    cur.execute('DELETE FROM open_answers WHERE question_id IN (SELECT id FROM questions WHERE survey_id = ?)', (id,))

    # Delete the answers for the questions in the survey
    cur.execute('DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE survey_id = ?)', (id,))

    # Delete the questions in the survey
    cur.execute('DELETE FROM questions WHERE survey_id = ?', (id,))

    # Delete the survey
    cur.execute('DELETE FROM surveys WHERE id = ?', (id,))

    conn.commit()
    conn.close()

    return jsonify({'message': 'Survey deleted successfully'}), 200

# Handle the submission of survey responses via POST request
@app.route('/api/surveys/<int:survey_id>/responses', methods=['POST'])
def submit_response(survey_id):
    # Retrieve the JSON data from the request
    response_data = request.get_json()

    # Check if any response data is provided
    if not response_data:
        return jsonify({"error": "No data provided"}), 400

    # Extract open and closed answers from the response data
    open_answers = response_data.get('openAnswers', {})
    closed_answers = response_data.get('userAnswers', {})

    # Check if both open and closed answers are empty
    if not open_answers and not closed_answers:
        return jsonify({"error": "No answers provided"}), 400

    # Connect to the SQLite database
    conn = sqlite3.connect('./database/wp4.db')
    cur = conn.cursor()

    # Check if the specified survey exists
    survey_exists = cur.execute("SELECT * FROM surveys WHERE id=?", (survey_id,)).fetchone()
    if survey_exists:
        # Insert a new response entry for the survey
        cur.execute("INSERT INTO responses (survey_id) VALUES (?)", (survey_id,))
        response_id = cur.lastrowid

        # Process closed question answers
        for question_id, answer in closed_answers.items():
            # Get the question type from the database
            question_type = cur.execute("SELECT type FROM questions WHERE id=?", (question_id,)).fetchone()[0]
            if question_type == 'closed_question':
                # Insert the answer into the submitted_answers table
                cur.execute("INSERT INTO submitted_answers (question_id, text, response_id) VALUES (?, ?, ?)",
                            (question_id, answer, response_id))

        # Process open question answers
        for question_id, answer_text in open_answers.items():
            # Get the question type from the database
            question_row = cur.execute("SELECT type FROM questions WHERE id=?", (question_id,)).fetchone()
            if question_row is not None and question_row[0] == 'open_question':
                # Insert the answer into the open_answers table
                cur.execute("INSERT INTO open_answers (response_id, question_id, text) VALUES (?, ?, ?)",
                            (response_id, question_id, answer_text))

        # Commit the changes to the database
        conn.commit()
        return jsonify({"message": "Response submitted"}), 200
    else:
        # Return an error if the survey is not found
        return jsonify({"error": "Survey not found"}), 404

# Handle retrieving survey responses for a specific survey via GET request
@app.route('/api/surveys/<int:survey_id>/responses', methods=['GET'])
def get_survey_responses(survey_id):
    # Connect to the SQLite database
    conn = sqlite3.connect('./database/wp4.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()

    # Check if the specified survey exists
    survey_exists = cur.execute("SELECT * FROM surveys WHERE id=?", (survey_id,)).fetchone()
    if survey_exists:
        # Fetch all responses for the survey
        responses = cur.execute("SELECT * FROM responses WHERE survey_id=?", (survey_id,)).fetchall()

        survey_responses = []
        for response in responses:
            response_id = response['id']
            questions = cur.execute("SELECT * FROM questions WHERE survey_id=?", (survey_id,)).fetchall()

            submitted_answers = []
            for question in questions:
                if question['type'] == 'open_question':
                    # Fetch the submitted answer for an open question
                    submitted_answer = cur.execute("SELECT * FROM open_answers WHERE response_id=? AND question_id=?", (response_id, question['id'])).fetchone()
                else:
                    # Fetch the submitted answer for a closed question
                    submitted_answer = cur.execute("SELECT * FROM submitted_answers WHERE response_id=? AND question_id=?", (response_id, question['id'])).fetchone()
                
                if submitted_answer:
                    # Fetch the selected answer from the 'text' column
                    selected_answer = submitted_answer['text']
                    submitted_answer['selected_answer'] = selected_answer  # Add the 'selected_answer' property to the submitted answer
                
                submitted_answers.append(submitted_answer)

            # Construct the survey response object
            survey_response = {
                'response_id': response_id,
                'questions': questions,
                'submitted_answers': submitted_answers,
            }

            survey_responses.append(survey_response)

        # Close the database connection and return the survey responses as JSON
        conn.close()
        return jsonify(survey_responses), 200
    else:
        # Close the database connection and return an error if the survey is not found
        conn.close()
        return jsonify({"error": "Survey not found"}), 404

# Handle retrieving all submitted surveys via GET request
@app.route('/api/surveyresults', methods=['GET'])
def get_all_submitted_surveys():
    # Connect to the SQLite database
    conn = sqlite3.connect('./database/wp4.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()

    # Fetch all surveys from the surveys table
    surveys = cur.execute("SELECT * FROM surveys").fetchall()

    submitted_surveys = []
    for survey in surveys:
        survey_id = survey['id']
        responses = cur.execute("SELECT * FROM responses WHERE survey_id=?", (survey_id,)).fetchall()

        survey_responses = []
        for response in responses:
            response_id = response['id']
            questions = cur.execute("SELECT * FROM questions WHERE survey_id=?", (survey_id,)).fetchall()

            submitted_answers = []
            for question in questions:
                if question['type'] == 'open_question':
                    # Fetch the submitted answer for an open question
                    submitted_answer = cur.execute("SELECT * FROM open_answers WHERE response_id=? AND question_id=?", (response_id, question['id'])).fetchone()
                    if submitted_answer:
                        selected_answer = submitted_answer['text']
                        submitted_answer['selected_answer'] = selected_answer
                        submitted_answers.append(submitted_answer)
                else:
                    # Fetch the submitted answers for a closed question
                    submitted_answers_query = cur.execute("SELECT * FROM submitted_answers WHERE response_id=? AND question_id=?", (response_id, question['id'])).fetchall()
                    for submitted_answer in submitted_answers_query:
                        selected_answer = submitted_answer['text']
                        submitted_answer['selected_answer'] = selected_answer
                        submitted_answers.append(submitted_answer)

            # Construct the survey response object
            survey_response = {
                'response_id': response_id,
                'questions': questions,
                'selected_answers': submitted_answers,
            }

            survey_responses.append(survey_response)

        # Add the survey responses to the survey object
        survey['submitted_surveys'] = survey_responses
        submitted_surveys.append(survey)

    # Close the database connection and return the submitted surveys as JSON
    conn.close()
    return jsonify(submitted_surveys), 200

# Handles the login functionality
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    conn = sqlite3.connect('./database/wp4.db')
    cur = conn.cursor()
    cur.execute('SELECT role, username, email FROM users WHERE email = ? AND password = ?', (email, password))
    row = cur.fetchone()

    if row:
        role, username, email = row
        return jsonify({'role': role, 'username': username, 'email': email})
    else:
        return jsonify({'error': 'Incorrect email or password'}), 401

# user functionality
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = sqlite3.connect('./database/wp4.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute('SELECT id, username, email, role FROM users')
    rows = cur.fetchall()

    users = [dict(row) for row in rows]
    print(users)  # Add console log for debugging

    conn.close()
    return jsonify(users), 200

@app.route('/api/users/<int:id>', methods=['GET'])
def get_user(id):
    conn = sqlite3.connect('./database/wp4.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute('SELECT id, username, email, role FROM users WHERE id = ?', (id,))
    row = cur.fetchone()

    if row:
        user = dict(row)
        print(user)  # Add console log for debugging
        conn.close()
        return jsonify(user), 200
    else:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
@app.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.get_json()
    username = data['username']
    email = data['email']
    role = data['role']

    conn = sqlite3.connect('./database/wp4.db')
    cur = conn.cursor()

    cur.execute('UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?', (username, email, role, id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'User updated successfully'}), 200

@app.route('/api/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    conn = sqlite3.connect('./database/wp4.db')
    cur = conn.cursor()

    cur.execute('DELETE FROM users WHERE id = ?', (id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'User deleted successfully'}), 200

# send email to recipient
@app.route('/api/send-email', methods=['POST'])
def send_email():
    data = request.get_json()
    emails = data.get('emails')
    survey_link = data.get('surveyLink')

    if not emails or not isinstance(emails, list) or len(emails) == 0:
        return jsonify(message='Recipient emails are missing or invalid.'), 400

    # if you want to receive emails, use your email login information
    sender_email = 'email@hr.nl'  # email address
    password = ''  # password

    subject = 'Survey Link'
    message = f'Click the following link to access the survey: <a href="{survey_link}">Take Survey</a>'

    try:
        # Create the email message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = ', '.join(emails)
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'plain'))

        # Connect to the SMTP server
        with smtplib.SMTP('smtp-mail.outlook.com', 587) as server:
            server.starttls()
            server.login(sender_email, password)

            # Send the email
            server.send_message(msg)

        return jsonify(message='Email sent successfully.'), 200

    except Exception as e:
        print('Error sending email:', e)
        return jsonify(message='Failed to send email.'), 500
    
# view surveys that have been created for members
@app.route('/api/member-surveys/<email>', methods=['GET'])
def get_member_surveys(email):
    conn = sqlite3.connect('./database/wp4.db')
    conn.row_factory = dict_factory
    cur = conn.cursor()

    # left join fetch surveys for the given email
    cur.execute('SELECT s.id, s.title, s.description, s.created_at FROM surveys s LEFT JOIN users u ON s.email = u.email WHERE u.email = ? OR s.is_anonymous = 1', (email,))
    surveys = cur.fetchall()

    conn.close()

    return jsonify(surveys), 200

# Run the python application
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port='1234')
    # app.run()
