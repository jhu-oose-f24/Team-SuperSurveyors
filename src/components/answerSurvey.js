import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Button, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { doc, runTransaction, setDoc, deleteDoc, collection, query, where, getDocs, documentId, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Question from './Question/Question';
import { getRandomSurvey } from '../services/surveyService';
import { getAuth } from 'firebase/auth';
import {
    PriorityQueue,
} from '@datastructures-js/priority-queue';
import { ClipLoader as Audio } from 'react-spinners';
import { Container } from 'react-bootstrap';

const Survey = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [surveyTitle, setSurveyTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [surveyId, setSurveyId] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [failureTxt, setFailureTxt] = useState('');
    const pqRef = useRef(new PriorityQueue((s1, s2) => (s1[0] > s2[0] ? 1 : s1[0] === s2[0] ? 0 : -1)));
    // Use navigate to redirect
    const navigate = useNavigate();

    const auth = getAuth();
    //Get user uid
    const getUserId = useCallback(() => {
        const user = auth.currentUser;
        if (user) {
            return user.uid;
        } else {
            throw new Error('User not logged in');
        }
    }, [auth.currentUser]);

    const fetchIncompleteSurvey = async () => {
        try {
            const userId = getUserId();
            const q = query(
                collection(db, 'incompleteAnswers'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // if the incompleteAnswers server is not empty, return the first doc
                const doc = querySnapshot.docs[0];
                return {
                    surveyId: doc.data().surveyId,
                    answers: doc.data().answers,
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching incomplete survey:', error);
            return null;
        }
    };

    const fetchSurveyBasedOnTag = async () => {
        //empty pq 
        pqRef.current.clear();

        try {
            const userId = getUserId();
            const userInfo = query(
                collection(db, 'users'),
                where(documentId(), '==', userId)
            );
            const userInfoSnapshot = await getDocs(userInfo);
            let userOwnedSurveys = [];
            let userTags = [];
            let userAnsweredSurveys = new Set();
            userInfoSnapshot.forEach((child) => {
                userOwnedSurveys = child.data().surveys;
                if (child.data().tags) {
                    userTags = child.data().tags;
                }
                if (child.data().answeredSurveys) {
                    userAnsweredSurveys = new Set(child.data().answeredSurveys);
                }
            });

            // not in user's owned surveys and answered surveys
            let surveyInfo = userOwnedSurveys.length > 0 ? query(collection(db, 'surveys'), where(documentId(), 'not-in', userOwnedSurveys)) : query(collection(db, 'surveys'));

            const allSurveysSnapshot = await getDocs(surveyInfo);
            //filter out the surveys that the user has already taken

            allSurveysSnapshot.forEach((child) => {
                if (userAnsweredSurveys.has(child.id)) {
                    return; //skip the survey that the user has already taken
                }

                let survey = child.data();
                let commonTags = 0;

                if (survey.tags) {
                    for (let i = 0; i < survey.tags.length; i++) {
                        if (userTags.includes(survey.tags[i])) {
                            commonTags += 1;
                        }
                    }
                }
                let score = commonTags;
                pqRef.current.enqueue([score, { id: child.id, ...survey }]);
            });
            return pqRef.current;
        } catch (error) {
            console.error('Error fetching tagged survey recommendation:', error);
        }
    };

    const fetchSurveys = async (ignoreIncompleteSurvey = false) => {
        const pq = pqRef.current;
        setQuestions([]);
        setLoading(true);
        setSubmissionSuccess(false);
        let surveyData;
        if (!ignoreIncompleteSurvey) {
            //check if there are any unfinished questionnaires
            const incompleteSurvey = await fetchIncompleteSurvey();

            if (incompleteSurvey) {
                // If there is an incomplete questionnaire, load it
                const docRef = doc(db, 'surveys', incompleteSurvey.surveyId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    surveyData = { id: docSnap.id, ...docSnap.data() };
                    setAnswers(incompleteSurvey.answers);
                } else {
                    console.error('Survey not found');
                    //If the questionnaire is not found, load the highest score questionaire
                    if (pq.isEmpty()) {
                        setAnswers({});
                        surveyData = await getRandomSurvey();
                    } else {
                        setAnswers({});
                        surveyData = pq.dequeue()[1];
                    }
                }
            } else {
                // If there are no unfinished questionnaires, load highest score questionare
                if (pq.isEmpty()) {
                    setAnswers({});
                    surveyData = await getRandomSurvey();
                } else {
                    setAnswers({});
                    surveyData = pq.dequeue()[1];
                }
            }
        } else {
            // If user ignore unfinished questionnaires, load random questionnaires directly
            if (pq.isEmpty()) {
                setAnswers({});
                surveyData = await getRandomSurvey();
            }
            else {
                setAnswers({});
                surveyData = pq.dequeue()[1];
            }
        }
        if (surveyData == null) {
            return;
        }

        setSurveyId(surveyData.id);
        setSurveyTitle(surveyData.title);

        // Assign IDs to questions based on their index
        setQuestions(
            surveyData.questions.map((question, index) => ({
                ...question,
                id: index.toString(),
            }))
        );

        setLoading(false);
    };

    const handleAnswerChange = (questionId, value) => {
        //change value to array if question type is checkbox 
        if (Array.isArray(value)) {
            value = value.map((val) => val); // Copy the array
        }





        setAnswers((prevAnswers) => {
            const newAnswers = {
                ...prevAnswers,
                [questionId]: value,
            };

            // Save the unfinished answer
            saveIncompleteAnswers(newAnswers);

            return newAnswers;
        });
    };

    const saveIncompleteAnswers = async (currentAnswers) => {
        try {
            const userId = getUserId();
            const docRef = doc(db, 'incompleteAnswers', `${surveyId}_${userId}`);
            await setDoc(docRef, {
                surveyId: surveyId,
                userId: userId,
                answers: currentAnswers,
                lastUpdated: new Date(),
            });
        } catch (error) {
            console.error('Error saving incomplete answers:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Check all answers before starting the transaction
        const answeredQuestions = Object.values(answers);
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
                }
            );

            await Promise.all(promises);

            // deleted complete answer from incomplete database
            await completeSurvey(getUserId, surveyId);

            setSubmissionSuccess(true);
        } catch (error) {
            console.error('Error submitting responses:', error);
            alert('There was an error submitting your responses');
        }
    };

    useEffect(() => {
        fetchSurveyBasedOnTag().then(() => {
            fetchSurveys();
        });
    }, []);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Audio color='#123abc' loading={loading} size={150} />
            </Container>
        );
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
                <Button variant="secondary" type="submit" className="d-block mx-auto" onClick={() => {
                    completeSurvey(getUserId, surveyId);


                    fetchSurveys(true)
                }}>
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
                            value={answers[question.id] || ''}
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

async function completeSurvey(getUserId, surveyId) {
    const userId = getUserId();
    await deleteDoc(doc(db, 'incompleteAnswers', `${surveyId}_${userId}`));

    // add survey id to user's answered survey list
    const userRef = doc(db, 'users', userId);
    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        let answeredSurveys = [];
        if (userDoc.exists()) {
            answeredSurveys = userDoc.data().answeredSurveys || [];
        }

        answeredSurveys.push(surveyId);

        transaction.update(userRef, {
            answeredSurveys: answeredSurveys,
        });
    });
}
