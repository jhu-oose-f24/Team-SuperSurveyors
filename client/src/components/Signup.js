import React, { useState } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import '../styles/signup.css';
import Toast from 'react-bootstrap/Toast';
import { useNavigate } from 'react-router-dom';
import '../services/userService';
import { registerUser } from '../services/userService';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [failureMsg, setFailureMsg] = useState("");

    const toggleShowSuccess = () => setShowSuccess(!showSuccess);
    const toggleShowFailure = () => setShowFailure(!showFailure);

    const validatePassword = () => {
        if (password.length < 8) {
            return false;
        }
        return true;
    }
    const handleSignUp = async (e) => {
        e.preventDefault();
        await registerUser(email, password, email).then(() => {
            toggleShowSuccess();
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }
        ).catch((error) => {
            setFailureMsg(error.message);
            toggleShowFailure();
            return;
        }
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                toggleShowSuccess();
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setFailureMsg(errorMessage);
                toggleShowSuccess();
            });
        e.preventDefault();

    }
    return (
        <div className="input_container">
            <b className="title">
                Sign up for MySurveyApp!
            </b>
            <Form className="submit_container">
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" onChange={e => setEmail(e.target.value)} />
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                    <Form.Text className="text-muted">
                        Please enter a password at least 8 characters long
                    </Form.Text>
                </Form.Group>
                <Button variant="primary" type="submit" onClick={(e) => handleSignUp(e)}>
                    Submit
                </Button>
            </Form>
            <Button variant="Link" onClick = {() => {navigate("/");}}>Back to Login</Button>
            <br/>
            <Toast show={showSuccess} onClose={toggleShowSuccess}>
                <Toast.Body>Successfully created an account for you!</Toast.Body>
            </Toast>
            <Toast show={showFailure} onClose={toggleShowFailure}>
                <Toast.Body>{failureMsg}</Toast.Body>
            </Toast>
        </div>
    );
};

export default Signup;