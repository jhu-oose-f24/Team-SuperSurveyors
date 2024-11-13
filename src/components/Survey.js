import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Box,
  Chip,
  Stack,
  ThemeProvider,
  createTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SendIcon from '@mui/icons-material/Send';
import Question from './Question/Question';
import { db } from '../firebase';
import { collection, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';
import { addSurveyToUser } from '../services/userService';
import { checkCurrency, updateCurrency } from '../services/surveyService';
import { CurrencyYenTwoTone } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2c2c2c',
      light: '#4f4f4f',
    },
    secondary: {
      main: '#757575',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c2c2c',
      secondary: '#757575',
    },
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

const SurveyForm = () => {
    // Keep all existing state
    const [questions, setQuestions] = useState([]);
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('text');
    const [options, setOptions] = useState([]);
    const [newOption, setNewOption] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tagsCollection = collection(db, 'tags');
                const tagsSnapshot = await getDocs(tagsCollection);
                const tagsList = tagsSnapshot.docs.map(doc => doc.id);
                setTags(tagsList);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

    const handleTagSelection = (event) => {
        const value = event.target.value;
        if (!selectedTags.includes(value)) {
            setSelectedTags([...selectedTags, value]);
        }
    };

    const addOption = () => {
        if (newOption.trim()) {
            setOptions([...options, newOption.trim()]);
            setNewOption('');
        }
    };

    const addQuestion = () => {
        if (questionText.trim()) {
            setQuestions([...questions, { text: questionText, type: questionType, options }]);
            setQuestionText('');
            setOptions([]);
        }
    };

    const handleSubmit = async () => {
        const currencycheck = await checkCurrency();
        if (currencycheck == false) {
            alert("Not enough currency!");
            return;
        }
        const survey = {
            title: document.getElementById('surveyTitle').value,
            questions,
            tags: selectedTags,
        };

        const docRef = await addDoc(collection(db, 'surveys'), survey);
        await setDoc(doc(db, 'surveyResults', docRef.id), { surveyTitle: survey.title });

        questions.forEach(async (question, index) => {
            await setDoc(doc(db, 'surveyResults', docRef.id, 'questions', index.toString()), {
                questionType: question.type,
                options: question.options,
                responses: [],
            });
        });
        await addSurveyToUser(docRef.id);
        await updateCurrency(-2);
        window.location.href = '/';
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 700,
                        mb: 4,
                        color: 'primary.main',
                        textAlign: 'center'
                    }}
                >
                    Create a Survey
                </Typography>
                
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 4, 
                        mb: 4, 
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'grey.200'
                    }}
                >
                    <Stack spacing={4}>
                        <TextField
                            id="surveyTitle"
                            label="Survey Title"
                            variant="outlined"
                            fullWidth
                            placeholder="Enter survey title"
                        />

                        <TextField
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            label="Question"
                            variant="outlined"
                            fullWidth
                            placeholder="Enter your question"
                        />

                        <FormControl fullWidth>
                            <InputLabel>Question Type</InputLabel>
                            <Select
                                value={questionType}
                                label="Question Type"
                                onChange={(e) => {
                                    setQuestionType(e.target.value);
                                    setOptions([]);
                                }}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="text">Text Response</MenuItem>
                                <MenuItem value="radio">Single Choice</MenuItem>
                                <MenuItem value="checkbox">Multiple Choice</MenuItem>
                            </Select>
                        </FormControl>

                        {(questionType === 'radio' || questionType === 'checkbox') && (
                            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Option"
                                        variant="outlined"
                                        value={newOption}
                                        onChange={(e) => setNewOption(e.target.value)}
                                        placeholder="Enter option"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'background.paper'
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={addOption}
                                        startIcon={<AddCircleIcon />}
                                        sx={{ 
                                            px: 3,
                                            background: 'linear-gradient(45deg, #2c2c2c 30%, #4f4f4f 90%)',
                                            boxShadow: '0 2px 4px rgba(44, 44, 44, .2)',
                                            '&:hover': { 
                                                background: 'linear-gradient(45deg, #4f4f4f 30%, #2c2c2c 90%)',
                                            }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </Box>
                                <List>
                                    {options.map((opt, index) => (
                                        <ListItem
                                            key={index}
                                            sx={{
                                                bgcolor: 'background.paper',
                                                mb: 1,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'grey.200'
                                            }}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => {
                                                        const newOptions = [...options];
                                                        newOptions.splice(index, 1);
                                                        setOptions(newOptions);
                                                    }}
                                                >
                                                    <DeleteIcon color="error" />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText primary={opt} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        <FormControl fullWidth>
                            <InputLabel>Select Tags</InputLabel>
                            <Select
                                value=""
                                label="Select Tags"
                                onChange={handleTagSelection}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="">
                                    <em>-- Select a Tag --</em>
                                </MenuItem>
                                {tags.map((tag) => (
                                    <MenuItem key={tag} value={tag}>
                                        {tag}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {selectedTags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => {
                                        const newTags = selectedTags.filter(t => t !== tag);
                                        setSelectedTags(newTags);
                                    }}
                                    sx={{
                                        bgcolor: 'grey.100',
                                        '&:hover': { bgcolor: 'grey.200' }
                                    }}
                                />
                            ))}
                        </Box>

                        <Button
                            variant="outlined"
                            onClick={addQuestion}
                            startIcon={<AddCircleIcon />}
                            sx={{
                                py: 1.5,
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': { 
                                    backgroundColor: 'action.hover',
                                    borderColor: 'primary.light'
                                }
                            }}
                        >
                            Add Question
                        </Button>
                    </Stack>
                </Paper>

                {questions.length > 0 && (
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 4, 
                            mb: 4,
                            border: '1px solid',
                            borderColor: 'grey.200'
                        }}
                    >
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ fontWeight: 600, color: 'text.primary' }}
                        >
                            Questions Added
                        </Typography>
                        <List>
                            {questions.map((q, index) => (
                                <ListItem
                                    key={index}
                                    sx={{ 
                                        display: 'block', 
                                        mb: 2,
                                        bgcolor: 'grey.50',
                                        borderRadius: 2,
                                        p: 2
                                    }}
                                >
                                    <Question question={q} onAnswerChange={() => { }} disabled={true} />
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => {
                                            const newQuestions = [...questions];
                                            newQuestions.splice(index, 1);
                                            setQuestions(newQuestions);
                                        }}
                                        sx={{ mt: 2 }}
                                    >
                                        Remove Question
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}

                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleSubmit}
                    endIcon={<SendIcon />}
                    sx={{
                        py: 2,
                        background: 'linear-gradient(45deg, #2c2c2c 30%, #4f4f4f 90%)',
                        boxShadow: '0 3px 5px 2px rgba(44, 44, 44, .3)',
                        '&:hover': { 
                            background: 'linear-gradient(45deg, #4f4f4f 30%, #2c2c2c 90%)',
                        }
                    }}
                >
                    Submit Survey
                </Button>
            </Container>
        </ThemeProvider>
    );
};

export default SurveyForm;