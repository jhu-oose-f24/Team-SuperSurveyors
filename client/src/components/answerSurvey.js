// src/components/Survey.js
import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import Question from './Question';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';


const Survey = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);


    //get first survey from db
    const fetchSurveys = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "surveys"));
            const surveysData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setQuestions(surveysData[0].questions);
        } catch (error) {
            console.error("Error fetching surveys:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurveys();
    }
        , []);

    // State to store user's answers

    const [answers, setAnswers] = useState({});

    // Update answer when the user types or selects an option
    const handleAnswerChange = (questionId, value) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        // console.log("User's Answers: ", answers);
        // You can send the answers to a backend or process further here
    };

    return (
        <Form onSubmit={handleSubmit}>
            {questions.map((question) => (
                <Question
                    key={question.id}
                    question={question}
                    onAnswerChange={handleAnswerChange}
                />
            ))}
            <Button variant="primary" type="submit">
                Submit Answers
            </Button>
        </Form>
    );
};

export default Survey;
