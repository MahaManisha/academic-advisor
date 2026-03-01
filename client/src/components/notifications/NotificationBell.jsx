import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheckDouble, FaCircle } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import './NotificationBell.css';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        setIsOpen(false);
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDropdown}
                className="header-notifications"
            >
                <FaBell className="bell-icon" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="notification-badge-dynamic"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="notification-dropdown"
                    >
                        <div className="notification-header">
                            <h3 className="notification-title">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="mark-all-read-btn"
                                >
                                    <FaCheckDouble /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="notification-empty">
                                    <FaBell className="empty-icon" />
                                    <p>No new notifications</p>
                                    <span className="empty-subtitle">You're all caught up!</span>
                                </div>
                            ) : (
                                <div className="notification-items">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`notification-item ${!notification.isRead ? 'unread' : 'read'}`}
                                        >
                                            {!notification.isRead && (
                                                <div className="unread-indicator-bar"></div>
                                            )}

                                            <div className="notification-content">
                                                <p className="notification-message">
                                                    {notification.message}
                                                </p>
                                                <div className="notification-meta">
                                                    <span className="notification-type">
                                                        {notification.type.replace(/_/g, ' ').toLowerCase()}
                                                    </span>
                                                    <span className="meta-dot">•</span>
                                                    <span className="notification-time">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>

                                            {!notification.isRead && (
                                                <div className="unread-circle-container">
                                                    <FaCircle className="unread-circle" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
