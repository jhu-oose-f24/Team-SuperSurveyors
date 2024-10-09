import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
//Write just use to test the user profile fetch function. Not do error handling.
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirect to profile or home page after login
            navigate('/profile'); 
        } catch (err) {
            setError('Failed to login. Please check your email and password.');
        }
    };
    return (
        <div className="container mt-4">
            <h2>Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleLogin}>
                <Form.Group className='mt-3' controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className='mt-3' controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button className='mt-3' variant="primary" type="submit">
                    Login
                </Button>
            </Form>
        </div>
    );
};

export default Login;
