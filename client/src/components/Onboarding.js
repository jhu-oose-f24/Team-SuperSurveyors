import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Onboarding = () => {
    const { userId } = useParams(); // Get userId from route params
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const navigate = useNavigate();
    const minTags = 5;

    // Fetch tags with images from Firestore on component mount
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tagsCollection = collection(db, 'tags');
                const tagsSnapshot = await getDocs(tagsCollection);
                const tagsList = tagsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(), // Ensure 'image' field exists
                }));
                setTags(tagsList);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

    // Toggle tag selection
    const toggleTagSelection = (tagId) => {
        setSelectedTags((prevSelected) =>
            prevSelected.includes(tagId)
                ? prevSelected.filter((id) => id !== tagId)
                : [...prevSelected, tagId]
        );
    };

    // Handle completion of onboarding
    const handleComplete = async () => {
        if (selectedTags.length >= 5) {
            try {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, { tags: selectedTags });
                navigate(`/profile`); // Redirect to profile after completion
            } catch (error) {
                console.error('Error updating user tags:', error);
            }
        } else {
            alert('Please select at least 5 topics.');
        }
    };

    // Inline styles
    const cardStyle = (isSelected) => ({
        cursor: 'pointer',
        border: `2px solid ${isSelected ? '#0d6efd' : 'transparent'}`,
        backgroundColor: isSelected ? 'rgba(13, 110, 253, 0.1)' : 'white',
        boxShadow: isSelected
            ? '0 8px 16px rgba(13, 110, 253, 0.3)'
            : '0 4px 8px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
    });

    const imgStyle = {
        height: '150px',
        objectFit: 'cover',
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Select Your Interests</h2>
            <Row>
                {tags.map((tag) => (
                    <Col xs={6} md={4} lg={3} className="mb-3" key={tag.id}>
                        <Card
                            style={cardStyle(selectedTags.includes(tag.id))}
                            onClick={() => toggleTagSelection(tag.id)}
                        >
                            <Card.Img
                                variant="top"
                                src={tag.image}
                                alt={tag.id}
                                style={imgStyle}
                            />
                            <Card.Body className="d-flex align-items-center justify-content-center">
                                <span>{tag.id}</span>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <div className="text-center m-4">
                <Button
                    variant={selectedTags.length < minTags ? 'outline-success' : 'success'} 
                    size="lg"
                    onClick={handleComplete}
                    disabled={selectedTags.length < minTags}
                >
                    {selectedTags.length < minTags ? 'Select ' + (minTags - selectedTags.length) + ' more tags' : 'Complete Onboarding'}
                </Button>
            </div>
        </Container>
    );
};

export default Onboarding;
