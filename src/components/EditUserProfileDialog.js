import React, { useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { updateUserProfile } from '../services/userService'; // Import the update function

const EditUserProfileDialog = ({ show, onHide, userId, displayName, photoURL, onDisplayNameChange, onPhotoURLChange, onSave }) => {

    const handleSaveChanges = async () => {
        try {
            // Use the service to update the profile
            const updatedUser = await updateUserProfile(userId, displayName, photoURL);
            onSave(updatedUser.displayName, updatedUser.photoURL); // Pass updated values to parent component
        } catch (error) {
            console.error("Error updating user profile:", error);
        }
    };

    // Handle Enter key press to save changes
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSaveChanges();
            }
        };

        if (show) {
            document.addEventListener('keydown', handleKeyPress);
        } else {
            document.removeEventListener('keydown', handleKeyPress);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [show, displayName, photoURL]);

    // Handle clicking outside to save changes
    const handleCloseAndSave = () => {
        handleSaveChanges();
        onHide(); // Close the modal
    };

    return (
        <Modal show={show} onHide={handleCloseAndSave} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit User Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="editDisplayName">
                        <Form.Label>Display Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={displayName}
                            onChange={(e) => onDisplayNameChange(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="editPhotoURL">
                        <Form.Label>Photo URL</Form.Label>
                        <Form.Control
                            type="text"
                            value={photoURL}
                            onChange={(e) => onPhotoURLChange(e.target.value)}
                        />
                    </Form.Group>
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

export default EditUserProfileDialog;
