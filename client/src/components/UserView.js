import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import { getAuth, signOut } from 'firebase/auth';
import { getCurrentUser } from '../services/userService';
import EditUserProfileDialog from './EditUserProfileDialog'; // Ensure correct path
import { useNavigate } from 'react-router-dom'; // To redirect after logout

const UserView = () => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editDisplayName, setEditDisplayName] = useState("");
    const [editPhotoURL, setEditPhotoURL] = useState("");
    const navigate = useNavigate(); // Use navigate to redirect

    // Fetch the user data from Firestore
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, []);

    //Open the EditUserProfile page
    const handleEditProfile = () => {
        if (user) {
            setEditDisplayName(user.displayName || "");
            setEditPhotoURL(user.photoURL || "");
            setShowEditDialog(true);
        }
    };

    //handle when save edit profile
    const  handleSaveChanges = (updatedDisplayName, updatedPhotoURL) => {
        setUser((prevUser) => ({
            ...prevUser,
            displayName: updatedDisplayName,
            photoURL: updatedPhotoURL,
        }));
        setShowEditDialog(false); // Close the dialog after saving
    };

    //handle when click logout button
    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            navigate('/login'); // Redirect to login page after logging out
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">User Profile</h2>
            {loadingUser ? (
                <div className="text-center">Loading user...</div>
            ) : user ? (
                <Row className="g-4">
                    <Col md={8} lg={6} className="mx-auto">
                        <Card className="h-100 shadow-sm text-center">
                            {user.photoURL ? (
                                <Card.Img variant="top" src={user.photoURL} alt="User Profile" className="rounded-circle mt-4" style={{ width: '150px', height: '150px', objectFit: 'cover', margin: '0 auto' }} />
                            ) : (
                                <Card.Img variant="top" src="https://via.placeholder.com/150" alt="No Profile Picture" className="rounded-circle mt-4" style={{ width: '150px', height: '150px', objectFit: 'cover', margin: '0 auto' }} />
                            )}
                            <Card.Body>
                                <Card.Title className="text-primary fs-3 mb-3">{user.displayName || "No Display Name"}</Card.Title>
                                <Card.Text className="text-muted mb-2"><strong>Email:</strong> {user.email}</Card.Text>
                                <Card.Text className="text-muted mb-2"><strong>UID:</strong> {user.uid}</Card.Text>
                                <Button variant="primary" className="w-100 mb-2" onClick={handleEditProfile}>Edit Profile</Button>
                                <Button variant="danger" className="w-100" onClick={handleLogout}>Logout</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ) : (
                <div className="text-center">No user available.</div>
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
