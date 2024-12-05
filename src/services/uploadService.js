import { useEffect, useRef, useState } from 'react';
import { db, addDoc, collection,  } from '../firebase';

export const UploadWidget = ({ onUpload, surveyId, questionId }) => {
    const cloudinaryRef = useRef();
    const widgetRef = useRef();
    const [mediaUrl, setMediaUrl] = useState(null);
    const [mediaType, setMediaType] = useState(''); // Track the type of media uploaded (image, audio, or video)

    useEffect(() => {
        cloudinaryRef.current = window.cloudinary;
        widgetRef.current = cloudinaryRef.current.createUploadWidget({
            cloudName: 'dkohfegpk',
            uploadPreset: 'default',
            sources: ['local', 'url'], // Adjust sources as needed
            resourceType: 'auto' // Automatically determines if the upload is an image, video, or audio
        }, async function (error, result) {
            if (!error && result && result.event === "success") {
                const uploadedMediaUrl = result.info.secure_url;
                const uploadedMediaType = result.info.resource_type; // 'image', 'video', or 'audio'
                
                onUpload(uploadedMediaUrl, uploadedMediaType);
                setMediaUrl(uploadedMediaUrl);
                setMediaType(uploadedMediaType);

                console.log(`Uploaded ${uploadedMediaType} URL:`, uploadedMediaUrl);

                try {
                    // Reference to the specific survey and question document
                    const questionDocRef = collection(db, "surveys", surveyId, "questions", questionId);

                    // Update the question document with the new media
                    await addDoc(questionDocRef, {
                        media: {
                            url: uploadedMediaUrl,
                            type: uploadedMediaType,
                        }
                    });
                    console.log(`${uploadedMediaType} URL saved to Firebase under survey ${surveyId}, question ${questionId}`);
                } catch (e) {
                    console.error("Error updating document: ", e);
                }
            }
        });
    }, [onUpload, surveyId, questionId]);

    return (
        <div>
            <button onClick={() => widgetRef.current.open()}>
                Upload Media
            </button>
            {mediaUrl && (
                <div>
                    <h3>Uploaded {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}:</h3>
                    {mediaType === 'image' ? (
                        <img src={mediaUrl} alt="Uploaded" style={{ width: "300px", height: "auto" }} />
                    ) : mediaType === 'video' ? (
                        <video controls style={{ width: "300px", height: "auto" }}>
                            <source src={mediaUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : mediaType === 'audio' ? (
                        <audio controls>
                            <source src={mediaUrl} type="audio/mpeg" />
                            Your browser does not support the video tag.
                        </audio>
                    ) : null}
                </div>
            )}
        </div>
    );
};
