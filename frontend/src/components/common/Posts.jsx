/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";

import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useEffect } from "react";



const Posts = ({feedType,username ,userId}) => {
	

	const getPostEndPoint = ()=>{
		switch(feedType){
			case "forYou":
				return "/api/post/all"
			case "following":
				return "/api/post/following"
			case "likes":
				return `/api/post/likes/${userId}`
			case "posts":
				return `/api/post/user/${username}`	
			default:
				return "/api/post/all"
		}
	};
	const POST_ENDPOINT = getPostEndPoint();
	const {data:posts ,isLoading, refetch,isRefetching} = useQuery({
		queryKey:["posts"],
		queryFn:async () => {
			try {
				const res = await fetch(POST_ENDPOINT);
				const data = await res.json()
				if(!res.ok) throw new Error(data.error||"Something went wrong");
				return data
			} catch (error) {
				throw new Error(error)
			}
		}
	});
	useEffect(()=>{
	refetch();
	},[feedType ,username,refetch ])

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;