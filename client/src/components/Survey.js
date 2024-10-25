// src/components/SurveyForm.js
import React, { useState } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import Question from './Question/Question';
import { db } from '../firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import '../services/userService';
import { addSurveyToUser } from '../services/userService';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const SurveyForm = () => {
    const [questions, setQuestions] = useState([]);
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('text');
    const [options, setOptions] = useState([]); // State to store options
    const [newOption, setNewOption] = useState(''); // State for new option input


    const addOption = () => {
        if (newOption.trim()) {
            setOptions([...options, newOption.trim()]); // Add new option to the array
            setNewOption(''); // Reset the new option input
        }
    };

    const addQuestion = () => {
        if (questionText.trim()) {
            setQuestions([...questions, { text: questionText, type: questionType, options }]);
            setQuestionText('');
            setOptions([]); // Reset options input
        }
    };

    const handleSubmit = async () => {
        //uid


        // Call to a Firebase function to save the survey
        const survey = {
            title: document.getElementById('surveyTitle').value,
            questions,
        };

        document.getElementById('surveyTitle').value = '';
        // Add a new document with a generated id.

        const docRef = await addDoc(collection(db, 'surveys'), survey);
        // add doc to SurveyResults with same id
        await setDoc(doc(db, 'surveyResults', docRef.id), { surveyTitle: survey.title });

        // add a question document for each question in suveryResults
        questions.forEach(async (question, index) => {
            await setDoc(doc(db, 'surveyResults', docRef.id, 'questions', index.toString()), {
                questionType: question.type,
                options: question.options,
                responses: [],
            });
        });

        //add doc id to users surveys
        await addSurveyToUser(docRef.id);

        // Go back to the home page
        window.location.href = '/';
    };

    return (
        <div className="container mt-4">
            <h2>Create a Survey</h2>
            <Form>
                <Form.Group className='mt-3' controlId="surveyTitle">
                    <Form.Label>Survey Title</Form.Label>
                    <Form.Control type="text" placeholder="Enter survey title" />
                </Form.Group>


                <Form.Group className='mt-3' controlId="questionText">
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
                    <Form.Control as="select" onChange={(e) => {
                        setQuestionType(e.target.value);
                        setOptions([]); // Reset options when question type changes
                    }} value={questionType}>
                        <option value="text">Text</option>
                        <option value="radio">Radio</option>
                        <option value="checkbox">Checkbox</option>
                    </Form.Control>
                </Form.Group>

                {/* Options for Radio and Checkbox */}
                {(questionType === 'radio' || questionType === 'checkbox') && (
                    <Form.Group className='mt-3' controlId="radioOptions">
                        <Form.Label>Options</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter option"
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                        />
                        <Button className='mt-3' variant="primary" onClick={addOption}>
                            Add Option
                        </Button>
                        <ul className="mt-2">
                            {options.map((opt, index) => (
                                <li onClick={
                                    () => {
                                        const newOptions = [...options];
                                        newOptions.splice(index, 1);
                                        setOptions(newOptions);
                                    }
                                } key={index} style={{ textDecoration: 'none' }}>
                                    <span
                                        style={{
                                            textDecoration: 'none',
                                            transition: 'text-decoration 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.textDecoration = 'line-through';
                                            e.target.style.cursor = 'pointer';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.textDecoration = 'none';
                                            e.target.style.cursor = 'default';
                                        }}
                                    >
                                        {opt}
                                    </span>
                                </li>))}
                        </ul>
                    </Form.Group>
                )}
                <Button className='mt-3' variant="primary" onClick={addQuestion}>
                    Add Question
                </Button>
            </Form>

            <ListGroup className="mt-3">
                {questions.map((q, index) => (
                    <ListGroup.Item key={index}>
                        <Question question={q} />
                        <Button variant="danger" size="sm" className="mt-2"
                            onClick={() => {
                                const newQuestions = [...questions];
                                newQuestions.splice(index, 1);
                                setQuestions(newQuestions);
                            }
                            }
                        >
                            Remove Question
                        </Button>
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
