import React, { useState } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import Question from './Question';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import '../services/userService';

const Login = () => {
    return (
        <div className="container mt-4">
            <h2>Login</h2>
            <Form>
                <Form.Group className='mt-3' controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" />
                </Form.Group>
                <Form.Group className='mt-3' controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Login
                </Button>
            </Form>
        </div>
    );
}

export default Login;