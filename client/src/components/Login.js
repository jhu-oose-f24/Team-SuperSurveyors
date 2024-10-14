import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { loginUser } from '../services/userService';
import '../styles/signup.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [failureMsg, setFailureMsg] = useState("");
    const navigate = useNavigate();
  
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
        const auth = getAuth();
        if (!validatePassword()) {
            setFailureMsg("password entered is too short");
            toggleShowFailure();
            return;
        }
        await loginUser(email, password).then(() => {
            toggleShowSuccess();
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }
        ).catch((error) => {
            setFailureMsg(error.message);
            toggleShowFailure();
            return;
        });

        e.preventDefault();

    }
    return (
        <div className="input_container">
            <b className="title">
                Welcome to MySurveyApp!
            </b>
            <Form className="submit_container">
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" onChange={e => setEmail(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit" onClick={(e) => handleSignUp(e)}>
                    Submit
                </Button>
            </Form>
            <Button variant="Link" onClick={() => { navigate("/signup"); }}>Sign up</Button>
            <br />
            <Toast show={showSuccess} onClose={toggleShowSuccess}>
                <Toast.Body>Successfully signed in!</Toast.Body>
            </Toast>
            <Toast show={showFailure} onClose={toggleShowFailure}>
                <Toast.Body>{failureMsg}</Toast.Body>
            </Toast>
        </div>
    );
};

export default Login;