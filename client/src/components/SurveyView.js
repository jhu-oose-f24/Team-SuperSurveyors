import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import Question from './Question/Question';
import DeleteConfirmationDialog from './DeleteDialog.js'; // Import the DeleteDialog component
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/userService.js';
import { getUserSurveys } from '../services/surveyService.js';

import { Modal } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

import { FaEdit } from 'react-icons/fa';
import EditQuestionsDialog from './EditQuestionsDialog.js';

export const getSurveyResponses = async (surveyId) => {
    const responsesRef = collection(db, 'surveyResults', surveyId, 'questions');
    const querySnapshot = await getDocs(responsesRef);

    const responses = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        responses.push(...data.responses); // Assuming responses is an array in each question document
    });

    return responses;
};




const SurveyView = () => {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [showResponseModal, setShowResponseModal] = useState(false); // Added this state

    const [selectedSurvey, setSelectedSurvey] = useState(null); // Holds the survey selected for deletion
    const [responses, setResponses] = useState([]); // Holds responses
    // const location = useLocation();
    // const state = location.state;
    // console.log(state)

    const [showEditDialog, setShowEditDialog] = useState(false);


    // Use navigate to redirect
    const navigate = useNavigate();

    //uid is state.uid;

    // Fetch surveys from Firestore
    useEffect(() => {
        const fetchSurveys = async () => {

            // TODO: Fix
            if (!getCurrentUser()) navigate('/login');

            let surveysData = await getUserSurveys();
            setSurveys(surveysData);
            setLoading(false);
        };

        fetchSurveys();
    }, [navigate]);

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

    const handleEditClick = (survey) => {
        setSelectedSurvey(survey);
        setShowEditDialog(true);
    };

    const handleSaveChanges = async () => {
        //TODO: Save the updated survey to Firestore

        // Close the dialog
        setShowEditDialog(false);
    };

    // Update the survey list after deletion
    const handleSurveyDelete = (surveyId) => {
        setSurveys(surveys.filter(survey => survey.id !== surveyId));
    };

    const openAnswerDialog = async (survey) => {
        setSelectedSurvey(survey);
        // Fetch the responses for the selected survey
        let fetchedResponses = await getSurveyResponses(survey.id); // Assuming this is how you fetch responses
        setResponses(fetchedResponses);
        setShowResponseModal(true);
    };

    const closeResponseModal = () => {
        setShowResponseModal(false);
        setSelectedSurvey(null);
    };


    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Your Surveys</h2>
            {loading ? (
                <div className="text-center">Loading surveys...</div>
            ) : (
                <Row className="g-4">
                    {!surveys || surveys.length === 0 ? (
                        <div className="text-center">No surveys available.</div>
                    ) : (
                        surveys.map((survey) => (
                            <Col key={survey.id} md={6} lg={4}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <Card.Title className="text-primary mb-0">{survey.title}</Card.Title>
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => { handleEditClick(survey) }}
                                            >
                                                <FaEdit /> Edit
                                            </Button>
                                        </div>

                                        <Card.Body>
                                            {survey.questions.map((question, index) => (
                                                <Question key={index} question={question} disabled={true} onAnswerChange={() => { }} />
                                            ))}
                                        </Card.Body>

                                        <Button
                                            onClick={() => openAnswerDialog(survey)}
                                            className="mt-3 w-100"
                                        >
                                            View Results
                                        </Button>

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

            {/* EditQuestionsDialog Modal */}
            {selectedSurvey && (
                <EditQuestionsDialog
                    show={showEditDialog}
                    onHide={() => setShowEditDialog(false)}
                    survey={selectedSurvey}
                    onQuestionsChange={(updatedQuestions) => {
                        setSelectedSurvey({ ...selectedSurvey, questions: updatedQuestions });
                    }}
                    handleSaveChanges={handleSaveChanges}
                />
            )}

            {/* DeleteConfirmationDialog Modal */}
            <DeleteConfirmationDialog
                show={showDialog}
                onHide={closeDeleteDialog}
                survey={selectedSurvey}
                onSurveyDelete={handleSurveyDelete}
            />

            {/* Modal to display responses */}
            <Modal show={showResponseModal} onHide={closeResponseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Survey Responses</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {responses.length === 0 ? (
                        <p>No responses available.</p>
                    ) : (
                        <ul>
                            {responses.map((response, index) => (
                                <li key={index}>{response}</li>
                            ))}
                        </ul>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeResponseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default SurveyView;
