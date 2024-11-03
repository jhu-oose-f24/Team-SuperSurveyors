import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/userService';
import '../styles/signup.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [failureMsg, setFailureMsg] = useState("");
    const navigate = useNavigate();
    
    const handleSignUp = async (e) => {
        e.preventDefault();

        await loginUser(email, password).then(() => {
            setShowFailure(false);
            setShowSuccess(true);
            setTimeout(() => navigate('/'), 1000);
        }).catch((error) => {
            if (error.name === 'FirebaseError' && error.code === 'auth/invalid-email') {
                setFailureMsg("Please enter a valid email address");
            } else if (error.name === 'FirebaseError' && error.code === 'auth/invalid-credential') {
                setFailureMsg("Invalid email and/or password. Press Sign Up if you don't have an account!");
            } else {
                setFailureMsg(error.message);
            }

            setShowFailure(true);
            return;
        });

        e.preventDefault();

    }
    return (
        <div className="input_container">
            <b className="title">
                Welcome to SuperSurveyors!
            </b>
            <Form className="submit_container">
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email Address:</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" onChange={e => setEmail(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit" onClick={(e) => handleSignUp(e)}>
                    Submit
                </Button>
            </Form>
            <br />
            <Button variant="outline-primary" onClick={() => { navigate("/signup"); }}>Sign Up</Button>
            <br />
            <Toast bg='success' show={showSuccess} onClose={() => setShowSuccess(false)} delay={2000} autohide>
                <Toast.Body className='text-white'>Successfully signed in!</Toast.Body>
            </Toast>
            <Toast bg='secondary' show={showFailure} onClose={() => setShowFailure(false)} delay={2000} autohide>
                <Toast.Body className='text-white'>{failureMsg}</Toast.Body>
            </Toast>
        </div>
    );
};

export default Login;