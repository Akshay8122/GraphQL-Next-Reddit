import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import Avtar from "./Avtar";
import { LinkIcon, PhotographIcon } from "@heroicons/react/outline";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { ADD_POST, ADD_SUBREDDIT } from "@src/graphql/mutation";
import { GET_ALL_POSTS, GET_SUBREDDIT_BY_TOPIC } from "@src/graphql/queries";
import client from "apollo-client";
import toast from "react-hot-toast";

type FormData = {
  postTitle: string;
  postBody: string;
  postImage: string;
  subreddit: string;
};

type Props = {
  subreddit?: string;
};

function Postbox({ subreddit }: Props) {
  const { data: session } = useSession();
  const [addPost] = useMutation(ADD_POST, {
    refetchQueries: [GET_ALL_POSTS, "getPostList"],
  });
  const [addSubreddit] = useMutation(ADD_SUBREDDIT);
  const [imageBoxOpen, setImageBoxOpen] = useState<boolean>(false);

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (formData) => {
    const notification = toast.loading("Creating new post...");

    try {
      //   Query for the subreddit topic...

      const {
        data: { getSubredditListByTopic },
      } = await client.query({
        query: GET_SUBREDDIT_BY_TOPIC,
        variables: {
          topic: subreddit || formData.subreddit,
        },
      });
      const subredditExitsts = getSubredditListByTopic.length > 0;

      if (!subredditExitsts) {
        // create subreddit...

        const {
          data: { insertSubreddit: newSubreddit },
        } = await addSubreddit({
          variables: {
            topic: formData.subreddit,
          },
        });

        const image = formData.postImage || "";

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            body: formData.postBody,
            image: image,
            subreddit_id: newSubreddit.id,
            title: formData.postTitle,
            username: session?.user?.name,
          },
        });
      } else {
        //  use existing subreddit...

        const image = formData.postImage || "";

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            body: formData.postBody,
            image: image,
            subreddit_id: getSubredditListByTopic[0].id,
            title: formData.postTitle,
            username: session?.user?.name,
          },
        });
      }

      //  After the post has been added!!

      setValue("postBody", "");
      setValue("postImage", "");
      setValue("postTitle", "");
      setValue("subreddit", "");

      toast.success("New Post Created!!", {
        id: notification,
      });
    } catch (error) {
      toast.error("Opps Something Went Wrong!!", {
        id: notification,
      });
    }
  });

  const isBigScreen = useMediaQuery({ query: "(min-width: 375px)" });
  // const inputBoxScreen = useMediaQuery({ query: "(min-width: 350px)" });
  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-20 z-50 rounded-md border border-gray-300 bg-white p-2"
    >
      <div className="flex items-center space-x-3">
        <Avtar />
        <input
          {...register("postTitle", { required: true })}
          disabled={!session}
          className="flex-1 rounded-md bg-gray-50 p-2 pl-5 outline-none"
          type="text"
          placeholder={
            session
              ? subreddit
                ? `Create a post in r/${subreddit}`
                : "Create a post by entering a title"
              : "Sign into post"
          }
        />

        <PhotographIcon
          onClick={() => setImageBoxOpen(!imageBoxOpen)}
          className={`h-6 cursor-pointer text-gray-300 ${
            imageBoxOpen && "text-blue-300"
          }`}
        />
        <LinkIcon className="h-6 text-gray-300" />
      </div>

      {!!watch("postTitle") && (
        <div className="flex flex-col py-2">
          {/* Body */}

          <div className="flex items-center px-2">
            <p className="min-w-[98px]">Body</p>

            <input
              {...register("postBody")}
              className="m-2 flex-1 bg-blue-50 p-2 outline-none"
              type="text"
              placeholder="Text (optional)"
            />
          </div>

          {!subreddit && (
            <div className="flex items-center px-2">
              <p className="min-w-[98px]">Subreddit</p>
              <input
                {...register("subreddit", { required: true })}
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
                type="text"
                placeholder="i.e. reactjs"
              />
            </div>
          )}

          {!!imageBoxOpen && (
            <div className="flex items-center px-2">
              <p className="min-w-[98px]">Image URL</p>
              <input
                {...register("postImage")}
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
                type="text"
                placeholder="optional..."
              />
            </div>
          )}
        </div>
      )}
      {/* Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="space-y-2 p-2 text-red-500">
          {errors.postTitle?.type === "required" && <p>A Post is required </p>}

          {errors.subreddit?.type === "required" && (
            <p>A Subreddit is required</p>
          )}
        </div>
      )}
      {!!watch("postTitle") && (
        <button
          type="submit"
          className="w-full rounded-full bg-blue-400 p-2 text-white"
        >
          Create Post
        </button>
      )}
    </form>
  );
}

export default Postbox;
