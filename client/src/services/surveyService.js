import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, documentId, setDoc, doc } from 'firebase/firestore';

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
        console.error("Error fetching surveys:", error);
    }

};

//update a survey
export const updateSurvey = async (surveyId, survey) => {
    try {
        await setDoc(doc(db, 'surveys', surveyId), survey);
        console.log(surveyId);
    } catch (error) {
        console.error("Error updating survey:", error);
    }
}