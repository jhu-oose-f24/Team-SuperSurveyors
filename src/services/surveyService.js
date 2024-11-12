import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, documentId, setDoc, doc, getDoc, runTransaction} from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();



// Get current user
export const getUserSurveys = async () => {
    const user = auth.currentUser;

    try {
        const userQ = query(collection(db, "users"), where(documentId(), '==', user.uid));
        const userSnapshot = await getDocs(userQ);
        const surveys = userSnapshot.docs[0].data().surveys;

        if (surveys.length < 1) {
            return;
        }
        const q = query(collection(db, "surveys"), where(documentId(), 'in', surveys));
        const querySnapshot = await getDocs(q);
        const surveysData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        // TODO: Sort by creation date
        return surveysData;
    } catch (error) {
        console.error("Error fetching the user's surveys:", error);
    }

};

export const getRandomSurvey = async () => {
    const user = auth.currentUser;

    try {
        const userQ = query(collection(db, "users"), where(documentId(), '==', user.uid));
        const userSnapshot = await getDocs(userQ);
        const surveys = userSnapshot.docs[0].data().surveys;

        let surveyQuery;
        if (surveys.length) {
            surveyQuery = query(collection(db, "surveys"), where(documentId(), 'not-in', surveys));
        } else {
            surveyQuery = query(collection(db, "surveys"));
        }

        const surveySnapshot = await getDocs(surveyQuery);

        // Filter out some of the surveys with no questions or title
        let surveysData = surveySnapshot.docs.filter((doc) => {
            return doc.data().title.length && doc.data().questions.length;
        });

        //Filter out the surveys that the user has already taken
        const answered_surveys = userSnapshot.docs[0].data().answeredSurveys;
        surveysData = surveysData.filter((doc) => {
            return !answered_surveys.includes(doc.id);
        });



        // Add the id field to the surveys
        surveysData = surveysData.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Choose a random survey to work with
        const randomIdx = Math.floor(Math.random() * surveysData.length);
        return surveysData[randomIdx];

    } catch (error) {
        console.error('Error fetching surveys:', error);
    }
}

export const updateSurvey = async (surveyId, updatedSurvey) => {
    try {
        await setDoc(doc(db, 'surveys', surveyId), updatedSurvey);
    } catch (error) {
        console.error('Error updating survey:', error);
    }
};

export const checkCurrency = async () => {
    const user = auth.currentUser;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data().coins > 2;
    } else {
        return false;
    }
}

export const updateCurrency = async (change) => {
    const user = auth.currentUser;
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    let data = userDoc.data();
    data.coins = data.coins + change;
    await setDoc(doc(db, 'users', user.uid), data);
}
