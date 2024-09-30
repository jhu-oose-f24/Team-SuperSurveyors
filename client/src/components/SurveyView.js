import React, { useState, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

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

  return (
    <div className="container mt-4">
      <h2>Your surveys</h2>
      <br />
      <ListGroup className="mt-3">
        {surveys.map((survey, surveyIdx) => (
          <ListGroup.Item key={survey.id} className="survey">
            <h3 key={'svy' + surveyIdx}>{survey.title}</h3>
            <ol>
              {survey.questions.map((question, questionIdx) => (
                <>
                  <li key={'qtn' + questionIdx}>{question.type} - {question.text}</li>
                  <ol>
                    {question.options.map((option, optionIdx) => (
                      <li key={'opt' + optionIdx}>{option}</li>
                    ))}
                  </ol>
                </>
              ))}
            </ol>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default SurveyView;
