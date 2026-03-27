import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import HomePageLoading from "../HomePageLoading/HomePageLoading";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { useContext, useEffect, useState } from "react";
import GetMyPosts from "../GetMyPosts/GetMyPosts";
import { IoMdCheckmark } from "react-icons/io";
import { LuLoader } from "react-icons/lu";
import { FaPlus } from "react-icons/fa";
import axios from "axios";

export default function UserProfile() {
  const { userId } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useQueryClient();

  // Fetch user profile
  const { data, isLoading } = useQuery({
    queryFn: async () =>
      axios.get(`https://route-posts.routemisr.com/users/${id}/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      }),
    queryKey: ["userProfile", id],
    retry: 3,
  });

  const { isFollowing, user } = data?.data?.data || {};
  const { createdAt, name, photo, username, followersCount, followingCount } = user || {};

  // Local state for optimistic update
  const [isFollow, setIsFollow] = useState(isFollowing || false);
  const [countOfFollowers, setCountOfFollowers] = useState(followersCount || 0);

  // Keep optimistic state in sync when the query response changes
  useEffect(() => {
    setIsFollow(isFollowing || false);
    setCountOfFollowers(followersCount || 0);
  }, [isFollowing, followersCount]);

  // Redirect to own profile
  useEffect(() => {
    if (id === userId) navigate("/profile");
  }, [id, userId, navigate]);

  // Format date
  const date = new Date(createdAt);
  const monthName = date.toLocaleString("en-US", { month: "long", year: "numeric" });

  // Follow/Unfollow request
  async function followUserRequest() {
    await axios.put(
      `https://route-posts.routemisr.com/users/${id}/follow`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
    );
  }

  // Mutation with optimistic update
  const { mutate, isPending } = useMutation({
    mutationFn: followUserRequest,
    onMutate: () => {
      const previousIsFollow = isFollow;
      const previousCount = countOfFollowers;

      const nextIsFollow = !previousIsFollow;
      const nextCount = previousCount + (nextIsFollow ? 1 : -1);

      setIsFollow(nextIsFollow);
      setCountOfFollowers(nextCount);

      return { previousIsFollow, previousCount };
    },

    onError: (_err, _variables, context) => {
      // Rollback if request fails
      if (context?.previousIsFollow !== undefined) {
        setIsFollow(context.previousIsFollow);
      }
      if (typeof context?.previousCountOfFollowers === "number") {
        setCountOfFollowers(context.previousCountOfFollowers);
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      query.invalidateQueries({ queryKey: ["userProfile", id] });
    },
  });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);


  return (
    <>
      {isLoading ? (
        <HomePageLoading />
      ) : (
        <div className="flex flex-col items-center justify-center">
          {/* Profile Header */}
          <div className="rounded-sm w-full flex flex-col items-center mb-3">
            <div className="w-40 h-40 p-5">
              <img src={photo} className="h-32 w-32 object-cover rounded-full" alt={`${name} Profile Image`} />
            </div>
            <h3 className="font-bold mb-2">{name}</h3>
            <p>@{username || id}</p>
            <div className="flex my-2">
              <p className="mx-2">
                Followers <strong>{countOfFollowers}</strong>
              </p>
              <p className="mx-2">
                Following <strong>{followingCount}</strong>
              </p>
            </div>
            <p>Created At {monthName}</p>
          </div>

          {/* Follow Button */}
          <div className="w-full md:w-4xl lg:w-3xl flex flex-col items-center justify-center">
            <button
              disabled={isPending}
              onClick={mutate}
              className={`p-3 w-full rounded-md cursor-pointer font-semibold flex items-center justify-center ${isFollow ? "bg-gray-50 text-black" : "bg-primary-500 text-white"
                }`}
            >
              {isPending ? (
                <LuLoader className="animate-spin text-black" />
              ) : isFollow ? (
                <div className="flex items-center justify-center">
                  <span>Following</span>
                  <IoMdCheckmark className="mx-2" />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Follow</span>
                  <FaPlus className="mx-2" />
                </div>
              )}
            </button>

            {/* User Posts */}
            <GetMyPosts userid={id} />
          </div>
        </div>
      )}
    </>
  );
}