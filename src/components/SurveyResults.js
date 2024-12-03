import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Pie } from 'react-chartjs-2';
// import { Button, Container, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import {
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Box,
    ThemeProvider,
    CircularProgress,
    Grid2
  } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getSurveyInfo, getSurveyResponses } from '../services/surveyService';
import { theme } from './Survey';

ChartJS.register(ArcElement, Tooltip, Legend);

const SurveyResults = () => {
    const { surveyId } = useParams();

    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [surveyName, setSurveyName] = useState("");
    const [surveyQuestions, setSurveyQuestions] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchResponses = async () => {
            const fetchedResponses = await getSurveyResponses(surveyId);
            setResponses(fetchedResponses);
            setLoading(false);
        };

        const fetchSurveyQuestions = async () => {
            const fetchedSurveyData = await getSurveyInfo(surveyId);
            setSurveyName(fetchedSurveyData.title);
            setSurveyQuestions(fetchedSurveyData.questions);
        };

        fetchResponses();
        fetchSurveyQuestions();
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
        <ThemeProvider theme={theme}>
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{textAlign: 'center', 
                            mb: 4,
                            fontWeight: 700,
                            color: 'primary.main'
                        }}
                >
                    Results for {surveyName}
                </Typography>

                {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={40} thickness={4} />
                </Box>

                ) : (
                <Grid2 container spacing={3}>
                    {!surveyQuestions || !surveyQuestions.length ? (
                    <Grid2>
                        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            No questions available to show.
                        </Typography>
                    </Grid2>

                    ) : (
                    surveyQuestions.map((question, index) => (
                        <Grid2 key={index} size={12}>
                            <Card sx={{backgroundColor: 'transparent'}}>
                                <CardContent>
                                    <Box sx={{display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                mb: 2
                                            }}
                                    >
                                        <Typography variant="h6" 
                                                    sx={{fontWeight: 600,
                                                            flex: 1,
                                                            mr: 1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                        >
                                            Question {index + 1}: {question.text}
                                        </Typography>
                                    </Box>
                                    
                                    {question.type === 'text' && 
                                        responses[index].responses.map((response) => (
                                            <Box>
                                                <Typography variant="body">
                                                    {response}
                                                    
                                                </Typography>
                                            </Box>
                                        ))
                                    }
                                    
                                    {question.type === 'radio' && (
                                        <Typography>
                                            TODO: Radio
                                        </Typography>
                                    )}

                                    {question.type === 'checkbox' && (
                                        <Typography>
                                            TODO: Checkbox
                                        </Typography>
                                    )}
                                    
                                </CardContent>
                            </Card>
                        </Grid2>
                    ))
                    )}
                </Grid2>
                )}

                <Box textAlign='center'>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                        sx={{
                            my: 2,
                            py: 2,
                            background: 'linear-gradient(45deg, #2c2c2c 30%, #4f4f4f 90%)',
                            boxShadow: '0 3px 5px 2px rgba(44, 44, 44, .3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #4f4f4f 30%, #2c2c2c 90%)',
                            }
                        }}
                    >
                        Back to Surveys
                    </Button>
                </Box>
                
            </Container>
            
        </ThemeProvider>
        // <Container className="mt-5">
        //     <Row className="justify-content-center">
        //         <Col md={8}>
        //             <h2 className="text-center mb-4">Results for {surveyName}</h2>
        //             {loading ? (
        //                 <div className="text-center">
        //                     <Spinner animation="border" role="status">
        //                         <span className="visually-hidden">Loading responses...</span>
        //                     </Spinner>
        //                 </div>
        //             ) : (
        //                 <>
        //                     {responses.length === 0 ? (
        //                         <Alert variant="info" className="text-center">
        //                             No responses available for this survey.
        //                         </Alert>
        //                     ) : (
        //                         <>
        //                             <Card className="mb-4">
        //                                 <Card.Body>
        //                                     <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        //                                         <Pie data={chartData} options={{ maintainAspectRatio: false }} />
        //                                     </div>
        //                                 </Card.Body>
        //                             </Card>

        //                             <Card className="mb-4">
        //                                 <Card.Body>
        //                                     <h5 className="mb-3">Response Details:</h5>
        //                                     <ul className="list-unstyled">
        //                                         {Object.entries(responseCounts).map(([response, count]) => (
        //                                             <li key={response} className="mb-2">
        //                                                 <strong>{response}:</strong> {count} responses
        //                                             </li>
        //                                         ))}
        //                                     </ul>
        //                                 </Card.Body>
        //                             </Card>

        //                             <Card className="mb-4">
        //                                 <Card.Body>
        //                                     <h5 className="mb-3">Individual Responses:</h5>
        //                                     <ul className="list-unstyled">
        //                                         {responses.map((response, index) => (
        //                                             <li key={index} className="mb-2">
        //                                                 {response}
        //                                             </li>
        //                                         ))}
        //                                     </ul>
        //                                 </Card.Body>
        //                             </Card>
        //                         </>
        //                     )}
        //                 </>
        //             )}
        //             <div className="text-center mt-4">
        //                 <Button variant="primary" onClick={() => navigate(-1)}>
        //                     Back to Surveys
        //                 </Button>
        //             </div>
        //         </Col>
        //     </Row>
        // </Container>
    );
};

export default SurveyResults;

