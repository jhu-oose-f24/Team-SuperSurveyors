import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    FormControl,
    FormLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { updateUserProfile } from '../services/userService';
import { UploadWidget } from '../services/uploadService';

const EditUserProfileDialog = ({
    show,
    onHide,
    userId,
    displayName,
    photoURL,
    onDisplayNameChange,
    onPhotoURLChange,
    onSave
}) => {
    const [images, setImages] = useState([]);

    const handleSaveChanges = async () => {
        try {
            const updatedUser = await updateUserProfile(userId, displayName, photoURL);
            onSave(updatedUser.displayName, updatedUser.photoURL);
        } catch (error) {
            console.error("Error updating user profile:", error);
        }
    };

    // Handle Enter key press to save changes
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSaveChanges();
            }
        };

        if (show) {
            document.addEventListener('keydown', handleKeyPress);
        } else {
            document.removeEventListener('keydown', handleKeyPress);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [show, displayName, photoURL]);

    // Handle clicking outside to save changes
    const handleCloseAndSave = () => {
        handleSaveChanges();
        onHide();
    };

    // Handle image upload
    const handleUpload = (url) => {
        onPhotoURLChange(url);
    };

    return (
        <Dialog
            open={show}
            onClose={handleCloseAndSave}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{
                pr: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6">
                    Edit User Profile
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onHide}
                    edge="end"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box component="form" sx={{ mt: 2 }}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <FormLabel
                            sx={{ mb: 1, fontSize: '0.875rem', color: 'text.primary' }}
                        >
                            Display Name
                        </FormLabel>
                        <TextField
                            value={displayName}
                            onChange={(e) => onDisplayNameChange(e.target.value)}
                            fullWidth
                            size="medium"
                            variant="outlined"
                            placeholder="Enter display name"
                        />
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <FormLabel
                            sx={{ mb: 1, fontSize: '0.875rem', color: 'text.primary' }}
                        >
                            Upload Profile Image
                        </FormLabel>
                        <Box sx={{ mt: 1 }}>
                            <UploadWidget onUpload={handleUpload} />
                        </Box>
                    </FormControl>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
                <Button
                    variant="outlined"
                    onClick={onHide}
                    sx={{ mr: 1 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSaveChanges}
                    color="primary"
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditUserProfileDialog;