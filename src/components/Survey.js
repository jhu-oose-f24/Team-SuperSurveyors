import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
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
        if (!selectedTags.includes(value)) {
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
        <div className="container mt-4">
            <h2>Create a Survey</h2>
            <Form>
                <Form.Group controlId="surveyTitle" className="mt-3">
                    <Form.Label>Survey Title</Form.Label>
                    <Form.Control type="text" placeholder="Enter survey title" />
                </Form.Group>

                <Form.Group controlId="questionText" className="mt-3">
                    <Form.Label>Question</Form.Label>
                    <Form.Control
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Enter your question"
                    />
                </Form.Group>

                <Form.Group controlId="questionType" className="mt-3">
                    <Form.Label>Question Type</Form.Label>
                    <Form.Control
                        as="select"
                        value={questionType}
                        onChange={(e) => {
                            setQuestionType(e.target.value);
                            setOptions([]);
                        }}
                    >
                        <option value="text">Text</option>
                        <option value="radio">Radio</option>
                        <option value="checkbox">Checkbox</option>
                    </Form.Control>
                </Form.Group>

                {(questionType === 'radio' || questionType === 'checkbox') && (
                    <Form.Group controlId="options" className="mt-3">
                        <Form.Label>Options</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter option"
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                        />
                        <Button className="mt-3" onClick={addOption}>
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

                <Form.Group controlId="tags" className="mt-3">
                    <Form.Label>Select Tags</Form.Label>
                    <Form.Control as="select" onChange={handleTagSelection}>
                        <option value="">-- Select a Tag --</option>
                        {tags.map((tag) => (
                            <option key={tag} value={tag}>
                                {tag}
                            </option>
                        ))}
                    </Form.Control>
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

                <Button className="mt-3" onClick={addQuestion}>
                    Add Question
                </Button>

                <ListGroup className="mt-3">
                    {questions.map((q, index) => (
                        <ListGroup.Item key={index}>
                            <Question question={q} onAnswerChange={() => { }} disabled={true} />
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

                <Button variant="success" className="mt-3" onClick={handleSubmit}>
                    Submit Survey
                </Button>
            </Form>
        </div>
    );
};

export default SurveyForm;
