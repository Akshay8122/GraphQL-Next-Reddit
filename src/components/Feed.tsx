import { useQuery } from "@apollo/client";
import React from "react";
import { GET_ALL_POSTS, GET_ALL_POSTS_BY_TOPIC } from "@src/graphql/queries";
import { PostInfo } from "types/typings";
import Post from "./Post";
import { useSession } from "next-auth/react";

type Props = {
  topic?: string;
};

function Feed({ topic }: Props) {
  const { data: session } = useSession();
  const { data, loading, error } = !topic
    ? useQuery(GET_ALL_POSTS)
    : useQuery(GET_ALL_POSTS_BY_TOPIC, {
        variables: {
          topic: topic,
        },
      });

  if (session) {
    if (loading) {
      return <div className="ml-[45%] text-gray-400">Loading posts....</div>;
    }
  }

  const posts: PostInfo[] = !topic
    ? data?.getPostList
    : data?.getPostListByTopic;

  return (
    <div className="mt-5 w-full space-y-4">
      {session && posts?.map((post) => <Post key={post.id} post={post} />)}
    </div>
  );
}

export default Feed;
