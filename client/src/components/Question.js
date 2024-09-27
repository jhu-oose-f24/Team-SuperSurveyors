// src/components/Question.js
import React from 'react';
import { Form } from 'react-bootstrap';

const Question = ({ question }) => {
    return (
        <div className="mb-3">
            <p>{question.text}</p>
            {question.type === 'text' && (
                <Form.Control type="text" placeholder="Your answer" />
            )}
            {question.type === 'radio' && (
                <div>
                    <Form.Check
                        type="radio"
                        label="Option 1"
                        name={`question-${question.text}`}
                        id={`option1-${question.text}`}
                    />
                    <Form.Check
                        type="radio"
                        label="Option 2"
                        name={`question-${question.text}`}
                        id={`option2-${question.text}`}
                    />
                </div>
            )}
            {question.type === 'checkbox' && (
                <div>
                    <Form.Check type="checkbox" label="Option 1" />
                    <Form.Check type="checkbox" label="Option 2" />
                </div>
            )}
        </div>
    );
};

export default Question;
