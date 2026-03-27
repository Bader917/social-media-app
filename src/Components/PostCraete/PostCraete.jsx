import { Avatar, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Divider } from '@heroui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { IoCloseSharp } from "react-icons/io5";
import { FaCamera } from "react-icons/fa";
import { LuLoader } from "react-icons/lu";
import axios from 'axios';

export default function PostCraete() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isImageUploaded, setIsImageUploaded] = useState(null);
  const [text, setText] = useState('');
  const imageFileRef = useRef(null);
  const closeModalRef = useRef(null);
  const query = useQueryClient();

  function prepareData() {
    const formData = new FormData();

    if (!text.trim() && !imageFileRef.current?.files[0]) return;

    if (text.trim()) {
      formData.append('body', text);
    }

    if (imageFileRef.current?.files[0]) {
      formData.append('image', imageFileRef.current.files[0]);
    }

    return formData;
  }

  function handleImagePreview(e) {
    const imagePath = URL.createObjectURL(e.target.files[0]);
    setIsImageUploaded(imagePath);
  }

  function handleRemoveImage() {
    setIsImageUploaded(null);
    imageFileRef.current.value = '';
  }

  async function CreatePostData() {
    try {
      return await axios.post(`https://route-posts.routemisr.com/posts`, prepareData(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
      });
    }
    catch (err) {
      console.log(err);
    }
  }

  const { userId } = useContext(AuthContext);

  // Fetch user profile
  const { data } = useQuery({
    queryFn: async () =>
      axios.get(`https://route-posts.routemisr.com/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      }),
    queryKey: ["userProfile"],
    retry: 3,
    enabled: !!userId,
  });

  const { user } = data?.data?.data || {};
  const { name, photo } = user || {};

  const { isPending, mutate } = useMutation({
    mutationFn: CreatePostData,

    onSuccess: async () => {
      await query.invalidateQueries({
        queryKey: ['getAllPosts']
      });

      await query.invalidateQueries({
        queryKey: ['myProfilePosts']
      });

      setIsImageUploaded(null);
      setText('');
      imageFileRef.current.value = '';
      closeModalRef.current();
    }
  });

  const isDisabled = isPending || (!text.trim() && !imageFileRef.current?.files[0]);

  return (
    <div className='py-3 bg-white w-full rounded-md'>
      <div className='flex items-center justify-between'>
        <div className='w-full mx-3'>
          <div className='bg-gray-200 p-2 rounded-md'>
            <input readOnly onClick={onOpen} type="text" className='cursor-pointer outline-0 w-full' placeholder={`What's the new ${name?.split(' ')[0] || ''}..?`} />
          </div>
          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => {
                closeModalRef.current = onClose;
                return (
                  <>
                    <ModalHeader className="flex items-center flex-col gap-1">
                      <h3>Create Post</h3>
                    </ModalHeader>

                    <Divider />

                    <ModalBody className="relative">

                      {/* Overlay Loader */}
                      {isPending && (
                        <div className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center z-50">
                          <span className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <Avatar isBordered size="md" src={photo} />
                        <h3 className="mx-5 text-[24px]">{name}</h3>
                      </div>

                      <div className="w-full">
                        <input
                          disabled={isPending}
                          className="w-full px-1 py-2 outline-0"
                          type="text"
                          placeholder={`What's the new ${name?.split(' ')[0] || ''}..?`}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                        />
                      </div>

                      {isImageUploaded && (
                        <div className="relative p-2 w-full h-60 flex items-center justify-center">
                          <img
                            src={isImageUploaded}
                            className="rounded-lg object-contain w-full h-full"
                          />

                          <button
                            className='absolute cursor-pointer -top-2 right-0 p-1 bg-gray-200 rounded-full'
                            onClick={handleRemoveImage}
                          >
                            <IoCloseSharp />
                          </button>
                        </div>
                      )}

                      <div className="p-2 bg-gray-100 w-10 rounded-md">
                        <label htmlFor="post_iamge" className="cursor-pointer">
                          <FaCamera size={30} />
                        </label>

                        <input
                          disabled={isPending}
                          type="file"
                          id="post_iamge"
                          hidden
                          onChange={handleImagePreview}
                          ref={imageFileRef}
                        />
                      </div>

                    </ModalBody >

                    <Divider />

                    <ModalFooter>
                      <button
                        disabled={isDisabled}
                        className={`w-full font-bold p-2 rounded-md text-white 
                          ${isDisabled
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-primary-500 cursor-pointer'
                          }`}
                        onClick={() => mutate()}
                      >

                        <div className='flex items-center justify-center'>
                          {
                            isPending ?
                              <LuLoader className='animate-spin text-primary-500' />
                              :
                              <p className='font-semibold'>Create Post</p>
                          }
                        </div>
                      </button>
                    </ModalFooter>
                  </>
                );
              }}
            </ModalContent>
          </Modal>
        </div>
        <div className='w-10 h-10 mx-3 mt-1'>
          <Avatar isBordered size="sm" src={photo} />
        </div>
      </div>
    </div >
  )
}