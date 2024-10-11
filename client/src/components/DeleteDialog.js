import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const DeleteConfirmationDialog = ({ show, onHide, survey, onSurveyDelete }) => {
    const [loading, setLoading] = useState(false);

    const handleDeleteConfirm = async () => {
        if (survey) {
            setLoading(true);
            try {
                await deleteDoc(doc(db, 'surveys', survey.id));
                onSurveyDelete(survey.id); // Inform parent to update survey list
                onHide(); // Close modal after deletion
            } catch (error) {
                console.error('Error deleting survey:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the survey "{survey?.title}"? This action cannot be undone.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteConfirm} disabled={loading}>
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteConfirmationDialog;
