// src/components/Question.js
import React from 'react';
import { Form } from 'react-bootstrap';

const Question = ({ question, index, onAnswerChange, readOnly }) => {
    //Displays saved answers:
    if (readOnly) {
        return (
            <div className="mb-3">
                <p>{question.text}</p>
                <p>Your answer: {Array.isArray(question.answer) ? question.answer.join(', ') : question.answer}</p>
            </div>
        );
    }

    return (
        <div className="mb-3">
            <p>{question.text}</p>
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
                    {question.options.map((option, optIndex) => (
                        <Form.Check
                            key={optIndex}
                            type="radio"
                            label={option}
                            name={`radioGroup${index}`}
                            id={`radio${index}_${optIndex}`}
                            checked={question.answer === option}
                            onChange={() => onAnswerChange(index, option)}
                        />
                    ))}
                </div>
            )}
            {question.type === 'checkbox' && (
                <div>
                    {question.options.map((option, optIndex) => (
                        <Form.Check
                            key={optIndex}
                            type="checkbox"
                            label={option}
                            name={`checkboxGroup${index}`}
                            id={`checkbox${index}_${optIndex}`}
                            checked={Array.isArray(question.answer) && question.answer.includes(option)}
                            onChange={(e) => {
                                const newAnswer = Array.isArray(question.answer) ? [...question.answer] : [];
                                if (e.target.checked) {
                                    newAnswer.push(option);
                                } else {
                                    const idx = newAnswer.indexOf(option);
                                    if (idx > -1) newAnswer.splice(idx, 1);
                                }
                                onAnswerChange(index, newAnswer);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Question;
