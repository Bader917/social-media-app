import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import HomePageLoading from "../HomePageLoading/HomePageLoading";
import GetMyPosts from "../GetMyPosts/GetMyPosts";
import PostCraete from "../PostCraete/PostCraete";
import { BiCamera } from "react-icons/bi";
import toast from "react-hot-toast";
import { useRef } from "react";
import axios from "axios";

export default function MyProfile() {
  async function getMyProfile() {
    const res = await axios.get(
      "https://route-posts.routemisr.com/users/profile-data",
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` }
      }
    );

    return res.data.data.user;
  }

  const { data, isLoading } = useQuery({
    queryFn: getMyProfile,
    queryKey: ["myProfilePosts"],
    retry: 3,
  });

  const { name, photo, followersCount, followingCount, username, id, createdAt } = data || {};
  const month = new Date(createdAt).toLocaleString('en-US', { month: 'long' });
  const year = new Date(createdAt).getFullYear();

  const imageFileRef = useRef(null);

  function prepareData() {
    const formData = new FormData();

    const file = imageFileRef.current?.files?.[0];
    if (file) formData.append('photo', file);

    return formData;
  }

  async function changePhotoProfile() {
    return await axios.put(`https://route-posts.routemisr.com/users/upload-photo`, prepareData(), {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
    })
  }

  const query = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: changePhotoProfile,

    onMutate: () => {
      toast.loading("Uploading image...", { id: "upload" });
    },

    onSuccess: (res) => {
      const newImage = res.data.data.photo;

      query.setQueryData(['myProfilePosts'], (oldData) => {
        // `oldData` may be undefined if the mutation resolves before the first query finishes
        if (!oldData) return { photo: newImage };
        return { ...oldData, photo: newImage };
      });

      query.invalidateQueries({ queryKey: ['getMyPosts', id] });

      // Allow selecting the same file again by clearing the input
      if (imageFileRef.current) {
        imageFileRef.current.value = '';
      }
      toast.success("Image updated ✅", { id: "upload" });
    }
  })

  return (
    <>
      {
        isLoading ? <HomePageLoading /> :
          <div className="mx-auto w-full max-w-2xl sm:max-w-2xl lg:max-w-2xl px-2 sm:px-4">
            {/* Profile header */}
            <div className="rounded-sm w-full flex flex-col items-center mb-3 sm:mb-4 text-center">
              <div className="w-28 h-28 sm:w-40 sm:h-40 p-3 sm:p-5 relative">
                <img
                  src={photo}
                  className="bg-amber-50 rounded-full w-full h-full object-cover"
                  alt={`${name} Profile Image`}
                />

                <div className="absolute bottom-5 end-0">
                  <input type="file" ref={imageFileRef} id="change-photo" hidden
                    onChange={() => mutate()}
                  />
                  <label htmlFor="change-photo">
                    <BiCamera size={30} className="cursor-pointer" />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-1 sm:mb-2 text-lg sm:text-xl">{name}</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600">@{username || id}</p>

              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 my-2 text-sm sm:text-base">
                <p>Followers {followersCount}</p>
                <p>Following {followingCount}</p>
              </div>

              <p className="text-xs sm:text-sm text-gray-600">Created At {month} - {year}</p>
            </div>

            {/* Create post */}
            <div className="flex items-center justify-center mx-auto my-2 w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl px-2 sm:px-4">
              <PostCraete queryKey={['myProfilePosts']} />
            </div>

            {/* Posts list */}
            <div className="flex items-center justify-center mx-auto my-2 w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl px-2 sm:px-4">
              <GetMyPosts userid={id} />
            </div>
          </div>
      }
    </>
  )
}