import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut  } from 'firebase/auth';

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

    const navigate = useNavigate();

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
                        <Nav.Link as={Link} to="/">
                            Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/create">
                            Create Survey
                        </Nav.Link>
                        <Nav.Link as={Link} to={isAuthenticated ? "/profile" : "/"}>
                            Profile
                        </Nav.Link>
                        <Nav.Link as={Link} to={isAuthenticated ? "/profile" : "/"} onClick={isAuthenticated ? handleLogout : undefined}>
                            {isAuthenticated ? 'Logout' : 'Signin'}
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;
