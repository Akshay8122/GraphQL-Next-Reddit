import { useMutation, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import TimeAgo from "react-timeago";
import Avatar from "@src/components/Avtar";
import Post from "@src/components/Post";
import { ADD_COMMENT } from "@src/graphql/mutation";
import { GET_POST_BY_POST_ID } from "@src/graphql/queries";
import { PostInfo } from "types/typings";

type formData = {
  comment: string;
};

export default function PostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: [GET_POST_BY_POST_ID, "getPostListByPostId"],
  });

  const { data } = useQuery(GET_POST_BY_POST_ID, {
    variables: {
      post_id: router.query.postId,
    },
  });

  const post: PostInfo = data?.getPostListByPostId;

  const {
    setValue,
    handleSubmit,
    watch,
    register,
    formState: { errors },
  } = useForm<formData>();

  const onSubmit: SubmitHandler<formData> = async (data) => {
    const notification = toast.loading("Posting your comment...");

    await addComment({
      variables: {
        post_id: router.query.postId,
        username: session?.user?.name,
        text: data.comment,
      },
    });

    setValue("comment", "");

    toast.success("Comment added successfully!", {
      id: notification,
    });
  };
  return (
    <div className="mx-auto my-7 max-w-5xl">
      <Post post={post} />

      <div className="-mt-1 rounded-b-md border border-t-0 border-gray-300 bg-white p-5 pl-16 ">
        <p className="text-sm ">
          Comment as <span className="text-red-500">{session?.user?.name}</span>
        </p>

        <form
          className="mt-2 flex flex-col space-y-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <textarea
            {...register("comment")}
            disabled={!session}
            className="h-24 rounded-md border border-gray-200 p-2 pl-4 outline-none disabled:bg-gray-50"
            placeholder={
              session ? "What are your thoughts?" : "Sign in to comment"
            }
          />

          <button
            disabled={!session}
            className="rounded-full bg-red-500 p-3 font-semibold text-white disabled:bg-gray-200"
            type="submit"
          >
            Comment
          </button>
        </form>

        {post?.comments.map((comment) => (
          <div
            className="relative flex items-center space-x-2 space-y-5"
            key={comment.id}
          >
            <hr className="absolute top-10 left-7 z-0 h-16 border" />

            <div className="z-50">
              <Avatar seed={comment.username} />
            </div>

            <div className="flex flex-col">
              <p className="py-2 text-xs text-gray-400">
                <span className="font-semibold text-gray-600">
                  {comment.username}
                </span>
                {" . "}
                <TimeAgo date={comment.created_at} />
              </p>

              <p>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
