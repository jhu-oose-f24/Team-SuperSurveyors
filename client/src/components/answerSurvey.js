// src/components/Survey.js
import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import Question from './Question/Question';
import { db } from '../firebase';
import { collection, getDocs, doc, runTransaction, } from 'firebase/firestore';

const Survey = () => {
    const [questions, setQuestions] = useState([]);
    const [surveyTitle, setSurveyTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [surveyId, setSurveyId] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    const fetchSurveys = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'surveys'));
            const surveysData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            const survey = surveysData[0];
            setSurveyId(survey.id);
            setSurveyTitle(survey.title);

            // Assign IDs to questions based on their index
            setQuestions(
                survey.questions.map((question, index) => ({
                    ...question,
                    id: index.toString(),
                }))
            );
        } catch (error) {
            console.error('Error fetching surveys:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurveys();
    }, []);

    const [answers, setAnswers] = useState({});

    const handleAnswerChange = (questionId, value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const promises = Object.entries(answers).map(
                async ([questionId, answer]) => {
                    const questionRef = doc(
                        db,
                        'surveyResults',
                        surveyId,
                        'questions',
                        questionId
                    );

                    await runTransaction(db, async (transaction) => {
                        const questionDoc = await transaction.get(questionRef);
                        let currentResponses = [];
                        if (questionDoc.exists()) {
                            currentResponses =
                                questionDoc.data().responses || [];
                        }

                        let newResponses;
                        if (Array.isArray(answer)) {
                            // For checkbox inputs
                            newResponses = currentResponses.concat(answer);
                        } else {
                            // For text and radio inputs
                            newResponses = currentResponses.concat([answer]);
                        }

                        transaction.update(questionRef, {
                            responses: newResponses,
                        });
                    });
                }
            );

            await Promise.all(promises);

            setSubmissionSuccess(true);
        } catch (error) {
            console.error('Error submitting responses:', error);
            alert('There was an error submitting your responses');
        }
    };

    if (submissionSuccess) {
        return <div>Your response has been submitted.</div>;
    }

    return (
        <div className="d-flex justify-content-center mt-5">
            <Form
                onSubmit={handleSubmit}
                style={{ maxWidth: '600px', width: '100%' }}
            >
                <h2 className="text-center mb-4">{surveyTitle}</h2>
                {questions.map((question) => (
                    <Question
                        key={question.id}
                        question={question}
                        onAnswerChange={handleAnswerChange}
                    />
                ))}
                <Button variant="primary" type="submit" className="d-block mx-auto">
                    Submit Answers
                </Button>
            </Form>
        </div>
    );
};

export default Survey;