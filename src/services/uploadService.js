import { useEffect, useRef, useState } from 'react';
import { db, addDoc, collection } from '../firebase';

// export const UploadWidget = () => {
export const UploadWidget = ({ onUpload }) => {
    const cloudinaryRef = useRef();
    const widgetRef = useRef();
    const [imageUrl, setImageUrl] = useState(null); // 添加状态来存储图片 URL

    useEffect(() => {
        cloudinaryRef.current = window.cloudinary;
        widgetRef.current = cloudinaryRef.current.createUploadWidget({
            cloudName: 'dkohfegpk',
            uploadPreset: 'default'
        }, async function (error, result) {
            if (!error && result && result.event === "success") {
                const uploadedImageUrl = result.info.secure_url;
                onUpload(uploadedImageUrl); // 将图片 URL 传递给父组件
                setImageUrl(uploadedImageUrl); // 将图片 URL 存储在组件状态中
                console.log("Uploaded Image URL:", uploadedImageUrl);

                try {
                    // 将图片 URL 存储到 Firebase Firestore
                    await addDoc(collection(db, "images"), { url: uploadedImageUrl });
                    console.log("Image URL saved to Firebase");
                } catch (e) {
                    console.error("Error adding document: ", e);
                }
            }
        });
    }, [onUpload]);

    return (
        <div>
            <button onClick={() => widgetRef.current.open()}>
                Upload
            </button>
            {imageUrl && (
                <div>
                    <h3>Uploaded Image:</h3>
                    <img src={imageUrl} alt="Uploaded" style={{ width: "300px", height: "auto" }} />
                </div>
            )}
        </div>
    );
};
