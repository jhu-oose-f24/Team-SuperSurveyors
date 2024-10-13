import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Question from './Question';
import DeleteConfirmationDialog from './deleteDialog.js'; // Import the DeleteDialog component

const SurveyView = () => {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState(null); // Holds the survey selected for deletion

    // Fetch surveys from Firestore
    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "surveys"));
                const surveysData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSurveys(surveysData);
            } catch (error) {
                console.error("Error fetching surveys:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSurveys();
    }, []);

    // Open the delete confirmation dialog
    const openDeleteDialog = (survey) => {
        setSelectedSurvey(survey);
        setShowDialog(true);
    };

    // Close the delete confirmation dialog
    const closeDeleteDialog = () => {
        setShowDialog(false);
        setSelectedSurvey(null);
    };

    // Update the survey list after deletion
    const handleSurveyDelete = (surveyId) => {
        setSurveys(surveys.filter(survey => survey.id !== surveyId));
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Your Surveys</h2>
            {loading ? (
                <div className="text-center">Loading surveys...</div>
            ) : (
                <Row className="g-4">
                    {surveys.length === 0 ? (
                        <div className="text-center">No surveys available.</div>
                    ) : (
                        surveys.map((survey) => (
                            <Col key={survey.id} md={6} lg={4}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body>
                                        <Card.Title className="text-primary">{survey.title}</Card.Title>
                                        <Card.Text>
                                            {survey.questions.map((question, index) => (
                                                <Question key={index} question={question} readOnly={true} />
                                            ))}
                                        </Card.Text>
                                        <Button 
                                            variant="danger" 
                                            onClick={() => openDeleteDialog(survey)}
                                            className="mt-3 w-100"
                                        >
                                            Delete Survey
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            )}

            {/* DeleteConfirmationDialog Modal */}
            <DeleteConfirmationDialog 
                show={showDialog} 
                onHide={closeDeleteDialog} 
                survey={selectedSurvey} 
                onSurveyDelete={handleSurveyDelete} 
            />
        </Container>
    );
};

export default SurveyView;
