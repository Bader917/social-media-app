import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CurrentPostComment from "../CurrentPostComment/CurrentPostComment.jsx";
import HomePageLoading from "../HomePageLoading/HomePageLoading.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CreateComment from "../CreateComment/CreateComment.jsx";
import { AuthContext } from "../../Context/AuthContext.jsx";
import { useContext, useEffect, useState } from "react";
import TopComment from "../TopComment/TopComment.jsx";
import EditMyPost from "../EditMyPost/EditMyPost.jsx";
import PLACEHOLDER_IMAGE from "/placeHolderImage.jpg";
import { MdModeEditOutline } from "react-icons/md";
import { HiDotsHorizontal } from "react-icons/hi";
import { AiOutlineLike } from "react-icons/ai";
import { AiFillDelete } from "react-icons/ai";
import TimeAgo from "../TimeAgo/TimeAgo.jsx";
import { FaBookmark } from "react-icons/fa";
import { GoComment } from "react-icons/go";
import { FaShare } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

export default function AllPostsData({ post, isPostDetails = false, from }) {
    const { id, body, createdAt, image, user, topComment, likesCount, sharesCount, commentsCount, isShare, sharedPost } = post;
    const { photo, name, _id } = user;
    const { body: shareBody, createdAt: shareCreatedAt, image: shareImage, user: shareUser } = sharedPost || {};
    const { photo: userSharePhoto, name: userShareName, _id: userShereId } = shareUser || {};
    const { userId } = useContext(AuthContext);

    async function getPostComment() {
        return await axios.get(`https://route-posts.routemisr.com/posts/${id}/comments`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
        });
    }

    const navigate = useNavigate();
    const location = useLocation();

    const [isUpdate, setIsUpdate] = useState(false);
    const [optimisticIsLiked, setOptimisticIsLiked] = useState(
        Array.isArray(post.likes) && post.likes.includes(userId)
    );
    const [optimisticLikesCount, setOptimisticLikesCount] = useState(
        typeof likesCount === "number" ? likesCount : 0
    );
    const isLiked = optimisticIsLiked;

    const { data, isLoading } = useQuery({
        queryKey: ['getPostComment', id],
        queryFn: getPostComment,
        enabled: isPostDetails,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
    });

    async function deletePost() {
        return axios.delete(`https://route-posts.routemisr.com/posts/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
        })
    }

    async function PostLikesRequest() {
        return axios.put(`https://route-posts.routemisr.com/posts/${id}/like`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
        })
    }

    const query = useQueryClient();

    const likeMutation = useMutation({
        mutationFn: PostLikesRequest,
        onMutate: async () => {
            await Promise.all([
                query.cancelQueries({ queryKey: ['getAllPosts'] }),
                query.cancelQueries({ queryKey: ['getSinglePost', id] }),
                query.cancelQueries({ queryKey: ['getMyPosts', userId] }),
            ]);

            const prevAllPosts = query.getQueryData(['getAllPosts']);
            const prevSinglePost = query.getQueryData(['getSinglePost', id]);
            const prevMyPosts = query.getQueryData(['getMyPosts', userId]);

            const prevIsLiked = optimisticIsLiked;
            const nextIsLiked = !prevIsLiked;
            setOptimisticIsLiked(nextIsLiked);

            const prevOptimisticLikesCount = optimisticLikesCount;

            setOptimisticLikesCount((prev) =>
                nextIsLiked ? prev + 1 : Math.max(0, prev - 1)
            );

            const applyOptimisticToPost = (p) => {
                if (!p) return p;
                const likesArray = Array.isArray(p.likes) ? p.likes : [];
                const hadLike = likesArray.includes(userId);
                const nextLikes = nextIsLiked
                    ? (hadLike ? likesArray : [userId, ...likesArray])
                    : likesArray.filter((uid) => uid !== userId);

                const currentCount =
                    typeof p.likesCount === "number" ? p.likesCount : likesArray.length;

                const nextCount = nextIsLiked
                    ? currentCount + (hadLike ? 0 : 1)
                    : Math.max(0, currentCount - (hadLike ? 1 : 0));

                return { ...p, likes: nextLikes, likesCount: nextCount };
            };

            // Update Home feed cache: data.data.data.posts[]
            query.setQueryData(['getAllPosts'], (oldData) => {
                const posts = oldData?.data?.data?.posts;
                if (!Array.isArray(posts)) return oldData;

                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        data: {
                            ...oldData.data.data,
                            posts: posts.map((p) => (p.id === id ? applyOptimisticToPost(p) : p)),
                        },
                    },
                };
            });

            // Update post details cache: data.data.data.post
            query.setQueryData(['getSinglePost', id], (oldData) => {
                const postData = oldData?.data?.data?.post;
                if (!postData) return oldData;

                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        data: {
                            ...oldData.data.data,
                            post: applyOptimisticToPost(postData),
                        },
                    },
                };
            });

            // Update my posts cache: data.data.data.posts[]
            query.setQueryData(['getMyPosts', userId], (oldData) => {
                const posts = oldData?.data?.data?.posts;
                if (!Array.isArray(posts)) return oldData;

                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        data: {
                            ...oldData.data.data,
                            posts: posts.map((p) => (p.id === id ? applyOptimisticToPost(p) : p)),
                        },
                    },
                };
            });

            return { prevAllPosts, prevSinglePost, prevMyPosts, prevIsLiked, prevOptimisticLikesCount };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prevAllPosts !== undefined) query.setQueryData(['getAllPosts'], ctx.prevAllPosts);
            if (ctx?.prevSinglePost !== undefined) query.setQueryData(['getSinglePost', id], ctx.prevSinglePost);
            if (ctx?.prevMyPosts !== undefined) query.setQueryData(['getMyPosts', userId], ctx.prevMyPosts);
            if (typeof ctx?.prevOptimisticLikesCount === "number") setOptimisticLikesCount(ctx.prevOptimisticLikesCount);
            if (typeof ctx?.prevIsLiked === "boolean") {
                setOptimisticIsLiked(ctx.prevIsLiked);
            }
        },
        onSettled: () => {
            // Background revalidation (server is source of truth)
            query.invalidateQueries({ queryKey: ['getAllPosts'] });
            query.invalidateQueries({ queryKey: ['getSinglePost', id] });
            query.invalidateQueries({ queryKey: ['getMyPosts', userId] });
        },
    });

    const { mutate } = useMutation({
        mutationFn: deletePost,

        onSuccess: () => {
            toast.success("Post Deleted Successfully");

            query.invalidateQueries({ queryKey: ['getAllPosts'] });
            query.invalidateQueries({ queryKey: ['getMyPosts', userId] });

            if (isPostDetails) {
                if (location.state?.from === "profile") {
                    navigate("/profile");
                } else {
                    navigate("/");
                }
            }
        }
    });

    useEffect(() => {
        setOptimisticIsLiked(
            Array.isArray(post.likes) && post.likes.includes(userId)
        );
    }, [post.likes, userId]);

    useEffect(() => {
        setOptimisticLikesCount(post.likesCount || 0);
    }, [post.likesCount]);

    async function sharePost() {
        return await axios.post(`https://route-posts.routemisr.com/posts/${id}/share`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
        });
    }

    const { mutate: shareMuteate } = useMutation({
        mutationFn: sharePost,

        onMutate: () => {
            toast.loading("Post Will Share", { id: "Share" });
        },

        onSuccess: () => {
            query.invalidateQueries({ queryKey: ['getAllPosts'] });
            query.invalidateQueries({ queryKey: ['getMyPosts', userId] });
            toast.success("Post Shared Successfully", { id: "Share" });
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    });

    return (
        <Card className="w-full flex items-center justify-center my-2 p-2">
            <CardHeader className="flex gap-3 justify-between items-center p-2">
                <div className="flex gap-3">
                    <img
                        height={40}
                        width={40}
                        alt="heroui logo"
                        className="rounded-full flex self-start mt-2 h-10 w-10 object-contain"
                        src={photo}
                        onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
                    />

                    <div className="flex flex-col">

                        <Link className="text-lg font-semibold hover:underline decoration-2"
                            to={`/profile/${_id}`}
                        >
                            {name}
                        </Link>

                        <p className="text-small text-default-600" >
                            {TimeAgo(createdAt)}
                        </p>

                    </div>
                </div>

                <button className="hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                    <Dropdown>
                        <DropdownTrigger>
                            <HiDotsHorizontal className="focus:outline-none" size={25} />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Static Actions">
                            {
                                userId === _id &&
                                <DropdownItem key="edit">
                                    <button className="w-full cursor-pointer flex items-center justify-between px-2"
                                        onClick={() => setIsUpdate(true)}
                                    >
                                        <p className="font-semibold">Edit Post</p>
                                        <MdModeEditOutline size={25} />
                                    </button>
                                </DropdownItem>
                            }

                            {
                                userId !== _id &&
                                <DropdownItem key="save">
                                    <div className="flex items-center justify-between px-2">
                                        <p className="font-semibold">Save Post</p>
                                        <FaBookmark size={25} />
                                    </div>
                                </DropdownItem>
                            }

                            {
                                userId === _id &&
                                <DropdownItem key="delete" className="text-danger" color="danger">
                                    <button onClick={mutate} className="w-full flex cursor-pointer items-center justify-between px-2">
                                        <p className="font-semibold">Delete</p>
                                        <AiFillDelete size={25} />
                                    </button>
                                </DropdownItem>
                            }
                        </DropdownMenu>
                    </Dropdown>
                </button>
            </CardHeader>
            <CardBody className="p-1 w-full overflow-hidden">

                {body && (
                    <p className="my-1">{body}</p>
                )}

                {image && (
                    <img
                        className="rounded-md object-contain w-full flex items-center justify-center max-h-75"
                        src={image}
                        alt={body}
                    />
                )}

                {isShare && sharedPost && (
                    <div className="border border-gray-100 rounded-md bg-gray-50">
                        <div className="flex gap-3 mb-5">
                            <img
                                height={40}
                                width={40}
                                alt="heroui logo"
                                className="rounded-full flex self-start mt-2 h-10 w-10 object-contain"
                                src={userSharePhoto}
                                onError={(e) => e.target.src = PLACEHOLDER_IMAGE}
                            />

                            <div className="flex flex-col">

                                <Link className="text-lg font-semibold hover:underline decoration-2"
                                    to={`/profile/${userShereId}`}
                                >
                                    {userShareName}
                                </Link>

                                <p className="text-small text-default-600" >
                                    {TimeAgo(shareCreatedAt)}
                                </p>

                            </div>
                        </div>

                        {shareBody && (
                            <p className="m-1">{shareBody}</p>
                        )}

                        {sharedPost.image && (
                            <img
                                className="rounded-md object-contain w-full flex items-center justify-center max-h-75"
                                src={shareImage}
                                alt={shareBody}
                            />
                        )}
                    </div>
                )}
            </CardBody>
            <Divider />

            <CardFooter className="p-1">
                <div className="w-full flex justify-between items-center">
                    <div className="flex items-center justify-center relative">
                        <button className="flex items-center px-1 py-1 rounded-sm cursor-pointer"
                            onClick={() => likeMutation.mutate()}
                        >
                            {
                                isLiked && <AiOutlineLike size={25} color="blue" />
                            }
                            {
                                !isLiked && <AiOutlineLike size={25} color="black" />
                            }
                        </button>

                        {
                            optimisticLikesCount > 0 &&
                            <div className="absolute flex items-center -top-1.5 left-7">
                                <p className="py-2 mb-1 font-semibold">{optimisticLikesCount}</p>
                            </div>
                        }
                    </div>

                    <div className="flex items-center justify-center relative">
                        <Link to={`/postDetails/${id}`} state={{ from }}>
                            <button className="flex items-center px-1 py-1 rounded-sm cursor-pointer hover:bg-gray-300 transition-all">
                                <GoComment />
                            </button>
                        </Link>

                        {
                            commentsCount > 0 &&
                            <div className="absolute flex items-center justify-center -top-2.5 left-5 w-full">
                                <p className="py-2 mb-1 font-semibold">{commentsCount}</p>
                            </div>
                        }
                    </div>

                    <div className="flex items-center justify-center relative">
                        <button className="flex items-center px-1 py-1 rounded-sm cursor-pointer hover:bg-gray-300 transition-all"
                            onClick={shareMuteate}
                        >
                            <FaShare className="mx-5" />

                            {
                                sharesCount > 0 &&
                                <div className="absolute flex items-center justify-center -top-3 left-5 w-full">
                                    <p className="py-2 mb-1 font-semibold">{sharesCount}</p>
                                </div>
                            }
                        </button>
                    </div>
                </div>
            </CardFooter>
            <Divider />

            <div className="p-2 w-full">
                <CreateComment postId={id} />
            </div>

            {
                commentsCount > 1 && !isPostDetails &&
                <div className="flex items-center justify-start w-full px-2">
                    <Link className="p-1 font-semibold rounded-md text-gray-400 hover:underline hover:underline-offset-5 cursor-pointer"
                        to={`/postDetails/${id}`}
                    >
                        show all comments
                    </Link>
                </div>
            }

            {
                topComment && <div className="flex items-baseline self-start w-full">
                    <TopComment post={post} />
                </div>
            }

            {
                isPostDetails && isLoading && (
                    <HomePageLoading />
                )
            }

            {!isLoading &&
                data?.data?.data?.comments?.length === 0 && (
                    <p className="text-center text-gray-500 my-4">
                        No comments yet.
                    </p>
                )}

            {isPostDetails &&
                !isLoading &&
                data?.data?.data?.comments
                    ?.filter((c) => c._id !== topComment?._id)
                    ?.map((curComment) => (
                        <CurrentPostComment
                            key={curComment._id}
                            comment={curComment}
                        />
                    ))
            }

            {
                isUpdate &&
                <div className="absolute inset-0 flex items-center justify-center">
                    <EditMyPost isUpdate={isUpdate} setIsUpdate={setIsUpdate} post={post} />
                </div>
            }
        </Card>
    );
}