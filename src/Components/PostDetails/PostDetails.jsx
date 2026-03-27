import HomePageLoading from '../HomePageLoading/HomePageLoading';
import AllPostsData from '../AllPostsData/AllPostsData';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';

export default function PostDetails() {
    const { id } = useParams();

    async function getPostDetails() {
        return await axios.get(`https://route-posts.routemisr.com/posts/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
        });
    }

    const { data, isLoading } = useQuery({
        queryKey: ['getSinglePost', id],
        queryFn: getPostDetails,
    });

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, []);


    return (
        <div className='h-auto flex items-start justify-center mx-auto my-2 w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl px-2 sm:px-4'>
            {isLoading || !data?.data?.data?.post ? (
                <HomePageLoading />
            ) : (
                <AllPostsData post={data.data.data.post} isPostDetails />
            )}
        </div>
    )
}