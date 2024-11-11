import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, Toast } from 'react-bootstrap';
import Question from './Question/Question';
import { db } from '../firebase';
import { collection, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';
import { addSurveyToUser } from '../services/userService';

const SurveyForm = () => {
    const [questions, setQuestions] = useState([]);
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('text');
    const [options, setOptions] = useState([]);
    const [newOption, setNewOption] = useState('');
    const [tags, setTags] = useState([]); // Available tags fetched from Firestore
    const [selectedTags, setSelectedTags] = useState([]); // Selected tags

    // For toasts
    const [showSurveyFailure, setShowSurveyFailure] = useState(false);
    const [failureSurveyTxt, setFailureSurveyTxt] = useState('');
    const [showQuestionFailure, setShowQuestionFailure] = useState(false);
    const [failureQuestionTxt, setFailureQuestionTxt] = useState('');

    // Fetch tags from Firestore
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tagsCollection = collection(db, 'tags');
                const tagsSnapshot = await getDocs(tagsCollection);
                const tagsList = tagsSnapshot.docs.map(doc => doc.id);
                setTags(tagsList);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

    const handleTagSelection = (event) => {
        const value = event.target.value;
        if (value !== "placeholder" && !selectedTags.includes(value)) {
            setSelectedTags([...selectedTags, value]); // Add selected tag to the list
        }
    };

    const addOption = () => {
        if (newOption.trim()) {
            setOptions([...options, newOption.trim()]);
            setNewOption('');
        }
    };

    const addQuestion = () => {

        if (questionText.trim().length < 5) {
            setFailureQuestionTxt('Please include a descriptive question (at least 5 characters)');
            setShowQuestionFailure(true);
            return;
        } else if ((questionType === 'radio' || questionType === 'checkbox') && !options.length) {
            setFailureQuestionTxt('Please include at least one option for this question');
            setShowQuestionFailure(true);
            return;
        }

        if (questionText.trim()) {
            setQuestions([...questions, { text: questionText, type: questionType, options }]);
            setQuestionText('');
            setOptions([]);
        }
    };

    const handleSubmit = async () => {
        const survey = {
            title: document.getElementById('surveyTitle').value,
            questions,
            tags: selectedTags, // Save selected tags
        };

        // Verify survey before sending to Firestore
        if (survey.title.length < 5) {
            setFailureSurveyTxt('Please include a descriptive title for your survey (at least 5 characters)');
            setShowSurveyFailure(true);
            return;
        } else if (!questions.length) {
            setFailureSurveyTxt('Please include at least 1 question in your survey');
            setShowSurveyFailure(true);
            return;
        } else if (questionText.length || options.length) {
            setFailureSurveyTxt('Please add your unfinished question to your survey or clear out the inputs');
            setShowSurveyFailure(true);
            return;
        }

        const docRef = await addDoc(collection(db, 'surveys'), survey);
        await setDoc(doc(db, 'surveyResults', docRef.id), { surveyTitle: survey.title });

        questions.forEach(async (question, index) => {
            await setDoc(doc(db, 'surveyResults', docRef.id, 'questions', index.toString()), {
                questionType: question.type,
                options: question.options,
                responses: [],
            });
        });

        await addSurveyToUser(docRef.id);
        window.location.href = '/';
    };

    return (
        <div className="container my-4">
            <h2>Create a Survey</h2>
            <Form>
                <Form.Group controlId="surveyTitle" className="mt-3">
                    <Form.Label>Survey Title</Form.Label>
                    <Form.Control type="text" placeholder="Enter survey title" size='lg' className='w-50'/>
                </Form.Group>

                <Form.Group controlId="questionText" className="mt-3">
                    <Form.Label>Question</Form.Label>
                    <Form.Control
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Enter your question"
                        className='w-50'
                    />
                </Form.Group>

                <Form.Group controlId="questionType" className="mt-3">
                    <Form.Label>Question Type</Form.Label>
                    <Form.Select
                        value={questionType}
                        className='w-auto'
                        onChange={(e) => {
                            setQuestionType(e.target.value);
                            setOptions([]);
                        }}
                    >
                        <option value="text">Text</option>
                        <option value="radio">Radio</option>
                        <option value="checkbox">Checkbox</option>
                    </Form.Select>
                </Form.Group>

                {(questionType === 'radio' || questionType === 'checkbox') && (
                    <Form.Group controlId="options" className="mt-3">
                        <Form.Label>Options</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter option"
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            className='w-50'
                        />
                        <Button className="mt-3" onClick={addOption} disabled={!newOption.length} >
                            Add Option
                        </Button>
                        <ul className="mt-2">
                            {options.map((opt, index) => (
                                <li key={index}>
                                    {opt}{' '}
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            const newOptions = [...options];
                                            newOptions.splice(index, 1);
                                            setOptions(newOptions);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </Form.Group>
                )}

                <Button className="mt-3" onClick={addQuestion}>
                    Add Question to Survey
                </Button>

                <br />
                <Toast bg='danger' className="my-2" show={showQuestionFailure} onClose={() => setShowQuestionFailure(false)} delay={2000} autohide>
                    <Toast.Body className='text-white'>{failureQuestionTxt}</Toast.Body>
                </Toast>

                <ListGroup className="mt-3">
                    {!questions.length ? (
                        <ListGroup.Item className='text-black-50'>
                            Press the button above to include your question in this survey
                        </ListGroup.Item>
                    ) : ''}
                    {questions.map((q, index) => (
                        <ListGroup.Item key={index}>
                            <Question question={q} disabled={true} onAnswerChange={() => {}} />
                            <Button
                                variant="danger"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                    const newQuestions = [...questions];
                                    newQuestions.splice(index, 1);
                                    setQuestions(newQuestions);
                                }}
                            >
                                Remove Question
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <Form.Group controlId="tags" className="mt-3">
                    <Form.Label>Select tags that best describe your survey:</Form.Label>
                    <Form.Select className="w-auto" onChange={handleTagSelection}>
                        <option value="placeholder">-- Select a tag --</option>
                        {tags.map((tag) => (
                            <option key={tag} value={tag}>
                                {tag}
                            </option>
                        ))}
                    </Form.Select>
                    <ul className="mt-2">
                        {selectedTags.map((tag, index) => (
                            <li key={index}>
                                {tag}{' '}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        const newTags = selectedTags.filter(t => t !== tag);
                                        setSelectedTags(newTags);
                                    }}
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                </Form.Group>

                <Button variant="success" className="mt-3" onClick={handleSubmit}>
                    Publish Survey
                </Button>
            </Form>

            <br />
            <Toast bg='danger' show={showSurveyFailure} onClose={() => setShowSurveyFailure(false)} delay={3000} autohide>
                <Toast.Body className='text-white'>{failureSurveyTxt}</Toast.Body>
            </Toast>
        </div>
    );
};

export default SurveyForm;
