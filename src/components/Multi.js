import React from 'react';
import {
    Card,
    CardContent,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
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

const MultiChoiceAndSelect = ({ type, choices, answers }) => {

    // Count the answers
    const counts = choices.map(choice =>
        answers.filter(answer => answer === choice).length
    );

    // Chart data
    const barColor = type === 'radio' ? '#4BC0C0' : '#8F5C0C';
    const data = {
        labels: choices,
        datasets: [
            {
                label: 'Responses',
                data: counts,
                backgroundColor: `${barColor}80`,
                borderColor: `${barColor}FF`,
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
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return Number.isInteger(value) ? value : null; // Only display integer values
                    },
                    stepSize: 1, // Increment between ticks
                },
                beginAtZero: true // Optional: Starts y-axis at 0
            }
        },
    };

    return (
        <Card sx={{ maxWidth: 600, 
                    margin: '20px auto',
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.33)',
                    boxShadow: 'none',}}
        >
            <CardContent>
                <Bar data={data} options={options} />
            </CardContent>
        </Card>
    );
};

export default MultiChoiceAndSelect;