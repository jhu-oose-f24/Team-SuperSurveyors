// src/components/Question.js
import React from 'react';
import { Form, Button, Image } from 'react-bootstrap';
import DeleteIcon from '@mui/icons-material/Delete'; // 使用 MUI 的 DeleteIcon
import { UploadWidget } from '../../services/uploadService';
import { IconButton } from '@mui/material'; // 使用 MUI 的 IconButton

const Question = ({ question, onAnswerChange, onMediaChange, value, disabled = false, showTitle = true }) => {

    const handleChange = (e) => {
        if (question.type === 'checkbox') {
            const { value } = e.target;
            const newValues = value
                ? value.split(',') // 假设值是以逗号分隔的字符串
                : [];
            onAnswerChange(question.id, newValues);
            return;
        }

        const { value } = e.target;
        onAnswerChange(question.id, value);
    };

    const handleMediaUpload = (url, mediaType) => {
        const updatedMedia = { ...question.media };
        if (mediaType === 'image') {
            updatedMedia.images = [...updatedMedia.images, url];
        } else if (mediaType === 'video') {
            updatedMedia.videos = [...updatedMedia.videos, url];
        } else if (mediaType === 'audio') {
            updatedMedia.audios = [...updatedMedia.audios, url];
        }
        onMediaChange(updatedMedia);
    };

    const removeMedia = (url, mediaType) => {
        const updatedMedia = { ...question.media };
        if (mediaType === 'image') {
            updatedMedia.images = updatedMedia.images.filter(item => item !== url);
        } else if (mediaType === 'video') {
            updatedMedia.videos = updatedMedia.videos.filter(item => item !== url);
        } else if (mediaType === 'audio') {
            updatedMedia.audios = updatedMedia.audios.filter(item => item !== url);
        }
        onMediaChange(updatedMedia);
    };

    return (
        <div className="mb-3">
            {showTitle && <Form.Label>{question.text}</Form.Label>}
            {question.type === 'text' && (
                <Form.Control
                    id={question.id}
                    type="text"
                    placeholder={disabled ? "Responders will answer with text" : "Your answer"}
                    onChange={handleChange}
                    disabled={disabled}
                    value={value}
                />
            )}
            {question.type === 'radio' && (
                <div>
                    {question.options.map((option, index) => (
                        <Form.Check
                            key={index}
                            type="radio"
                            label={option}
                            name={`formHorizontalRadios-${question.id}`}
                            id={`formHorizontalRadios-${question.id}-${index}`}
                            value={option}
                            onChange={handleChange}
                            disabled={disabled}
                            checked={value === option}
                        />
                    ))}
                </div>
            )}
            {question.type === 'checkbox' && (
                <div>
                    {question.options.map((option, index) => (
                        <Form.Check
                            key={index}
                            type="checkbox"
                            label={option}
                            name={`formHorizontalCheck-${question.id}`}
                            id={`formHorizontalCheck-${question.id}-${index}`}
                            value={option}
                            onChange={handleChange}
                            disabled={disabled}
                            checked={value?.includes(option)}
                        />
                    ))}
                </div>
            )}

            {/* 媒体上传部分 */}
            <div className="mt-3">
                <UploadWidget onUpload={handleMediaUpload} />
            </div>

            {/* 显示已上传的媒体 */}
            <div className="mt-3">
                {/* 显示图片 */}
                {question.media.images && question.media.images.length > 0 && (
                    <div>
                        <h6>Images:</h6>
                        <div className="d-flex flex-wrap">
                            {question.media.images.map((imgUrl, idx) => (
                                <div key={idx} className="position-relative me-2 mb-2">
                                    <Image src={imgUrl} thumbnail width={100} height="auto" />
                                    <IconButton
                                        size="small"
                                        className="position-absolute top-0 end-0"
                                        onClick={() => removeMedia(imgUrl, 'image')}
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                                    >
                                        <DeleteIcon fontSize="small" color="error" />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 显示视频 */}
                {question.media.videos && question.media.videos.length > 0 && (
                    <div>
                        <h6>Videos:</h6>
                        <div className="d-flex flex-wrap">
                            {question.media.videos.map((vidUrl, idx) => (
                                <div key={idx} className="position-relative me-2 mb-2">
                                    <video width="100" controls>
                                        <source src={vidUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <IconButton
                                        size="small"
                                        className="position-absolute top-0 end-0"
                                        onClick={() => removeMedia(vidUrl, 'video')}
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                                    >
                                        <DeleteIcon fontSize="small" color="error" />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 显示音频 */}
                {question.media.audios && question.media.audios.length > 0 && (
                    <div>
                        <h6>Audios:</h6>
                        <div className="d-flex flex-wrap">
                            {question.media.audios.map((audUrl, idx) => (
                                <div key={idx} className="position-relative me-2 mb-2">
                                    <audio controls>
                                        <source src={audUrl} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                    <IconButton
                                        size="small"
                                        className="position-absolute top-0 end-0"
                                        onClick={() => removeMedia(audUrl, 'audio')}
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                                    >
                                        <DeleteIcon fontSize="small" color="error" />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

export default Question;
