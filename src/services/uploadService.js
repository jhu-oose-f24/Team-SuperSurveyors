import { useEffect, useRef, useState } from 'react';

export const UploadWidget = () => {
    const cloudinaryRef = useRef();
    const widgetRef = useRef();
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        // Initialize Cloudinary widget
        cloudinaryRef.current = window.cloudinary;
        widgetRef.current = cloudinaryRef.current.createUploadWidget({
            cloudName: 'dkohfegpk',
            uploadPreset: 'default'
        }, function (error, result) {
            if (error) {
                console.error('Error during upload:', error);
            } else if (result && result.event === 'success') {
                // The image URL is available in result.info.url
                setImageUrl(result.info.secure_url);  // Secure URL for the uploaded image
                console.log('Upload successful! Image URL:', result.info.secure_url);
            }
        });
    }, []);

    return (
        <div>
            <button onClick={() => widgetRef.current.open()}>
                Upload
            </button>
            {imageUrl && (
                <div>
                    <img src={imageUrl} alt="Uploaded" style={{ width: '300px' }} />
                </div>
            )}
        </div>
    );
};
