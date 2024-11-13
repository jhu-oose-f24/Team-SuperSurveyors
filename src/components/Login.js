import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';
import { useNavigate } from 'react-router-dom';
import { loginUser, loginGoogleUser } from '../services/userService';
import '../styles/signup.css';
import { getAuth } from 'firebase/auth';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [failureMsg, setFailureMsg] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        if (auth.currentUser) {
            navigate('/');
        }

    }, []);

    const handleSignUp = async (e) => {
        e.preventDefault();

        await loginUser(email, password).then(() => {
            setShowFailure(false);
            setShowSuccess(true);
            navigate('/');
        }).catch((error) => {
            console.log("Error trying to login with username/password: " + error);

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

    const handleGoogleLogin = async (e) => {
        e.preventDefault();

        await loginGoogleUser().then((userInfo) => {
            if (userInfo.isNewUser) {
                navigate(`/onboarding/${userInfo.user.uid}`);
            } else {
                navigate('/');
            }
            
        }).catch((error) => {
            console.log("Error trying to login with Google: " + error);
        });
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

                <Row className='mb-2 justify-content-center'>
                    <Button variant="primary" className="my-2 w-auto" type="submit" onClick={(e) => handleSignUp(e)}>
                        Submit
                    </Button>
                </Row>
                
            </Form>

            <Container className="w-50 d-flex flex-column align-items-center">
                <Row className='mb-2'>
                    <Col>
                        <Button variant="outline-primary" className="w-auto" type="submit" onClick={(e) => handleGoogleLogin(e)}>
                            Login with&nbsp;
                            <img src='https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' className="d-inline-block align-top" alt="Google logo" />
                        </Button>
                    </Col>
                    <Col>
                        <Button variant="outline-primary" className="w-auto" onClick={() => { navigate("/signup"); }}>
                            Sign Up
                        </Button>
                    </Col>
                </Row>
            </Container>
            
            
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