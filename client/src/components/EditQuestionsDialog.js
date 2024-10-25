import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import EditableQuestion from './Question/EditableQuestion';
import { useState } from 'react';

const EditQuestionsDialog = ({ show, onHide, survey, onQuestionsChange, handleSaveChanges, onTitleChange }) => {

    const [currentTitle, setCurrentTitle] = useState(survey.title);
    const [updatedQuestions, setUpdatedQuestions] = useState(survey.questions);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission on Enter key press
        }
    };

    const handleQuestionChange = (index, newQuestion) => {
        const updatedQuestions = [...survey.questions];
        updatedQuestions[index] = newQuestion;
        onQuestionsChange(updatedQuestions);
    };

    const handleTitleChange = (newTitle) => {
        setCurrentTitle(newTitle);

    }

    const questionTitleChange = (index, newTitle) => {
        //push to updatedQuestions
        setUpdatedQuestions(updatedQuestions.map((question, i) => {
            if (i === index) {
                return { ...question, text: newTitle };
            }
            return question;
        }
        ));


    }



    return (
        <Modal show={show} onHide={() => {
            setCurrentTitle(survey.title);
            setUpdatedQuestions(survey.questions);
            onHide();
        }} size='lg' >
            <Modal.Header closeButton>
                <Modal.Title>Edit Survey</Modal.Title>
            </Modal.Header>
            {/* Add a Edit Title :*/}
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="editTitle" >
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={currentTitle}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={() => { }}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Body>
                <Form>
                    {survey.questions.map((question, index) => (
                        <Form.Group className="mb-3" controlId={`editQuestion${index}`} key={index}>

                            <EditableQuestion disabled={true} id={index} question={question} onQuestionChange={() => { }} onTitleChange={questionTitleChange} />
                        </Form.Group>
                    ))}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => { onTitleChange(currentTitle); handleSaveChanges(survey.id) }}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditQuestionsDialog;