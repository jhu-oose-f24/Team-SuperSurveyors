// src/components/SurveyView.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col, Badge, Modal } from 'react-bootstrap';
import Question from './Question';
import DeleteConfirmationDialog from './DeleteDialog.js';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/userService.js';
import { getUserSurveys } from '../services/surveyService.js';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export const getSurveyResponses = async (surveyId) => {
  const responsesRef = collection(db, 'surveyResults', surveyId, 'questions');
  const querySnapshot = await getDocs(responsesRef);

  const responses = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    responses.push(...data.responses);
  });

  return responses;
};

const SurveyView = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveys = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      let surveysData = await getUserSurveys();
      console.log('Fetched Surveys:', surveysData);
      setSurveys(surveysData);
      setLoading(false);
    };

    fetchSurveys();
  }, [navigate]);

  const openDeleteDialog = (survey) => {
    setSelectedSurvey(survey);
    setShowDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDialog(false);
    setSelectedSurvey(null);
  };

  const handleSurveyDelete = (surveyId) => {
    setSurveys(surveys.filter((survey) => survey.id !== surveyId));
  };

  const openAnswerDialog = async (survey) => {
    setSelectedSurvey(survey);
    let fetchedResponses = await getSurveyResponses(survey.id);
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
                    <Card.Title className="text-primary mb-2">{survey.title}</Card.Title>
                    {survey.tags && survey.tags.length > 0 ? (
                      <div className="mb-3">
                        {survey.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary" // Change to 'bg' if using React-Bootstrap v5+
                            className="me-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-3">No tags available.</div>
                    )}
                    <Card.Body>
                      {survey.questions.map((question, index) => (
                        <Question key={index} question={question} onAnswerChange={() => {}} />
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

      <DeleteConfirmationDialog
        show={showDialog}
        onHide={closeDeleteDialog}
        survey={selectedSurvey}
        onSurveyDelete={handleSurveyDelete}
      />

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
