import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { logoutUser, getCurrentUser, getUserInfo } from '../services/userService';
import '../styles/navbar.css';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase.js';


const NavBar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userInfo, setUserInfo] = useState({coins: 0});

    // Use navigate to redirect
    const navigate = useNavigate();
    const auth = getAuth();

    // Check if user is authenticated using onAuthStateChanged to handle real-time login/logout
    useEffect(() => {
        async function fetchInfo() {
            const data = await getUserInfo();
            console.log(data);
            setUserInfo(data);
        }
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user); // Set to true if user exists
        });
        if (isAuthenticated) {
            fetchInfo();
        }

        return () => unsubscribe(); // Cleanup subscription on component unmount
    }, []);

    if (isAuthenticated) {
        onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
            setUserInfo(doc.data())});
    }

    // Handle when user clicks the logout button
    const handleLogout = async () => {

        // Log user out then redirect to login page
        await logoutUser();
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                {/* Change "SUperSurveyors" brand link to navigate to "/view" if authenticated */}
                <Navbar.Brand as={Link} to={isAuthenticated ? "/view" : "/"}>
                    SuperSurveyors
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {isAuthenticated ? (
                        <Nav className="ms-auto">
                            <Nav.Link as={Link} to="/view">
                                View Surveys
                            </Nav.Link>
                            <Nav.Link as={Link} to="/create">
                                Create Survey
                            </Nav.Link>
                            <Nav.Link as={Link} to="/answer">
                                Answer Survey
                            </Nav.Link>
                            {/* Navigates to "/profile" if authenticated */}
                            <Nav.Link as={Link} to={isAuthenticated ? "/profile" : "/"}>
                                {/* User Settings */}
                                <img src={getCurrentUser().photoURL ?? 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'}
                                    width="30"
                                    height="30"
                                    alt="nav profile pic"
                                    className="d-inline-block align-top rounded-circle"
                                />
                            </Nav.Link>

                            <Button variant="secondary" onClick={handleLogout}>
                                Sign Out
                            </Button>
                            <div className = "coins-text">
                                {userInfo.coins + " coins"}
                            </div>
                        </Nav>
                    ) : (
                        <Nav className="ms-auto">
                            <Nav.Link as={Link} to="/signup">
                                Signup
                            </Nav.Link>
                        </Nav>
                    )}
                </Navbar.Collapse>

            </Container>
        </Navbar>
    );
};

export default NavBar;
