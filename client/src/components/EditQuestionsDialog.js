import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import EditableQuestion from './Question/EditableQuestion';

const EditQuestionsDialog = ({ show, onHide, survey, onQuestionsChange, handleSaveChanges }) => {

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
        onQuestionsChange({ ...survey, title: newTitle });
    }

    return (
        <Modal show={show} onHide={onHide} size='lg' >
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
                            value={survey.title}
                            onChange={(e) => onQuestionsChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Body>
                <Form>
                    {survey.questions.map((question, index) => (
                        <Form.Group className="mb-3" controlId={`editQuestion${index}`} key={index}>

                            <EditableQuestion disabled={true} question={question} onQuestionChange={() => { }} onTitleChange={() => { }} />
                        </Form.Group>
                    ))}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveChanges}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditQuestionsDialog;