import HomePageLoading from "../HomePageLoading/HomePageLoading";
import AllPostsData from "../AllPostsData/AllPostsData";
import PostCraete from "../PostCraete/PostCraete";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function Home() {
  async function getAllposts() {
    return await axios.get('https://route-posts.routemisr.com/posts',
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` },
      });
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['getAllPosts'],
    queryFn: getAllposts,
    retry: 3,
  });

  if (isLoading) return <HomePageLoading />;
  if (isError) return <p className="font-semibold min-h-100 text-2xl text-white">Please try again later</p>;

  return (
    <>
      {/* Parent-only responsive container: centers content and gives children full usable width */}
      <div className="flex items-center justify-center mx-auto my-2 w-full max-w-2xl sm:max-w-2xl lg:max-w-2xl px-2 sm:px-4">
        <PostCraete queryKey={['getAllPosts']} />
      </div>
      {
        !isLoading &&
        data?.data?.data?.posts?.map((post) => {
          return (
            <div
              key={post.id}
              className="mx-auto w-full max-w-2xl sm:max-w-2xl lg:max-w-2xl px-2 sm:px-4 mt-3 sm:mt-4"
            >
              <AllPostsData post={post} from={"Home"} />
            </div>
          );
        })
      }
    </>
  )
}