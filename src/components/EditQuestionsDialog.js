import React, { useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import EditableQuestion from './Question/EditableQuestion';
import { useState, useRef } from 'react';
import 'use-bootstrap-tag/dist/use-bootstrap-tag.css'
import UseBootstrapTag from 'use-bootstrap-tag'


const EditQuestionsDialog = ({ show, onHide, survey, onQuestionsChange, handleSaveChanges, onTitleChange }) => {

    const [currentTitle, setCurrentTitle] = useState(survey.title);
    const [currentTags, setCurrentTags] = useState(survey.tags);
    const onTagChange = (tags) => {
        survey.tags = tags;
    }
    const tagRef = useRef(null);
    const componentRef = useRef(null);

    useEffect(() => {
        if (tagRef.current) {
            componentRef.current = new UseBootstrapTag(tagRef.current);
        }
    });



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
        onTitleChange(newTitle);
    }

    const questionTitleChange = (index, newTitle) => {
        const updatedQuestions = [...survey.questions];
        updatedQuestions[index].text = newTitle;
        onQuestionsChange(updatedQuestions);
    }



    return (
        <Modal backdrop='static' keyboard={false} show={show} onHide={() => {
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
                            onBlur={() => {
                            }}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="tags" className="mt-3">
                        <Form.Label>Tags</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter tags"
                            ref={tagRef}
                            defaultValue={survey.tags}
                            onKeyDown={handleKeyDown}
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
                <Button variant='primary' onClick={() => {
                    onQuestionsChange([...survey.questions, {
                        text: 'New Question',
                        type: 'text',
                        options: []
                    }]);

                }
                }>Add Question</Button>
                <div style={{ flex: 1 }}></div>
                <Button variant="secondary" onClick={() => {
                    setCurrentTitle(survey.title);
                    onQuestionsChange(survey.questions);
                    onHide();
                }}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => {
                    onTagChange(componentRef.current.getValues());
                    handleSaveChanges(survey.id)
                }}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditQuestionsDialog;