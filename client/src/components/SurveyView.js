import React, { useState, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
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

    return (
        <div className="container mt-4">
            <h2>Your surveys</h2>
            <br />
            <ListGroup className="mt-3">

                {surveys.map(survey => (
                    <ListGroup.Item key={survey.id}>
                        <h3>{survey.title}</h3>
                        {survey.questions.map((question, index) => (
                            <Question key={index} question={question} />
                        ))}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <br />
        </div>
    );
};

export default SurveyView;
