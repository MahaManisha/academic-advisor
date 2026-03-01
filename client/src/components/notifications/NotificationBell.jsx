import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheckDouble, FaCircle } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns'; // Optional: Use date-fns or simple fallback

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Toggle dropdown
    const toggleDropdown = () => setIsOpen(prev => !prev);

    // Close dropdown on click outside
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
        // Could also redirect here based on relatedId and type
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDropdown}
                className="relative p-2 rounded-full text-gray-300 hover:text-cyan-400 hover:bg-gray-800 transition-colors focus:outline-none"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-gray-900 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.7)]"
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
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-800/50">
                            <h3 className="text-lg font-bold text-white tracking-wide">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    <FaCheckDouble /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-700 hover:scrollbar-thumb-cyan-500 scrollbar-track-transparent">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                    <FaBell className="text-4xl mb-3 opacity-20" />
                                    <p>No new notifications</p>
                                    <p className="text-xs mt-1">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-800">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 cursor-pointer hover:bg-gray-800/80 transition-colors relative flex gap-3 ${!notification.isRead ? 'bg-cyan-900/10' : ''
                                                }`}
                                        >
                                            {!notification.isRead && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                                            )}

                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center mt-1 text-xs text-gray-500 gap-2">
                                                    <span className="capitalize text-cyan-500/80">
                                                        {notification.type.replace(/_/g, ' ').toLowerCase()}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>

                                            {!notification.isRead && (
                                                <div className="flex items-center justify-center">
                                                    <FaCircle className="text-[10px] text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
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
