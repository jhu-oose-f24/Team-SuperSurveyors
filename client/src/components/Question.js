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
