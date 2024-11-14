import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, runTransaction, setDoc, deleteDoc, collection, query, where, getDocs, documentId, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Question from './Question/Question';
import { getRandomSurvey } from '../services/surveyService';
import { getAuth } from 'firebase/auth';
import { PriorityQueue } from '@datastructures-js/priority-queue';
import {
    Container,
    Typography,
    Box,
    Button,
    Alert,
    Snackbar,
    Paper,
    Stack,
    Fade,
    CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Survey = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [surveyTitle, setSurveyTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [surveyId, setSurveyId] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [failureTxt, setFailureTxt] = useState('');
    const [images, setImages] = useState([]); 
    const pqRef = useRef(new PriorityQueue((s1, s2) => (s1[0] > s2[0] ? 1 : s1[0] === s2[0] ? 0 : -1)));
    const navigate = useNavigate();

    const auth = getAuth();
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

            let surveyInfo = userOwnedSurveys.length > 0 ? 
                query(collection(db, 'surveys'), where(documentId(), 'not-in', userOwnedSurveys)) : 
                query(collection(db, 'surveys'));

            const allSurveysSnapshot = await getDocs(surveyInfo);

            allSurveysSnapshot.forEach((child) => {
                if (userAnsweredSurveys.has(child.id)) {
                    return;
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
            const incompleteSurvey = await fetchIncompleteSurvey();

            if (incompleteSurvey) {
                const docRef = doc(db, 'surveys', incompleteSurvey.surveyId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    surveyData = { id: docSnap.id, ...docSnap.data() };
                    setAnswers(incompleteSurvey.answers);
                } else {
                    console.error('Survey not found');
                    if (pq.isEmpty()) {
                        setAnswers({});
                        surveyData = await getRandomSurvey();
                    } else {
                        setAnswers({});
                        surveyData = pq.dequeue()[1];
                    }
                }
            } else {
                if (pq.isEmpty()) {
                    setAnswers({});
                    surveyData = await getRandomSurvey();
                } else {
                    setAnswers({});
                    surveyData = pq.dequeue()[1];
                }
            }
        } else {
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
        setImages(surveyData.images || []); 

        setQuestions(
            surveyData.questions.map((question, index) => ({
                ...question,
                id: index.toString(),
            }))
        );

        setLoading(false);
    };

    const handleAnswerChange = (questionId, value) => {
        if (Array.isArray(value)) {
            value = value.map((val) => val);
        }

        setAnswers((prevAnswers) => {
            const newAnswers = {
                ...prevAnswers,
                [questionId]: value,
            };

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

        const answeredQuestions = Object.values(answers);
        if (answeredQuestions.length < questions.length) {
            setFailureTxt('Please complete all questions before submitting');
            setShowFailure(true);
            return;
        }

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
                            currentResponses = questionDoc.data().responses || [];
                        }

                        let newResponses;
                        if (Array.isArray(answer)) {
                            newResponses = currentResponses.concat(answer);
                        } else {
                            newResponses = currentResponses.concat([answer]);
                        }

                        transaction.update(questionRef, {
                            responses: newResponses,
                        });
                    });
                }
            );

            await Promise.all(promises);
            await completeSurvey(getUserId, surveyId);
            setSubmissionSuccess(true);
        } catch (error) {
            console.error('Error submitting responses:', error);
            setFailureTxt('There was an error submitting your responses');
            setShowFailure(true);
        }
    };

    useEffect(() => {
        fetchSurveyBasedOnTag().then(() => {
            fetchSurveys();
        });
    }, []);

    if (loading) {
        return (
            <Container sx={{ 
                height: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
            }}>
                <CircularProgress size={60} thickness={4} />
            </Container>
        );
    }

    if (submissionSuccess) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'grey.200',
                        borderRadius: 2
                    }}
                >
                    <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                        Your response has been submitted successfully!
                    </Typography>
                    <Stack spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={fetchSurveys}
                            sx={{
                                py: 1.5,
                                bgcolor: 'grey.900',
                                '&:hover': { bgcolor: 'grey.800' }
                            }}
                        >
                            Answer a new survey
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/view')}
                            sx={{ py: 1.5 }}
                        >
                            Go back to your surveys
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                        completeSurvey(getUserId, surveyId);
                        fetchSurveys(true);
                    }}
                    fullWidth
                    sx={{ 
                        py: 1.5,
                        mb: 4,
                        borderRadius: 2
                    }}
                >
                    Not interested? Answer a different survey
                </Button>
            </Box>

            <Paper 
                elevation={0}
                component="form"
                onSubmit={handleSubmit}
                sx={{ 
                    p: 4,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2
                }}
            >
                <Typography 
                    variant="h4" 
                    align="center" 
                    gutterBottom 
                    sx={{ 
                        mb: 4,
                        fontWeight: 700,
                        color: 'grey.900'
                    }}
                >
                    {surveyTitle}
                </Typography>

                  {/* Image Gallery */}
                  {images.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Image Gallery
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {images.map((url, index) => (
                                <img 
                                    key={index} 
                                    src={url} 
                                    alt={`Survey Image ${index}`} 
                                    style={{ width: '200px', height: 'auto', margin: '10px' }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                <Stack spacing={4}>
                    {questions.map((question) => (
                        <Question
                            key={question.id}
                            question={question}
                            onAnswerChange={handleAnswerChange}
                            value={answers[question.id] || ''}
                        />
                    ))}

                    <Button
                        type="submit"
                        variant="contained"
                        endIcon={<SendIcon />}
                        sx={{
                            py: 2,
                            mt: 2,
                            bgcolor: 'grey.900',
                            '&:hover': { bgcolor: 'grey.800' }
                        }}
                    >
                        Submit Answers
                    </Button>
                </Stack>
            </Paper>

            <Snackbar
                open={showFailure}
                autoHideDuration={4000}
                onClose={() => setShowFailure(false)}
                TransitionComponent={Fade}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    severity="error" 
                    variant="filled"
                    onClose={() => setShowFailure(false)}
                    sx={{ width: '100%' }}
                >
                    {failureTxt}
                </Alert>
            </Snackbar>
        </Container>
    );
};

async function completeSurvey(getUserId, surveyId) {
    const userId = getUserId();
    await deleteDoc(doc(db, 'incompleteAnswers', `${surveyId}_${userId}`));

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

export default Survey;