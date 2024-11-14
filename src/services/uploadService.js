import { useEffect, useRef, useState } from 'react';
import { db, addDoc, collection } from '../firebase';

export const UploadWidget = ({ onUpload }) => {
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
                
                onUpload(uploadedMediaUrl);
                setMediaUrl(uploadedMediaUrl);
                setMediaType(uploadedMediaType);

                console.log(`Uploaded ${uploadedMediaType} URL:`, uploadedMediaUrl);

                try {
                    // Save media URL and type to Firebase Firestore
                    await addDoc(collection(db, "media"), {
                        url: uploadedMediaUrl,
                        type: uploadedMediaType,
                    });
                    console.log(`${uploadedMediaType} URL saved to Firebase`);
                } catch (e) {
                    console.error("Error adding document: ", e);
                }
            }
        });
    }, [onUpload]);

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
                            Your browser does not support the audio element.
                        </audio>
                    ) : null}
                </div>
            )}
        </div>
    );
};
