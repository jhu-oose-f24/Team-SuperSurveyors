import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const NavBar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Check if user is authenticated using onAuthStateChanged to handle real-time login/logout
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user); // Set to true if user exists
        });
        
        return () => unsubscribe(); // Cleanup subscription on component unmount
    }, []);

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                {/* Change "MySurveyApp" brand link to navigate to "/view" if authenticated */}
                <Navbar.Brand as={Link} to={isAuthenticated ? "/view" : "/"}>
                    MySurveyApp
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {/* "Home" button navigates to "/profile" if authenticated */}
                        <Nav.Link as={Link} to={isAuthenticated ? "/profile" : "/"}>
                            Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/create">
                            Create Survey
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;
