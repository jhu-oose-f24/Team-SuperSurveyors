// src/components/SurveyForm.js
import React, { useState } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import Question from './Question';

const SurveyForm = () => {
    const [questions, setQuestions] = useState([]);
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('text');

    const addQuestion = () => {
        if (questionText.trim()) {
            setQuestions([...questions, { text: questionText, type: questionType }]);
            setQuestionText('');
        }
    };

    const handleSubmit = () => {
        // Handle survey submission to a database (e.g., Firebase)
        console.log('Survey Submitted:', questions);
    };

    return (
        <div className="container mt-4">
            <h2>Create a Survey</h2>
            <Form>
                <Form.Group className=' mt-3' controlId="questionText">
                    <Form.Label>Question</Form.Label>
                    <Form.Control
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Enter your question"
                    />
                </Form.Group>
                <Form.Group className='mt-3' controlId="questionType">
                    <Form.Label>Question Type</Form.Label>
                    <Form.Control as="select" onChange={(e) => setQuestionType(e.target.value)} value={questionType}>
                        <option value="text">Text</option>
                        <option value="radio">Radio</option>
                        <option value="checkbox">Checkbox</option>
                    </Form.Control>
                </Form.Group>
                <Button className='mt-3' variant="primary" onClick={addQuestion}>
                    Add Question
                </Button>
            </Form>

            <ListGroup className="mt-3">
                {questions.map((q, index) => (
                    <ListGroup.Item key={index}>
                        <Question question={q} />
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <Button variant="success" className="mt-3" onClick={handleSubmit}>
                Submit Survey
            </Button>
        </div>
    );
};

export default SurveyForm;
