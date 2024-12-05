import { useEffect, useRef, useState } from 'react';
import { db, addDoc, collection } from '../firebase';

export const UploadWidget = ({ onUpload }) => {
    const cloudinaryRef = useRef();
    const widgetRef = useRef();
    const [mediaUrl, setMediaUrl] = useState(null);
    const [mediaType, setMediaType] = useState(''); // Track the type of media uploaded (image, audio, or video)
    const [isHovered, setIsHovered] = useState(false);

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
                
                onUpload(uploadedMediaUrl,uploadedMediaType);
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
            <button
                onClick={() => widgetRef.current.open()}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    backgroundColor: isHovered ? '#e0e0e0' : '#f9f9f9',
                    color: '#171717',
                    padding: '10px 20px',
                    fontSize: '14px',
                    border: '1px solid #848e97',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                }}
            >

                Upload Media
            </button>
            {mediaUrl && (
                <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    backgroundColor: '#f9f9f9',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    <p style={{
                        fontSize: '18px',
                        fontWeight: 'normal',
                        color: '#04060c',
                        marginBottom: '15px'
                    }}>
                        {mediaType === 'image'
                            ? 'Image uploaded successfully!'
                            : mediaType === 'video'
                            ? 'Video uploaded successfully!'
                            : mediaType === 'audio'
                            ? 'Audio uploaded successfully!'
                            : 'File uploaded successfully!'}
                    </p>

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
