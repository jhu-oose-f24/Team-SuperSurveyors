import React, { useState } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import '../styles/signup.css';
import Toast from 'react-bootstrap/Toast';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const validatePassword = () => {
        if (password.length < 8) {
            return false;
        }
        return true;
    }
    const handleSignUp = async () => {
        const auth = getAuth();
        if (!validatePassword()) {
            console.log("password entered is too short");
        }
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log("successfully created a user");
                navigate('/login');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log("error when creating user");
                console.log(errorCode);
                console.log(errorMessage);
            });

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
                <Button variant="primary" type="submit" onClick={handleSignUp()}>
                    Submit
                </Button>
            </Form>
        </div>
    );
};

export default Signup;