import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, getDoc, where, documentId } from 'firebase/firestore';
import { db } from '../firebase';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { getAuth } from 'firebase/auth';

const TrendingView = () => {
    const [trendingSurveys, setTrendingSurveys] = useState([]);
    const [loading, setLoading] = useState(true);

    // TODO: Shouldn't need this, move stuff over to surveyService
    const auth = getAuth();

    useEffect(() => {
        const fetchTrendingSurveys = async () => {
            try {

                // Get current user's surveys to exclude them
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const userDoc = await getDoc(userRef);
                let userSurveys = userDoc.data()?.surveys || [];
                
                let resultsQ;
                if (userSurveys.length) {
                    resultsQ = query(collection(db, 'surveyResults'), where(documentId(), 'not-in', userSurveys));
                } else {
                    resultsQ = query(collection(db, 'surveyResults'));
                }
                
                const querySnapshot = await getDocs(resultsQ);
                
                const surveys = [];
                for (const docSnapshot of querySnapshot.docs) {
                    const surveyData = docSnapshot.data();

                    const curSurveyRef = doc(db, 'surveyResults', docSnapshot.id, 'questions');
                    const curSurveySnapshot = await getDocs(curSurveyRef);
                    const curSurveyData = curSurveySnapshot.docs.map(doc => doc.data());

                    // Calculate total responses for each question
                    const totalResponses = curSurveyData.reduce((acc, question) => {
                        return acc + (question.responses ? question.responses.length : 0);
                    }, 0);

                    if (totalResponses > 0) {
                        surveys.push({
                            id: docSnapshot.id,
                            title: surveyData.title,
                            // questions: questions,
                            totalResponses: totalResponses
                        });
                    }
                }

                // Sort surveys by total responses
                surveys.sort((a, b) => b.totalResponses - a.totalResponses);
                setTrendingSurveys(surveys);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching trending surveys:', error);
                setLoading(false);
            }
        };

        fetchTrendingSurveys();
    }, [auth]);

    if (loading) {
        return <div className="text-center mt-5">Loading trending surveys...</div>;
    }

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Trending Surveys</h2>
            {trendingSurveys.map((survey) => (
                <Card key={survey.id} className="mb-4">
                    <Card.Header>
                        <h4>{survey.title}</h4>
                        <small>Total Responses: {survey.totalResponses}</small>
                    </Card.Header>
                    <Card.Body>
                        {survey.questions.map((question, index) => (
                            <div key={index} className="mb-4">
                                <h5>{question.text}</h5>
                                {question.responses && (
                                    <Row>
                                        {question.type === 'radio' || question.type === 'checkbox' ? (
                                            <Col>
                                                {question.options.map((option, optIndex) => {
                                                    const responseCount = question.responses.filter(r => 
                                                        Array.isArray(r) ? r.includes(option) : r === option
                                                    ).length;
                                                    const percentage = ((responseCount / question.responses.length) * 100).toFixed(1);
                                                    
                                                    return (
                                                        <div key={optIndex} className="mb-2">
                                                            <div>{option}: {percentage}% ({responseCount} responses)</div>
                                                            <div className="progress">
                                                                <div 
                                                                    className="progress-bar" 
                                                                    role="progressbar" 
                                                                    style={{width: `${percentage}%`}}
                                                                    aria-valuenow={percentage}
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </Col>
                                        ) : (
                                            <Col>
                                                <div className="text-muted">
                                                    {question.responses.length} text responses received
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                )}
                            </div>
                        ))}
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );
};

export default TrendingView;