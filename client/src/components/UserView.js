import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { getCurrentUser, logoutUser } from '../services/userService';
import EditUserProfileDialog from './EditUserProfileDialog';

const UserView = () => {

    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editDisplayName, setEditDisplayName] = useState("");
    const [editPhotoURL, setEditPhotoURL] = useState("");

    // Use navigate to redirect
    const navigate = useNavigate();

    // Fetch the user data from Firestore
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = getCurrentUser();
                if (currentUser) setUser(currentUser);
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, []);

    // Open the EditUserProfile dialog
    const handleEditProfile = () => {
        if (!user) return;

        setEditDisplayName(user.displayName || "");
        setEditPhotoURL(user.photoURL || "");
        setShowEditDialog(true);
    };

    // Handle when user submits profile changes
    const handleSaveChanges = (updatedDisplayName, updatedPhotoURL) => {
        setUser((prevUser) => ({
            ...prevUser,
            displayName: updatedDisplayName,
            photoURL: updatedPhotoURL,
        }));
        
        // Close the dialog after saving
        setShowEditDialog(false); 
    };

    // Handle when user clicks the logout button
    const handleLogout = async () => {
        // Log user out then redirect to login page
        await logoutUser();
        navigate('/login'); 
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">User Profile</h2>
            {loadingUser ? (
                <div className="text-center">Loading user...</div>
            ) : !user ? (
                <div className="text-center">No user available.</div>
            ) : (
                <Row className="g-4">
                    <Col md={8} lg={6} className="mx-auto">
                        <Card className="h-100 shadow-sm text-center">
                            <Card.Img src={user.photoURL ? user.photoURL : 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'} 
                                    className="rounded-circle mt-4" 
                                    style={{ width: '150px', height: '150px', objectFit: 'cover', margin: '0 auto' }} 
                            />
                            <Card.Body>
                                <Card.Title className="text-secondary fs-3 mb-3">{user.displayName || "No Display Name"}</Card.Title>
                                <Card.Text className="text-muted mb-2"><strong>Email:</strong> {user.email}</Card.Text>
                                <Card.Text className="text-muted mb-2"><strong>UID:</strong> {user.uid}</Card.Text>
                                <Button variant="primary" className="w-50 mb-2" onClick={handleEditProfile}>Edit Profile</Button>
                                <br />
                                <Button variant="danger" className="w-50" onClick={handleLogout}>Sign Out</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            <EditUserProfileDialog
                show={showEditDialog}
                onHide={() => setShowEditDialog(false)}
                userId={user?.uid}
                displayName={editDisplayName}
                photoURL={editPhotoURL}
                onDisplayNameChange={setEditDisplayName}
                onPhotoURLChange={setEditPhotoURL}
                onSave={handleSaveChanges}
            />
        </Container>
    );
};

export default UserView;