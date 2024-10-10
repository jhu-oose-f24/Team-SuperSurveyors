import React, { useState } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import '../styles/signup.css';
import Toast from 'react-bootstrap/Toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
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
        const auth = getAuth();
        if (!validatePassword()) {
            setFailureMsg("password entered is too short");
            toggleShowFailure();
            return;
        }
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                let user = userCredential.user;
                toggleShowSuccess();
                navigate("/view", {state :{
                    uid: user.uid,
                    }
                });
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
            <Button variant="Link" onClick = {() => {navigate("/signup");}}>Sign up</Button>
            <br/>
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
