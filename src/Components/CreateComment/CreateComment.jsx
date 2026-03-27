import { useForm } from "react-hook-form"; import { Input } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTelegramPlane, FaCamera } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { LuLoaderCircle } from "react-icons/lu";
import { useState } from "react";
import axios from "axios";

export default function CreateComment({ postId }) {

    const [preview, setPreview] = useState(null);

    const form = useForm({ defaultValues: { content: "", image: null } });

    const query = useQueryClient();

    const { register, handleSubmit, reset, watch, setValue } = form;

    const contentValue = watch("content");

    const canSubmit = (contentValue && /[^\s]/.test(contentValue)) || preview !== null;

    async function createCommentRequest(formData) {
        return await axios.post(`https://route-posts.routemisr.com/posts/${postId}/comments`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`
            }
        });
    }

    const { mutate, isPending } = useMutation(
        {
            mutationFn: createCommentRequest,
            onSuccess: async () => {
                await query.invalidateQueries({ queryKey: ['getPostComment', postId] });
                await query.invalidateQueries({ queryKey: ['getSinglePost', postId] });
                await query.invalidateQueries({ queryKey: ['getMyPosts'] });
                await query.invalidateQueries({ queryKey: ['userProfile'] });
                await query.invalidateQueries({ queryKey: ['getAllPosts'] });
                setPreview(null);
                reset();
            },
            onError: (err) => {
                // Helps verify whether the request is failing (if server rejects, refresh will show old data)
                console.error("CreateComment failed:", err);
            },
        });

    function handleCommentData(values) {
        if (!values.content && !values.image) return;
        const formData = new FormData();
        if (values.content) {
            formData.append("content", values.content);
        }
        if (values.image) {
            formData.append("image", values.image);
        } mutate(formData);
    }

    return (
        <form onSubmit={handleSubmit(handleCommentData)}>
            <div className="relative">
                <Input {...register("content")}
                    placeholder="Write Your Comment" type="text"
                    endContent={
                        <button disabled={!canSubmit || isPending} type="submit"
                            className="cursor-pointer rounded-md p-1 hover:bg-gray-100 transition" >
                            {
                                isPending ?
                                    <LuLoaderCircle className="animate-spin text-blue-600" />
                                    :
                                    <FaTelegramPlane className={`${canSubmit ? "text-blue-600" : "text-gray-500 cursor-not-allowed"}`} size={25} />
                            }
                        </button>}
                />
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <label htmlFor="photo-comment" className="cursor-pointer">
                        <FaCamera className="text-blue-500" />
                    </label>
                    <input id="photo-comment" type="file" hidden
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setPreview(URL.createObjectURL(file));
                                setValue("image", file);
                            }
                        }}
                    />
                </div>
                {
                    preview &&
                    (<div className="absolute right-20 -top-1">
                        <img src={preview} className="w-8 h-8 object-cover rounded-md mt-2 " />
                        <button className="absolute top-1 cursor-pointer -left-1 text-white" type="button"
                            onClick={() => {
                                setPreview(null); setValue('image', "")
                            }}
                        >
                            <IoMdCloseCircle />
                        </button>
                    </div>)
                }
            </div>
        </form>
    );
}