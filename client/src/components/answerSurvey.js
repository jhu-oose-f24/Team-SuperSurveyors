import React, { useState, useEffect } from 'react';
import { Form, Button, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import Question from './Question';
import { getRandomSurvey } from '../services/surveyService';

const Survey = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [surveyTitle, setSurveyTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [surveyId, setSurveyId] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [failureTxt, setFailureTxt] = useState('');

    // Use navigate to redirect
    const navigate = useNavigate();

    const fetchSurveys = async () => {
        setQuestions([]);
        setLoading(true);
        setSubmissionSuccess(false);

        let randomSurvey = await getRandomSurvey();
        
        setSurveyId(randomSurvey.id);
        setSurveyTitle(randomSurvey.title);

        // Assign IDs to questions based on their index
        setQuestions(
            randomSurvey.questions.map((question, index) => ({
                ...question,
                id: index.toString(),
            }))
        );

        setLoading(false);
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Check all answers before starting the transaction
        const answeredQuestions = Object.values(answers);
        console.log(questions);
        console.log(answeredQuestions);
        if (answeredQuestions.length < questions.length) {
            setFailureTxt('Please complete all questions before submitting');
            setShowFailure(true);
            return;
        }

        // TODO: Minimum answer length?
        const minAnswerLength = 3;
        for (let i = 0; i < questions.length; i++) {
            if (questions[i].type === 'text' && answeredQuestions[i].length < minAnswerLength) {
                setFailureTxt(`Please answer question ${i + 1} with at least ${minAnswerLength} characters`);
                setShowFailure(true);
                return;
            }
        }
        
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
                    setSubmissionSuccess(true);
                }
            );

            await Promise.all(promises);

        } catch (error) {
            console.error('Error submitting responses:', error);
            alert('There was an error submitting your responses');
        }
    };

    useEffect(() => {
        fetchSurveys();
    }, []);

    if (loading) {
        return <div className="d-flex flex-column align-items-center mt-5">Loading up surveys</div>;
    } else if (submissionSuccess) {
        return (
            <div className="d-flex flex-column align-items-center mt-5"> 
                <div>Your response has been submitted.</div>
                <br />
                <div>
                    <Button variant="primary" type="submit" className="d-block mx-auto" onClick={fetchSurveys}>
                        Answer a new survey
                    </Button>  
                    <br />
                    <Button variant="secondary" type="submit" className="d-block mx-auto" onClick={() => navigate('/view')}>
                        Go back to your surveys
                    </Button>  
                </div>  
            </div>
        )
    }  

    return (
        <div className="d-flex flex-column align-items-center mt-5"> 
            <div>
                <Button variant="secondary" type="submit" className="d-block mx-auto" onClick={fetchSurveys}>
                    Not interested? Answer a different survey
                </Button>  
            </div>  
            <br />
            <div className="w-100" style={{ maxWidth: '600px' }}>
                <Form onSubmit={handleSubmit}>
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
            <br />
            <Toast bg='danger' show={showFailure} onClose={() => setShowFailure(false)} delay={2000} autohide>
                <Toast.Body className='text-white'>{failureTxt}</Toast.Body>
            </Toast>
        </div>
    );
};

export default Survey;