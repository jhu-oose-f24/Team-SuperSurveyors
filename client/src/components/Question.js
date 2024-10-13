// src/components/Question.js
import React from 'react';
import { Form } from 'react-bootstrap';

const Question = ({ question, index, onAnswerChange, readOnly }) => {
    if (readOnly) {
        return (
            <div className="mb-3">
                <p>{question.text}</p>
                <p>Your answer: {question.answer}</p>
            </div>
        );
    }
    return (
        <div className="mb-3">
            {question.type === 'text' && (
                <Form.Control
                    type="text"
                    placeholder="Your answer"
                    value={question.answer || ''}
                    onChange={(e) => onAnswerChange(index, e.target.value)}
                />
            )}

            {question.type === 'radio' && (
                <div>
                    {question.options.map((option, index) =>
                        <Form.Check
                            key={index}
                            type="radio"
                            label={option}
                            name="formHorizontalRadios"
                            id={`formHorizontalRadios${index}`}
                        />
                    )
                    }
                </div>
            )}
            {question.type === 'checkbox' && (
                <div>
                    {question.options.map((option, index) =>
                        <Form.Check
                            key={index}
                            type="checkbox"
                            label={option}
                            name="formHorizontalCheck"
                            id={`formHorizontalCheck${index}`}
                        />
                    )
                    }
                </div>
            )}
        </div>
    );
};

export default Question;
