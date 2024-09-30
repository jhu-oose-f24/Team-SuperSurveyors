import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import Question from './Question';

const SurveyView = () => {
    const [surveys, setSurveys] = useState([]);

    useEffect(() => {
        const fetchSurveys = async () => {
            const querySnapshot = await getDocs(collection(db, "surveys"));
            const surveysData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSurveys(surveysData);
        };

        fetchSurveys();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this survey?')) {
            await deleteDoc(doc(db, 'surveys', id));
            setSurveys(surveys.filter(survey => survey.id !== id));
        }
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Your Surveys</h2>
            <Row className="g-4">
                {surveys.map(survey => (
                    <Col key={survey.id} md={6} lg={4}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title className="text-primary">{survey.title}</Card.Title>
                                <Card.Text>
                                    {survey.questions.map((question, index) => (
                                        <Question key={index} question={question} />
                                    ))}
                                </Card.Text>
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleDelete(survey.id)}
                                    className="mt-3 w-100"
                                >
                                    Delete Survey
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default SurveyView;


