import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSurveyResponses } from '../components/SurveyView';

import { Pie,Bar } from 'react-chartjs-2';
import { Button, Container, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LinearScale,CategoryScale,BarElement } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend,LinearScale,CategoryScale,BarElement);

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

    // Bar Chart options
    const barChartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
        maintainAspectRatio: false,
    };
    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2 className="text-center mb-4">Survey Results</h2>
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading responses...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            {responses.length === 0 ? (
                                <Alert variant="info" className="text-center">
                                    No responses available for this survey.
                                </Alert>
                            ) : (
                                <>
                                    <Card className="mb-4">
                                        <Card.Body>
                                            <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                                                <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                                            </div>
                                        </Card.Body>
                                    </Card>
                                    <Card className="mb-4">
                                        <Card.Body>
                                            <div
                                                style={{
                                                    width:'100%',
                                                    height:'400px',
                                                }}
                                                >
                                                <Bar
                                                    data = {chartData} options = {barChartOptions}
                                                />
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Body>
                                            <h5 className="mb-3">Response Details:</h5>
                                            <ul className="list-unstyled">
                                                {Object.entries(responseCounts).map(([response, count]) => (
                                                    <li key={response} className="mb-2">
                                                        <strong>{response}:</strong> {count} responses
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card.Body>
                                    </Card>

                                    <Card className="mb-4">
                                        <Card.Body>
                                            <h5 className="mb-3">Individual Responses:</h5>
                                            <ul className="list-unstyled">
                                                {responses.map((response, index) => (
                                                    <li key={index} className="mb-2">
                                                        {response}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </>
                            )}
                        </>
                    )}
                    <div className="text-center mt-4">
                        <Button variant="primary" onClick={() => navigate(-1)}>
                            Back to Surveys
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default SurveyResults;

