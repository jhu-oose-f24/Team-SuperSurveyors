import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  Fade,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, Typography } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const multiChoiceAndSelect = (question, choices, answers) => {
  // Count the answers
  const counts = choices.map(choice => 
    answers.filter(answer => answer === choice).length
  );

  // Chart data
  const data = {
    labels: choices,
    datasets: [
      {
        label: 'Responses',
        data: counts,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: question,
      },
    },
  };

  return (
    <Card sx={{ maxWidth: 600, margin: '20px auto' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {question}
        </Typography>
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  );
};

export default multiChoiceAndSelect;