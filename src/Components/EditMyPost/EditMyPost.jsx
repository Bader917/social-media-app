import { Card, CardHeader, CardBody, CardFooter, Divider, Avatar } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCamera } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";

export default function EditMyPost({ isUpdate, setIsUpdate, post }) {

    const { user = {}, body, image, id } = post || {};
    const { name, photo } = user;

    const queryClient = useQueryClient();

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(image || null);
    const [postBody, setPostBody] = useState(body || "");

    function prepareData() {
        const formData = new FormData();

        formData.append("body", postBody);

        if (imageFile) {
            formData.append("image", imageFile);
        }

        return formData;
    }

    function handleImageChange(e) {
        const file = e.target.files[0];

        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    function closeModel() {

        if (imageFile) {
            URL.revokeObjectURL(preview);
        }

        setIsUpdate(false);
    }

    async function EditPost() {
        const response = await axios.put(
            `https://route-posts.routemisr.com/posts/${id}`,
            prepareData(),
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                }
            }
        );

        return response;
    }

    const { isPending, mutate } = useMutation({
        mutationFn: EditPost,

        onSuccess: () => {

            toast.success("Post updated successfully");

            queryClient.invalidateQueries({
                queryKey: ['getMyPosts']
            });

            queryClient.invalidateQueries({
                queryKey: ['getAllPosts']
            });

            queryClient.invalidateQueries({
                queryKey: ['getSinglePost', id]
            });

            closeModel();
        },

        onError: () => {
            toast.error("Something went wrong");
        }
    });

    function handleSave() {
        const bodyChanged = postBody !== body;
        const imageChanged = imageFile !== null;

        if (!bodyChanged && !imageChanged) {
            toast("No changes detected");
            return;
        }

        mutate();
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white text-black rounded-lg w-full sm:w-[90%] lg:w-[55%] max-h-[90vh] overflow-auto">

                <Card className="my-auto max-w-full p-2">

                    <CardHeader className="flex gap-3 items-center justify-center">

                        <button
                            className="p-1 rounded-full cursor-pointer bg-gray-200 absolute top-2 left-1"
                            onClick={closeModel}
                        >
                            <IoClose size={25} />
                        </button>

                        <h3 className="text-2xl">Edit Post</h3>

                    </CardHeader>

                    <Divider />

                    <CardBody>

                        <div>
                            <h2>{name}</h2>

                            <div className="h-10 w-10 py-2">
                                <Avatar
                                    className="w-full ms-5 rounded-full"
                                    isBordered
                                    src={photo}
                                    alt={name}
                                />
                            </div>
                        </div>

                        <div className="py-4">

                            <Divider />

                            <input
                                type="text"
                                value={postBody}
                                onChange={(e) => setPostBody(e.target.value)}
                                className="w-full p-2 focus:outline-0"
                            />

                            {preview && (
                                <div className="mt-5">
                                    <img
                                        src={preview}
                                        className="max-h-80 border-2 border-gray-200 rounded-md object-contain"
                                        alt="preview"
                                    />
                                </div>
                            )}

                        </div>

                        <Divider />

                        <div className="rounded-sm mt-1 bg-gray-300 p-2 flex items-center">

                            <label htmlFor="post_image" className="cursor-pointer w-10 rounded-sm">
                                <FaCamera size={30} />
                            </label>

                            <input
                                name="post_image"
                                id="post_image"
                                type="file"
                                hidden
                                onChange={handleImageChange}
                            />

                        </div>

                    </CardBody>

                    <CardFooter>

                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="w-full text-2xl disabled:bg-gray-300 text-center bg-primary-500 text-white p-2 rounded-md"
                        >

                            {isPending ? (
                                <AiOutlineLoading3Quarters className="animate-spin w-full text-primary-500 text-center" />
                            ) : (
                                "Save Post"
                            )}

                        </button>

                    </CardFooter>

                </Card>

            </div>
        </div>
    );
}