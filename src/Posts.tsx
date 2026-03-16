import { useEffect, useRef, useState } from "react";
import { searchComments, searchPosts } from "./services/appwriteServices";
import PostCard from "./components/PostCard";
import { BookOpenIcon, type BookOpenIconHandle } from "./components/ui/animatedIcons/book-open-icon";
import { Button } from "./components/ui/button";
import { useNavigate } from "react-router";
import { MessageCircleIcon, type MessageCircleIconHandle } 
  from "./components/ui/animatedIcons/message-circle-icon";
import CommentCard from "./components/CommentCard";
import { AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/animatedIcons/alert";
import { StarIcon, type StarIconHandle } from "./components/ui/animatedIcons/star-icon";

// Route: "/posts"
// Posts page: Dashboard of logged in user's post and comments.
function Posts() {
  // Userid
  const userId = localStorage.getItem("userid");

  // Router navigation
  let navigate = useNavigate();

  // All users posts
  const [posts, setPosts] = useState<Post[]>([]);

  // All users comments
  const [comments, setComments] = useState<Comments[]>([]);

  // Fetch posts
  const fetchAllPosts = async () => {
    try {
      const response = await searchPosts(userId!);

      let featured = 0;
      const unfiltered = response.documents.map((item) => {
        if (item.Featured === true) featured++;
        return item as unknown as Post;
      });

      if (response.documents.length > 0) {
        setPostsFeatured(featured);
        setPosts(unfiltered);
      } else {
        setPosts([]);
      }
    } catch (error: any) {
      console.log("Error [Posts.tsx]: Fetching posts");
      console.log(error.message);
    }
  };

  const fetchAllComments = async () => {
    try {
      const response = await searchComments(userId!);

      const unfiltered = response.documents.map((item) => {
        const current = {
          $id: item.$id,
          Body: item.Body,
          Userid: item.Userid,
          Postid: item.Postid,
          $createdAt: item.$createdAt,
          $updatedAt: item.$updatedAt,
        };
        return current;
      });

      if (response.documents.length > 0) {
        setComments(unfiltered);
      } else {
        setComments([]);
      }
    } catch (error: any) {
      console.log("Error [Posts.tsx]: Fetching posts");
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchAllPosts();
    fetchAllComments();
  }, [userId]);

  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.$id !== id));

    setComments((prev) => prev.filter((comment) => comment.Postid !== id));
  };

  const handleDeleteComment = (id: string) => {
    setComments((prev) => prev.filter((comment) => comment.$id !== id));
  };
  // Animated icons ref
  const bookOpenIconRef = useRef<BookOpenIconHandle>(null);
  const messageCircleIconRef = useRef<MessageCircleIconHandle>(null);

  const handleFeatureChanged = (id: string, featured: boolean) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.$id === id ? { ...post, Featured: featured } : post,
      ),
    );
    if (featured) {
      setPostsFeatured(postsFeatured + 1);
    } else {
      setPostsFeatured(postsFeatured - 1);
    }
  };

  const [postsFeatured, setPostsFeatured] = useState(0);
  const StarIconRef = useRef<StarIconHandle>(null);

  return (
    <div className="flex flex-col w-full items-center justify-center pb-25">
      <div className=" w-[90%] mt-6 items-center justify-center">
        <div className="flex flex-row">
          <p className="text-[#27B1FC] font-bold text-[24px]">Your Posts</p>
        </div>

        <div className="border border-[#27B1FC]/30 transition-all duration-250 transform hover:border-[#27B1FC]/60 mt-4 p-4 flex flex-col gap-4 rounded-2xl overflow-hidden">
          {posts!.length > 0 ? (
            <AnimatePresence>
              {posts?.map((item: Post, index: number) => (
                <PostCard
                  key={item.$id}
                  post={item}
                  delay={index * 0.15}
                  onDelete={handleDeletePost}
                  onFeatureChange={handleFeatureChanged}
                  totalFeatured={postsFeatured}
                />
              ))}

              <div className="h-0.5 w-full bg-[#27B1FC]/20  rounded-2xl flex self-center" />

              <div className="flex justify-center">
                <Alert
                  className={` bg-[#555555]/50 border border-[#FFEB3B]/20 transition-all duration-250 transform hover:border-[#FFEB3B]/60`}
                  onMouseEnter={() => {
                    StarIconRef.current?.startAnimation();
                  }}
                  onMouseLeave={() => {
                    StarIconRef.current?.stopAnimation();
                  }}
                >
                  <AlertTitle className="flex items-center gap-2 text-[#FFEB3B]/90 ">
                    {" "}
                    <StarIcon size={16} ref={StarIconRef} /> Featured Posts [
                    {postsFeatured} / 3]
                  </AlertTitle>
                  <AlertDescription className="ml-6 text-white">
                    You can feature up to 3 post on your public profile.{" "}
                    {postsFeatured < 3
                      ? `You currently have ${postsFeatured}, add more to share your exciting stories.`
                      : "If you would like to change which post to feature, remove an existing one before adding a new one."}
                  </AlertDescription>
                </Alert>
              </div>
            </AnimatePresence>
          ) : (
            <div
              className="bg-[#555555]/40 border-0 text-white w-[30%] self-center rounded-2xl p-8 transition-all duration-300 hover:-translate-y-0.5 hover:scale "
              onMouseEnter={() => bookOpenIconRef.current?.startAnimation()}
              onMouseLeave={() => bookOpenIconRef.current?.stopAnimation()}
            >
              <div className="font-bold flex flex-row gap-2 justify-center ">
                <BookOpenIcon size={18} ref={bookOpenIconRef} />
                No posts yet
              </div>
              <div className="text-muted-foreground text-sm p-2 text-center flex flex-col gap-4">
                Create your first post to get started
                <Button
                  className="w-1/2 self-center"
                  onClick={() => {
                    navigate("/createpost");
                  }}
                >
                  New Post
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-row mt-3">
          <p className="text-[#27B1FC] font-bold text-[24px]">Your Comments</p>
        </div>

        <div className="border-4 border-[#27B1FC]/60 mt-4 p-4 flex flex-col gap-4 rounded-2xl overflow-hidden">
          {comments!.length > 0 ? (
            <AnimatePresence>
              {comments?.map((item: Comments, index: number) => (
                <CommentCard
                  key={item.$id}
                  comment={item}
                  delay={index * 0.15}
                  onDelete={handleDeleteComment}
                />
              ))}
            </AnimatePresence>
          ) : (
            <div
              className="bg-[#555555]/40 border-0 text-white w-[30%] self-center rounded-2xl p-8 transition-all duration-300 hover:-translate-y-0.5 hover:scale "
              onMouseEnter={() =>
                messageCircleIconRef.current?.startAnimation()
              }
              onMouseLeave={() => messageCircleIconRef.current?.stopAnimation()}
            >
              <div className="font-bold flex flex-row gap-2 justify-center ">
                <MessageCircleIcon size={18} ref={messageCircleIconRef} />
                No comments yet
              </div>
              <div className="text-muted-foreground text-sm p-2 text-center flex flex-col gap-4">
                Create a comment and start a conversation!
                <Button
                  className="w-1/2 self-center"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  Browse posts
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Posts;
