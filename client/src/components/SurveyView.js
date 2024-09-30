import React, { useState, useEffect } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import DeleteConfirmationDialog from './deleteDialog';
import Question from './Question';

const SurveyView = () => {
  const [surveys, setSurveys] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      const querySnapshot = await getDocs(collection(db, 'surveys'));
      const surveysData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSurveys(surveysData);
    };

    fetchSurveys();
  }, []);

  const handleDeleteClick = (survey) => {
    setSurveyToDelete(survey);
    setShowDeleteModal(true);
  };

  const handleSurveyDelete = (deletedSurveyId) => {
    setSurveys(surveys.filter(survey => survey.id !== deletedSurveyId));
  };

  return (
    <div className="container mt-4">
      <h2>Your Surveys</h2>
      <ListGroup className="mt-3">
        {surveys.map((survey) => (
          <ListGroup.Item key={survey.id}>
            <h3>{survey.title}</h3>
            {survey.questions.map((question, index) => (
              <Question key={index} question={question} />
            ))}
            <Button variant="danger" onClick={() => handleDeleteClick(survey)}>
              Delete
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        survey={surveyToDelete}
        onSurveyDelete={handleSurveyDelete}
      />
    </div>
  );
};

export default SurveyView;
