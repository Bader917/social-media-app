import HomePageLoading from "../HomePageLoading/HomePageLoading";
import AllPostsData from "../AllPostsData/AllPostsData";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function GetMyPosts({ userid }) {
    const fetchMyPosts = async ({ queryKey }) => {
        const [, id] = queryKey;

        return axios.get(
            `https://route-posts.routemisr.com/users/${id}/posts`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                }
            }
        );
    };

    const { data, isLoading } = useQuery({
        queryKey: ['getMyPosts', userid],
        queryFn: fetchMyPosts,
        enabled: !!userid,
    });

    return (
        <div className="my-2 w-full flex flex-col items-center justify-center">
            {
                isLoading &&
                <HomePageLoading />
            }
            {
                data?.data?.data?.posts.map((post) => <AllPostsData from="profile" post={post} key={post.id}
                />)
            }
        </div>
    );
}