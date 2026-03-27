import { CardHeader, CardFooter, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import PLACEHOLDER_IMAGE from "/placeHolderImage.jpg";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import TimeAgo from "../TimeAgo/TimeAgo";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { AiFillDelete } from "react-icons/ai";
import { HiDotsHorizontal } from "react-icons/hi";


export default function TopComment({ post }) {
    const { topComment } = post;
    const { commentCreator, content, createdAt, image, post: postId, _id: commentId, likes } = topComment || {};
    const { name, photo, _id } = commentCreator || {};
    const { userId } = useContext(AuthContext);

    const isUserLiked = likes?.some(like => like === userId);
    const [likesCount, setLikesCount] = useState(likes?.length || 0);
    const [isLiked, setIsLiked] = useState(isUserLiked);

    async function commentLike() {
        await axios.put(`https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/like`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
        });
    }

    const { mutate } = useMutation({
        mutationFn: commentLike,
        onMutate: async () => {
            const previousLiked = isLiked;
            const previousCount = likesCount;

            // optimistic update
            if (isLiked) {
                // unlike
                setIsLiked(false);
                setLikesCount(prev => prev - 1);
            } else {
                // like
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
            }

            return { previousLiked, previousCount };
        },

        onError: (err, variables, context) => {
            setIsLiked(context.previousLiked);
            setLikesCount(context.previousCount);
        },

    });

    useEffect(() => {
        setIsLiked(isUserLiked);
        setLikesCount(likes?.length || 0);
    }, [likes]);

    async function deleteComment({ postId, commentId }) {
        return await axios.delete(`https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
        });
    }

    const queryClient = useQueryClient();

    const { mutate: deleteCommentMutate } = useMutation({
        mutationFn: deleteComment,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getPostComment', postId] });
            queryClient.invalidateQueries({ queryKey: ['getSinglePost', postId] });
            queryClient.invalidateQueries({ queryKey: ['getAllPosts'] });
        }
    });

    return (
        <CardFooter className="w-full p-0">
            <CardHeader className="flex gap-3 relative p-1">

                {
                    userId === _id && <button className="absolute hover:bg-gray-200 p-2 rounded-full cursor-pointer right-1 top-1">
                        <Dropdown>
                            <DropdownTrigger>
                                <HiDotsHorizontal className="focus:outline-none" size={25} />
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Static Actions">
                                <DropdownItem key="delete" className="text-danger" color="danger">
                                    <button onClick={() => deleteCommentMutate({ postId, commentId })} className="w-full flex cursor-pointer items-center justify-between px-2">
                                        <p className="font-semibold">Delete Comment</p>
                                        <AiFillDelete size={25} className="mx-2" />
                                    </button>
                                </DropdownItem>

                            </DropdownMenu>
                        </Dropdown>
                    </button>
                }
                <img
                    height={40}
                    width={40}
                    alt="heroui logo"
                    className="rounded-sm flex self-start mt-2"
                    src={photo}
                    onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
                />

                <div className="flex flex-col">
                    <Link className="text-lg font-semibold hover:underline decoration-2"
                        to={`/profile/${_id}`}
                    >
                        {name}
                    </Link>

                    <p className="text-small text-default-500">{TimeAgo(createdAt)}</p>
                    <div className="p-2 bg-gray-100 rounded-md mt-2">
                        {
                            content &&
                            <p>{content}</p>
                        }


                        {
                            image && <img src={image} alt="Comment Image" className="w-70" />
                        }

                    </div>

                    <div className="my-2 flex">
                        <button className="p-1">Replay</button>
                        <div className="p-1 mx-2">
                            <div className="flex items-center justify-center">
                                <button onClick={mutate}>
                                    <p className="hover:underline cursor-pointer">like</p>
                                </button>
                                <FaHeart size={20} className={`ms-3 me-1 text-gray-200 ${isLiked ? "text-red-500" : "text-gray-100"}`} />
                                <div>{likesCount || ''}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
        </CardFooter>
    )
}
