import { useEffect, useRef } from 'react';

export const UploadWidget = () => {
    const cloudinaryRef = useRef();
    const widgetRef = useRef();

    useEffect(() => {
        cloudinaryRef.current = window.cloudinary;
        widgetRef.current = cloudinaryRef.current.createUploadWidget({
            cloudName: 'dkohfegpk',
            uploadPreset: 'default'
        }, function (error, result) {
            console.log(result);
            // Handle the result or error here
        });
    }, []);

    return (
        <div>
            <button onClick={() => widgetRef.current.open()}>
                Upload
            </button>
        </div>
    );
};

