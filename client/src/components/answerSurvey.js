import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { doc, runTransaction, setDoc, deleteDoc, collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../firebase';
import Question from './Question';
import { getRandomSurvey } from '../services/surveyService';
import { getAuth } from 'firebase/auth';
import {
    PriorityQueue,
  } from '@datastructures-js/priority-queue';

const Survey = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [surveyTitle, setSurveyTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [surveyId, setSurveyId] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [failureTxt, setFailureTxt] = useState('');
    const pq = new PriorityQueue((s1, s2) => {
        if (s1[0] > s2[0]) {
            return 1;
        } else if (s1[0] === s2[0]) {
            return 0;
        }
        return -1;
    });
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
        try {
            const userId = getUserId();
            const userInfo = query(
                collection(db, 'users'),
                where(documentId(), '==', userId)
            );
            const userInfoSnapshot = await getDocs(userInfo);
            let userOwnedSurveys = [];
            let userTags = [];
            userInfoSnapshot.forEach((child) => {
                userOwnedSurveys = child.data().surveys;
                if (child.data().tags) {
                    userTags = child.data().tags;
                }
            });

            let surveyInfo;
            if (userOwnedSurveys.length) {
                surveyInfo = query(
                    collection(db, 'surveys'),
                    where(documentId(), 'not-in', userOwnedSurveys));
            } else {
                surveyInfo = query(collection(db, 'surveys'));
            }

            const allSurveysSnapshot = await getDocs(surveyInfo);
            allSurveysSnapshot.forEach((child) => {
                let survey = child.data();
                let commonTags = 0;
                //if survey is tagged, calculate its score
                if (survey.tags) {
                    for (let i = 0; i < survey.tags.length; i++) {
                        if (userTags.includes(survey.tags[i])) {
                            commonTags = commonTags + 1;
                        }
                    }
                }
                let score = commonTags;
                pq.enqueue((score, {
                    id : child.id,
                    ...survey
                }));
            })
            return pq;
        } catch (error) {
            console.error("Error fetching tagged survey recommendation: ", error);
        }
    };

const fetchSurveys = async (ignoreIncompleteSurvey = false) => {
    setQuestions([]);
    setLoading(true);
    setSubmissionSuccess(false);
    let surveyData;
    if (pq.isEmpty()) {
        console.log("recommended pq is empty!");
        setAnswers({});
        surveyData = await getRandomSurvey();
    } else {
        console.log("getting recommended survey!");
        setAnswers({});
        surveyData = pq.dequeue();
        console.log(surveyData);
    }

//     if (!ignoreIncompleteSurvey) {
//         //check if there are any unfinished questionnaires
//         const incompleteSurvey = await fetchIncompleteSurvey();

//         if (incompleteSurvey) {
//             // If there is an incomplete questionnaire, load it
//             const docRef = doc(db, 'surveys', incompleteSurvey.surveyId);
//             const docSnap = await getDoc(docRef);
//             if (docSnap.exists()) {
//                 surveyData = { id: docSnap.id, ...docSnap.data() };
//                 setAnswers(incompleteSurvey.answers);
//             } else {
//                 console.error('Survey not found');
//                 //If the questionnaire is not found, load the highest score questionaire
//                 if (pq.isEmpty()) {
//                     setAnswers({});
//                     surveyData = await getRandomSurvey();
//                 } else {
//                     console.log("recommended is empty!");
//                     surveyData = pq.dequeue()[1];
//                 }
//             }
//         } else {
//             // If there are no unfinished questionnaires, load highest score questionare
//             if (pq.isEmpty()) {
//                 setAnswers({});
//                 surveyData = await getRandomSurvey();
//             } else {
//                 console.log("recommended is empty!");
//                 surveyData = pq.dequeue()[1];
//             }
//         }
//     } else {
// // If user ignore unfinished questionnaires, load random questionnaires directly
//         setAnswers({});
//         surveyData = await getRandomSurvey();
//     }

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
                }
            );

            await Promise.all(promises);

            // deleted complete answer from incomplete database
            const userId = getUserId();
            await deleteDoc(doc(db, 'incompleteAnswers', `${surveyId}_${userId}`));

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
        return <div className="d-flex flex-column align-items-center mt-5">Loading up a survey...</div>;
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
            <Button variant="secondary" type="submit" className="d-block mx-auto" onClick={() => fetchSurveys(true)}>
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