// src/components/Question.js
import React from 'react';
import { Form } from 'react-bootstrap';

const Question = ({ question, onAnswerChange, value, disabled = false, showTitle = true }) => {
    const handleChange = (e) => {
        const value = question.type === 'checkbox'
            ? [...e.target.parentNode.querySelectorAll('input[type=checkbox]:checked')].map(input => input.value)
            : e.target.value;

        onAnswerChange(question.id, value);
    };

    return (
        <div className="mb-3">
            {showTitle && <Form.Label>{question.text}</Form.Label>}
            {question.type === 'text' && (
                <Form.Control
                    type="text"
                    placeholder="Your answer"
                    onChange={handleChange}
                    disabled={disabled}
                    value={value}
                />
            )}
            {question.type === 'radio' && (
                <div>
                    {question.options.map((option, index) => (
                        <Form.Check

                            key={index}
                            type="radio"
                            label={option}
                            name={`formHorizontalRadios-${question.id}`}
                            id={`formHorizontalRadios${index}`}
                            value={option}
                            onChange={handleChange}
                            disabled={disabled}
                            checked={value === option}
                        />
                    ))}
                </div>
            )}
            {question.type === 'checkbox' && (
                <div>
                    {question.options.map((option, index) => (
                        <Form.Check
                            key={index}
                            type="checkbox"
                            label={option}
                            name={`formHorizontalCheck-${question.id}`}
                            id={`formHorizontalCheck${index}`}
                            value={option}
                            onChange={handleChange}
                            disabled={disabled}
                            checked={Array.isArray(value) && value.includes(option)}

                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Question;