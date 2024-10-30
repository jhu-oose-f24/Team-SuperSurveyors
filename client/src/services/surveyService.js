import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, documentId } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();



// Get current user
export const getUserSurveys = async () => {
    const user = auth.currentUser;

    try {
        const userQ = query(collection(db, "users"), where(documentId(), '==', user.uid));
        const userSnapshot = await getDocs(userQ);
        const surveys = userSnapshot.docs[0].data().surveys;

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