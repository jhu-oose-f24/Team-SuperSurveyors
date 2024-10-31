import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSurveyResponses } from '../components/SurveyView';

import { Pie } from 'react-chartjs-2';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const SurveyResults = () => {
    const { surveyId } = useParams();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResponses = async () => {
            const fetchedResponses = await getSurveyResponses(surveyId);
            setResponses(fetchedResponses);
            setLoading(false);
        };

        fetchResponses();
    }, [surveyId]);

    // Prepare data for Pie chart
    const responseCounts = responses.reduce((counts, response) => {
        counts[response] = (counts[response] || 0) + 1;
        return counts;
    }, {});

    const chartData = {
        labels: Object.keys(responseCounts),
        datasets: [
            {
                label: 'Response Distribution',
                data: Object.values(responseCounts),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ],
            },
        ],
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col>
                    <h2 className="text-center mb-4">Survey Results</h2>
                    {loading ? (
                        <div className="text-center">Loading responses...</div>
                    ) : (
                        <>
                            <div style={{ width: '70%', margin: '0 auto' }}>
                                <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                            </div>
                            <div className="mt-4">
                                <h5>Response Details:</h5>
                                <ul>
                                    {Object.entries(responseCounts).map(([response, count]) => (
                                        <li key={response}>
                                            {response}: {count} responses
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-4">
                                <h5>Individual Responses:</h5>
                                <ul>
                                    {responses.map((response, index) => (
                                        <li key={index}>{response}</li>
                                    ))}
                                </ul>
                            </div>

                        </>
                    )}
                    <Button variant="primary" className="mt-4" onClick={() => navigate(-1)}>
                        Back to Surveys
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default SurveyResults;
