import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Modal, Badge } from 'react-bootstrap';
import { getCurrentUser, logoutUser } from '../services/userService';
import EditUserProfileDialog from './EditUserProfileDialog';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const UserView = () => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editDisplayName, setEditDisplayName] = useState('');
    const [editPhotoURL, setEditPhotoURL] = useState('');
    const [showTagDialog, setShowTagDialog] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = getCurrentUser();
                if (currentUser) {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser(userData);
                        setSelectedTags(userData.tags || []);
                    }
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoadingUser(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tagsCollection = collection(db, 'tags');
                const tagsSnapshot = await getDocs(tagsCollection);
                const tagsList = tagsSnapshot.docs.map((doc) => doc.id);
                setAvailableTags(tagsList);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

    const handleEditProfile = () => {
        if (!user) return;
        setEditDisplayName(user.displayName || '');
        setEditPhotoURL(user.photoURL || '');
        setShowEditDialog(true);
    };

    const handleSaveChanges = (updatedDisplayName, updatedPhotoURL) => {
        setUser((prevUser) => ({
            ...prevUser,
            displayName: updatedDisplayName,
            photoURL: updatedPhotoURL,
        }));
        setShowEditDialog(false);
    };

    const handleLogout = async () => {
        await logoutUser();
        navigate('/login');
    };

    const toggleTagSelection = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSaveTags = async () => {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { tags: selectedTags });
            setUser((prevUser) => ({ ...prevUser, tags: selectedTags }));
            setShowTagDialog(false);
        } catch (error) {
            console.error('Error updating tags:', error);
        }
    };

    const getBadgeVariant = (index) => {
        //Open for future change of color
        const variants = ['secondary'];
        return variants[index % variants.length];
    };

    if (loadingUser) {
        return (
            <Container className="d-flex align-items-center justify-content-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading profile...</p>
                </div>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="d-flex align-items-center justify-content-center min-vh-100">
                <p className="h4">No user available.</p>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="border-0 shadow-lg">
                        <Card.Header className="bg-white border-0 pt-4 pb-0">
                            <div className="text-end mb-3">
                                <Button
                                    variant="link"
                                    className="me-2 text-decoration-none"
                                    onClick={handleEditProfile}
                                >
                                    <i className="bi bi-pencil"></i> Edit
                                </Button>
                                <Button
                                    variant="link"
                                    className="text-decoration-none"
                                    onClick={() => setShowTagDialog(true)}
                                >
                                    <i className="bi bi-tags"></i> Tags
                                </Button>
                            </div>
                            <div className="text-center">
                                <div className="position-relative d-inline-block mb-3">
                                    <img
                                        src={
                                            user.photoURL ||
                                            'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
                                        }
                                        alt="Profile"
                                        className="rounded-circle"
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            objectFit: 'cover',
                                            border: '4px solid white',
                                            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                </div>
                                <h3 className="mb-0 fw-bold">
                                    {user.displayName || 'No Display Name'}
                                </h3>
                            </div>
                        </Card.Header>
                        <Card.Body className="text-center">
                            <div className="mb-4">
                                <small className="text-muted d-block">{user.email}</small>
                                <small className="text-muted d-block">UID: {user.uid}</small>
                            </div>

                            <div className="mb-4">
                                <h6 className="text-muted mb-3">Interest Tags</h6>
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    {user.tags && user.tags.length > 0 ? (
                                        user.tags.map((tag, index) => (
                                            <Badge
                                                key={index}
                                                bg={getBadgeVariant(index)}
                                                className="px-3 py-2 rounded-pill"
                                            >
                                                {tag}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted">No tags selected</span>
                                    )}
                                </div>
                            </div>

                            <Button
                                variant="danger"
                                className="w-100"
                                onClick={handleLogout}
                            >
                                <i className="bi bi-box-arrow-right me-2"></i>
                                Sign Out
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

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

            <Modal
                show={showTagDialog}
                onHide={() => setShowTagDialog(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Tags</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-2">
                        {availableTags.map((tag) => (
                            <Col xs={6} md={4} key={tag}>
                                <Button
                                    variant={
                                        selectedTags.includes(tag)
                                            ? 'primary'
                                            : 'outline-primary'
                                    }
                                    className="w-100"
                                    onClick={() => toggleTagSelection(tag)}
                                >
                                    {tag}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTagDialog(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveTags}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UserView;
