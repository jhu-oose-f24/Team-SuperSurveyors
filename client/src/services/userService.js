// src/services/userService.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, addDoc, arrayUnion, updateDoc } from 'firebase/firestore';
import User from '../models/User'; // Assuming you have a User class in models/

const auth = getAuth();
const db = getFirestore();

// Register a new user with email and password
export const registerUser = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update the user's profile with displayName
        await updateProfile(user, { displayName });

        // Save user data in Firestore
        const userRef = doc(db, 'users', user.uid);
        const newUser = new User(user.uid, displayName, email, user.photoURL, []);
        await setDoc(userRef, newUser.toJson());

        return newUser;
    } catch (error) {
        console.error('Error registering user: ', error);
        throw error;
    }
};

// Login a user with email and password
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch additional user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            return new User(user.uid, userData.displayName, user.email, user.photoURL);
        } else {
            console.log('No such user document!');
            return null;
        }
    } catch (error) {
        console.error('Error logging in user: ', error);
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (uid, displayName, photoURL) => {
    try {
        // Update Firebase Authentication profile
        const user = auth.currentUser;
        if (user) {
            await updateProfile(user, { displayName, photoURL });

            // Update user data in Firestore
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, { displayName, photoURL }, { merge: true });

            return new User(uid, displayName, user.email, photoURL);
        }
        throw new Error('No user is signed in');
    } catch (error) {
        console.error('Error updating profile: ', error);
        throw error;
    }
};

// Get current user
export const getCurrentUser = () => {
    const user = auth.currentUser;
    if (user) {
        return new User(user.uid, user.displayName, user.email, user.photoURL, user.surveys);
    }
    return null;
};

// Add a survey ID to the user's surveys array
export const addSurveyToUser = async (surveyId) => {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            surveys: arrayUnion(surveyId),
        });
    }
};

