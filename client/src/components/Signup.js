import React, { useState } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import Question from './Question';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const Signup = () => {
    const handleSignUp = async (email, password) => {
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up 
          const user = userCredential.user;
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
    }
    return (
        <div className = "container mt-4">

        </div>
    );
};

export default Signup;