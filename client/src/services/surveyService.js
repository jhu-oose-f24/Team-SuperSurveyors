import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, documentId, setDoc, doc } from 'firebase/firestore';
import {
    PriorityQueue,
} from '@datastructures-js/priority-queue';

const auth = getAuth();
const db = getFirestore();
const pq = new PriorityQueue((s1, s2) => {
    if (s1[0] > s2[0]) {
        return 1;
    } else if (s1[0] == s2[0]) {
        return 0;
    }
    return -1;
});

const getUserId = () => {
    const user = auth.currentUser;
    if (user) {
        return user.uid;
    } else {
        throw new Error('User not logged in');
    }
};


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

        const surveyQuery = query(collection(db, "surveys"), where(documentId(), 'not-in', surveys));
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

export const fetchSurveyBasedOnTag = async () => {
    try {
        const userId = getUserId();
        const userInfo = query(
            collection(db, 'users'),
            where(documentId(), '==', userId)
        );
        const userInfoSnapshot = await getDocs(userInfo);
        let userOwnedSurveys = [];
        let userTags = [];
        userInfoSnapshot.forEach((child) => {
            userOwnedSurveys = child.data().surveys;
            if (child.data().tags) {
                userTags = child.data().tags;
            }
        });
        const surveyInfo = query(
            collection(db, 'surveys'),
            where(documentId(), 'not-in', userOwnedSurveys)
        );
        const allSurveysSnapshot = await getDocs(surveyInfo);
        allSurveysSnapshot.forEach((child) => {
            let survey = child.data();
            let commonTags = 0;
            //if survey is tagged, calculate its score
            if (survey.tags) {
                for (let i = 0; i < survey.tags.length; i++) {
                    if (userTags.includes(survey.tags[i])) {
                        commonTags = commonTags + 1;
                    }
                }
            }
            let score = commonTags;
            pq.enqueue((score, {
                id: child.id,
                ...survey
            }));
        })
        return pq;
    } catch (error) {
        console.error("Error fetching tagged survey recommendation: ", error);
    }
};
