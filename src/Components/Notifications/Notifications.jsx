import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthContext } from '../../Context/AuthContext';
import { useContext, useEffect, useRef, useState } from 'react';
import { IoMdNotifications } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { FiLoader } from "react-icons/fi";
import axios from 'axios';

export default function Notifications() {
    const { userToken } = useContext(AuthContext);
    const noteRef = useRef(null);
    const buttonRef = useRef(null);

    async function getNotes() {
        return await axios.get(`https://route-posts.routemisr.com/notifications`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
        })
    };

    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotes,
        enabled: !!userToken
    });

    const { notifications } = data?.data?.data || {};
    const navigate = useNavigate();

    const { mutate: markAsRead } = useMutation({
        mutationFn: (id) => {
            return axios.patch(
                `https://route-posts.routemisr.com/notifications/${id}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                    },
                }
            );
        },
    });

    function getPostId(note) {
        if (note.entityType === "comment") {
            return note.entity.post;
        }

        if (note.entityType === "post") {
            return note.entity.id || note.entity._id;
        }

        return null;
    }

    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const [readMsg, setReadMsg] = useState(false);
    const [localNotifications, setLocalNotifications] = useState([]);
    const unreadCount = localNotifications.filter((note) => !note.isRead).length;

    useEffect(() => {
        if (notifications) {
            setLocalNotifications(notifications);
        }
    }, [notifications]);

    const filteredNotifications = localNotifications?.filter((note) => {
        if (readMsg) return note.isRead === false;
        return true;
    });

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                noteRef.current &&
                !noteRef.current.contains(e.target) &&
                !buttonRef.current.contains(e.target)
            ) {
                setIsNoteOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative mt-1">
            <button className="flex items-center justify-center cursor-pointer"
                ref={buttonRef}
                onClick={() => {
                    setIsNoteOpen(!isNoteOpen);
                }}
            >
                <div className="p-1 bg-gray-100 rounded-full">
                    <IoMdNotifications size={25} />
                </div>

                {
                    unreadCount > 0 &&
                    <div className="absolute bg-red-500 -top-1 -right-1.5 h-5 w-5 border-3 flex items-center justify-center border-white rounded-full">
                        <span className=" block text-white text-[16px]">
                            {isLoading ? <FiLoader className='animate-spin' /> : unreadCount}
                        </span>
                    </div>
                }
            </button>

            {
                isNoteOpen &&
                <div
                    className="absolute p-2 top-10 rounded-lg -right-17 h-120 w-70 bg-white shadow-2xl"
                    ref={noteRef}
                >
                    <div className='mb-3'>
                        <button className={`px-2 py-1 mx-2 rounded-lg text-[20px] cursor-pointer ${readMsg ? "bg-gray-200" : "bg-blue-300"}`}
                            onClick={() => setReadMsg(false)}
                        >
                            All
                        </button>
                        <button className={`px-2 py-1 mx-2 rounded-lg text-[20px] cursor-pointer ${readMsg ? "bg-blue-300" : "bg-gray-200"}`}
                            onClick={() => setReadMsg(true)}
                        >
                            Unread
                        </button>
                    </div>

                    <div className="overflow-y-auto h-[90%] relative z-10">
                        {
                            filteredNotifications?.length > 0 ? (
                                filteredNotifications.map((note) => (
                                    <div key={note._id}
                                        className={`flex items-start gap-2 p-2 border-b hover:bg-gray-100 cursor-pointer rounded-sm ${note.isRead ? "bg-white" : "bg-gray-200"}`}
                                        onClick={() => {
                                            setIsNoteOpen(false);

                                            const postId = getPostId(note);

                                            if (postId) {
                                                navigate(`/postDetails/${postId}`);
                                            }

                                            if (!note.isRead) {
                                                setLocalNotifications((prev) =>
                                                    prev.map((item) =>
                                                        item._id === note._id ? { ...item, isRead: true } : item
                                                    )
                                                );

                                                markAsRead(note._id);
                                            }
                                        }}
                                    >

                                        <img
                                            src={note.actor.photo}
                                            alt=""
                                            className="w-10 h-10 rounded-full"
                                        />

                                        <div>
                                            <p className="text-sm">
                                                <span className="font-bold">{note.actor.name}</span>{" "}

                                                {
                                                    note.type === "like_post" && "liked your post ❤️"
                                                }
                                                {
                                                    note.type === "comment_post" && "commented on your post 💬"
                                                }
                                                {
                                                    note.type === "share_post" && "shared your post 🔁"
                                                }
                                                {
                                                    note.type === "follow_user" && "started following you 👤"
                                                }
                                                {
                                                    note.type === "mention_user" && "mention you @"
                                                }
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {new Date(note.createdAt).toLocaleString()}
                                            </p>
                                        </div>

                                        {
                                            !note.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            )
                                        }

                                    </div>
                                ))
                            ) : (
                                <p className="text-center mt-5 text-gray-400">
                                    No Notifications
                                </p>
                            )
                        }
                    </div>
                </div>
            }
        </div>
    )
};