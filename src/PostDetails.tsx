import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Grainient from "./components/reactbits/Grainient";
import { deleteComment, deletePicture, deletePost, fetchComments, 
  fetchSpecificPost, getLivePicture, getUserTable, submitComment, 
  updateCommentPost, updatePostContent, updatePostLikes, updatePostSaves, 
  updatePostViews, updateUserLikes, updateUserSaves,
} from "./services/appwriteServices";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi,
} from "./components/ui/carousel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle,
} from "./components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import { format } from "date-fns";
import { HeartIcon } from "./components/ui/animatedIcons/heart-icon";
import { BookmarkIcon } from "./components/ui/animatedIcons/bookmark-icon";
import { motion } from "framer-motion";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { images } from "./constants/images";
import CommentBar from "./components/CommentBar";
import { Spinner } from "./components/ui/spinner";
import { EyeIcon, type ExternalLinkIconHandle, } from "./components/ui/animatedIcons/eye-icon";
import CountUp from "./components/reactbits/CountUp";
import SpotlightCard from "./components/reactbits/SpotlightCard";
import { EllipsisVerticalIcon } from "./components/ui/animatedIcons/ellipsis-vertical-icon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { UserPenIcon, type UserPenHandle } from "./components/ui/animatedIcons/user-pen-icon";
import { TrashIcon, type DashboardIconHandle } from "./components/ui/animatedIcons/trash-icon";
import { Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle } from "./components/ui/dialog";
import { FieldLabel } from "./components/ui/field";
import { Textarea } from "./components/ui/textarea";
import { ChevronRightIcon } from "./components/ui/animatedIcons/chevron-right-icon";
import { ChevronLeftIcon } from "./components/ui/animatedIcons/chevron-left-icon";

// TO DO: Add skeleton

// Route: "/post/[:id]"
// Post details page: Post page with full view and comments section.
function PostDetails() {
  // Used for submitting comment
  const userId = localStorage.getItem("userid");

  // Router location
  const location = useLocation();

  // Post loading state
  const [loading, setLoading] = useState(true);

  // Post details | image ids | comments
  const [post, setPost] = useState<Post | null>(location.state?.post);
  const [pictures, setPictures] = useState<string[]>([]);
  const [comments, setComments] = useState<Comments[]>([]);

  const edit = location.state?.edit;

  useEffect(() => {
    if (edit) {
      handleEditView();
    }
  }, [edit]);

  // Post authors profile picture
  const [profilePic, setProfilePic] = useState(false);
  const [profilePicLink, setProfilePicLink] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorUsername, setAuthorUsername] = useState("");

  const userPenRef = useRef<UserPenHandle>(null);
  const trashCanRef = useRef<DashboardIconHandle>(null);

  // Sets loading off once post loaded
  useEffect(() => {
    if (post !== null && post !== undefined) {
      setLoading(false);
    }
  }, [post]);

  useEffect(() => {
    if (!post?.$id) return;

    const viewedPosts: string[] = JSON.parse(
      sessionStorage.getItem("viewedPosts") || "[]",
    );

    if (!viewedPosts.includes(post.$id)) {
      viewedPosts.push(post.$id);

      sessionStorage.setItem("viewedPosts", JSON.stringify(viewedPosts));

      updatePostViews(post.$id, post.Views + 1);

      setPost((prev) => (prev ? { ...prev, Views: prev.Views + 1 } : prev));
    }
  }, [post?.$id]);

  // Grabs authors profile picture
  useEffect(() => {
    const fetchUser = async () => {
      if (post !== null && post !== undefined) {
        // Get authors data
        const user = await getUserTable(post!.Userid);

        setAuthorName(user.Name);
        setAuthorUsername(user.Username);

        // Checks authors profile picture data
        if (user.ProfilePic) {
          let link = getLivePicture(user.ProfilePicId);
          setProfilePicLink(link);
          setProfilePic(true);
        } else {
          setProfilePic(false);
          setProfilePicLink("");
        }
      }
    };

    fetchUser();
  }, [post]);

  // Fetches post's images
  const fetchPostImages = async () => {
    const allMedia = await Promise.all(
      post!.Pictures.map(async (imageId: string) => {
        const imageLiveLink = await getLivePicture(imageId);

        return imageLiveLink;
      }),
    );

    setPictures(allMedia);
  };

  // Fetches post's comments
  const fetchPostComments = async () => {
    try {
      const response = await fetchComments(post!.$id);

      const allComments = response.documents.map((item) => {
        let current = {
          $id: item.$id,
          Body: item.Body,
          Userid: item.Userid,
          Postid: item.Postid,
          $createdAt: item.$createdAt,
          $updatedAt: item.$updatedAt,
        };
        return current;
      });

      setComments(allComments);
    } catch (error: any) {
      console.log("Error [Details.tsx]: Fetching comments");
      console.log(error.message);
    }
  };

  // Will call if post has pictures or comments
  useEffect(() => {
    if (post && post.Pictures.length > 0) {
      fetchPostImages();
    }

    if (post && post!.Comments.length > 0) {
      fetchPostComments();
    }
  }, [post]);

  // TO DO: grab data via id
  const { id } = useParams();

  const fetchPostById = async () => {
    if (id) {
      try {
        const response = await fetchSpecificPost(id);

        setPost(response as unknown as Post);
      } catch (error: any) {
        console.log("Error [Details.tsx]: Fetching post by id");
        console.log(error.message);
      }
    }
  };

  useEffect(() => {
    if (!post) {
      fetchPostById();
    }
  }, [id]);

  // Carousel autoplay plugin
  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true }),
  );

  const EyeIconRef = useRef<ExternalLinkIconHandle>(null);

  const [liked, setLiked] = useState(false);
  const [bookmark, setBookmark] = useState(false);

  const allLikes: string[] = JSON.parse(localStorage.getItem("likes") || "[]");
  const allSaves: string[] = JSON.parse(localStorage.getItem("saves") || "[]");

  useEffect(() => {
    if (!post) return;
    if (allLikes.includes(post.$id)) {
      setLiked(true);
    }
    if (allSaves.includes(post.$id)) {
      setBookmark(true);
    }
  }, [post]);

  const updateLikes = async (likesArray: string[], likesCount: number) => {
    try {
      await updateUserLikes(userId!, likesArray);

      await updatePostLikes(post!.$id, likesCount);
    } catch (error: any) {
      console.log("Error [PostDetails.tsx]: Error updating likes");
      console.log(error.message);
    }
  };

  const handleLike = () => {
    if (!post) return;

    // post is not already liked, need to add
    if (!liked) {
      allLikes.push(post!.$id);
      // update backend
      updateLikes(allLikes, post.Likes + 1);
      setPost((prev) => (prev ? { ...prev, Likes: prev.Likes + 1 } : prev));
    } else {
      // post was already liked, now its unliked
      const updated = allLikes.filter((id) => id !== post!.$id);
      localStorage.setItem("likes", JSON.stringify(updated));
      // call backend
      updateLikes(updated, post.Likes - 1);
      setLiked(false);
      setPost((prev) => (prev ? { ...prev, Likes: prev.Likes - 1 } : prev));
      return;
    }

    setLiked(true);
    localStorage.setItem("likes", JSON.stringify(allLikes));
  };

  const updateSaves = async (savesArray: string[], savesCount: number) => {
    try {
      await updateUserSaves(userId!, savesArray);

      await updatePostSaves(post!.$id, savesCount);
    } catch (error: any) {
      console.log("Error [PostDetails.tsx]: Error updates saves");
      console.log(error.message);
    }
  };

  const handleSave = () => {
    if (!post) return;

    // post is not already saved
    if (!bookmark) {
      allSaves.push(post!.$id);
      // call backend
      updateSaves(allSaves, post.Saves + 1);
      setPost((prev) => (prev ? { ...prev, Saves: prev.Saves + 1 } : prev));
    } else {
      // post was already saved, now remove
      const updated = allSaves.filter((id) => id !== post!.$id);
      localStorage.setItem("saves", JSON.stringify(updated));
      // call backend
      updateSaves(updated, post.Saves - 1);
      setBookmark(false);
      setPost((prev) => (prev ? { ...prev, Saves: prev.Saves - 1 } : prev));
      return;
    }

    setBookmark(true);
    localStorage.setItem("saves", JSON.stringify(allSaves));
  };

  // New comment field | validity state | uploading state
  const [newComment, setNewComment] = useState("");
  const [newCommentInvalid, setNewCommentInvalid] = useState(false);
  const [commentUploading, setCommentUploading] = useState(false);

  const [commentIds, setCommentIds] = useState<string[]>([]);

  useEffect(() => {
    if (comments.length > 0) {
      const allCommentIds = comments.map((item: Comments) => {
        return item.$id;
      });

      setCommentIds(allCommentIds);
    }
  }, [comments]);

  // Uploads comment
  const handleNewComment = async () => {
    setCommentUploading(true);
    try {
      const response = await submitComment(userId!, post!.$id, newComment);

      const comment = {
        $id: response.$id,
        Body: response.Body,
        Userid: response.Userid,
        Postid: response.Postid,
        $createdAt: response.$createdAt,
        $updatedAt: response.$updatedAt,
      };

      setComments((prev) => [...prev, comment]);

      const updatedCommentIds = [...commentIds, response.$id];

      setCommentIds(updatedCommentIds);

      await updateCommentPost(post!.$id, updatedCommentIds);

      setCommentUploading(false);
      setNewComment("");
    } catch (error: any) {
      setCommentUploading(false);
      console.log("Error [Details.tsx]: Posting new comment");
      console.log(error.message);
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const truncatedTitle = post
    ? post!.Title.length > 30
      ? '"' + post!.Title.slice(0, 30) + "..." + '"'
      : post!.Title
    : "";
  const [updating, setUpdating] = useState(false);
  let navigate = useNavigate();

  const deleteAllImages = async () => {
    try {
      post!.Pictures.map(async (item) => {
        await deletePicture(item);
      });
    } catch (error: any) {
      setUpdating(false);
      console.log("Error [PostDetails].tsx: Deleting images");
      console.log(error.message);
    }
  };

  const deleteAllComments = async () => {
    try {
      post!.Comments.map(async (item) => {
        await deleteComment(item);
      });
    } catch (error: any) {
      setUpdating(false);
      console.log("Error [PostDetails].tsx: Deleting comments");
      console.log(error.message);
    }
  };

  const deleteFullPost = async () => {
    try {
      await deletePost(post!.$id);
    } catch (error: any) {
      setUpdating(false);
      console.log("Error [PostDetails].tsx: Deleting post");
      console.log(error.message);
    }
  };

  const handlePostDelete = async () => {
    setUpdating(true);

    if (post!.Pictures.length > 0) {
      deleteAllImages();
    }

    if (post!.Comments.length > 0) {
      deleteAllComments();
    }

    if (post) {
      deleteFullPost();
    }

    setUpdating(false);
    setShowDeleteDialog(false);
    navigate("/");
  };

  const handleSavePostEdit = async () => {
    setUpdating(true);

    try {
      await updatePostContent(post!.$id, newTitle, newBody);

      setPost((prev) =>
        prev ? { ...prev, Title: newTitle, Body: newBody } : prev,
      );
    } catch (error: any) {
      console.log(error.message);
    }

    setUpdating(false);
    setShowDeleteDialog(false);
  };

  const readTime = post
    ? Math.ceil(post.Body.trim().split(/\s+/).length / 200)
    : 1;

  const userIsAuthor = post?.Userid === userId;

  const handleEditView = () => {
    setEditing(true);
    if (post) {
      setNewTitle(post?.Title);
      setNewBody(post?.Body);
    }
    setShowDeleteDialog(true);
  };

  // Dropdown menu for user profile
  const authorOption = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          id="postDetailsTrigger"
          className={`ml-auto cursor-pointer w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#27B1FC]/30 hover:shadow-xl transition-all duration-300 `}
        >
          <Button className="bg-transparent">
            <EllipsisVerticalIcon size={20} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          className="bg-[#171718]/60 backdrop-blur-xl border border-[#27B1FC]/30 transition-all duration-250 transform hover:border-[#27B1FC]/60 shadow-xl"
        >
          <DropdownMenuItem
            className="text-white font-bold cursor-pointer mt-1" 
            onMouseEnter={() => userPenRef.current?.startAnimation()}
            onMouseLeave={() => userPenRef.current?.stopAnimation()}
            onClick={() => handleEditView()}
          >
            <UserPenIcon size={18} ref={userPenRef} />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator className=" bg-[#27B1FC]/40 my-2" />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/40 [&_svg]:text-destructive font-bold cursor-pointer mb-1"
            onMouseEnter={() => trashCanRef.current?.startAnimation()}
            onMouseLeave={() => trashCanRef.current?.stopAnimation()}
            onClick={() => {
              setShowDeleteDialog(true);
            }}
          >
            <TrashIcon size={18} ref={trashCanRef} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const [editing, setEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const [progress, setProgress] = useState(0)
  

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);


  useEffect(() => {
      if (!api) return

      const autoplay = plugin.current
      if (!autoplay) return

      const interval = setInterval(() => {

          const timeRemaining = autoplay.timeUntilNext()
              const delay = autoplay.options.delay ?? 1 as any

              if (timeRemaining !== null) {
                  setProgress(1 - timeRemaining / delay)
          }
      }, 50)

      return () => clearInterval(interval)
  }, [api]) 
  

  return (
    <div className="min-h-screen flex justify-center px-4 py-12 pb-25">
      <div className="w-full max-w-4xl space-y-8">
        {loading ? (
          <p>Loading</p>
        ) : (
          <>
            <div className="relative w-full h-100 transition-all duration-800 cursor-pointer rounded-xl overflow-hidden">
              {pictures.length > 0 ? (
                <>
                  <Carousel
                    plugins={[plugin.current]}
                    className="w-full h-full"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={() => {
                      plugin.current.reset()
                      plugin.current.play()

                    }}
                    setApi={setApi}
                  >
                    <CarouselContent>
                      {pictures.map((link: string, index: number) => (
                        <CarouselItem key={index}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 300,
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                              delay: index * 0.35,
                            }}
                            className="relative w-full h-[60vh] overflow-hidden rounded-xl"
                          >
                            <img
                              src={link}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                            <img
                              src={link}
                              alt={`cover_pic`}
                              className="relative z-10 w-full h-full object-contain rounded-2xl"
                            />
                          </motion.div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </>
              ) : (
                <Grainient />
              )}
            </div>

            {count > 1 &&

              <>
              <div className='flex flex-row items-center justify-center gap-4 px-4 -mt-5'>
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        className={` rounded-full overflow-hidden bg-[#222c36] transition-all transform duration-150 ${index + 1 === current ? 'scale-110 -translate-y-0.5 shadow-[0_0_10px_#27B1FC] h-2' : 'scale-100 h-1'} `}
                        style={{width: `${100 / count}%`}}
                    >
                        <div 
                            className='bg-[#27B1FC] h-full transition-all duration-75 rounded-r-2xl ' 
                            style={{
                                width: index + 1 < current 
                                    ? '100%'
                                    : index + 1 === current
                                        ? `${progress * 100}%`
                                        : '0%'
                            }} 
                        />
                    </div>
                ))}
              </div>

              <div className=" -mt-4 flex items-center justify-center gap-3">
                <div onClick={() => api?.scrollPrev()} className=" ml-auto border flex items-center justify-center p-1 rounded-full border-white/20 bg-black/20 shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03];">
                  <ChevronLeftIcon />
                </div>
                <div className=" flex flex-row gap-3 border border-white/20 p-3 rounded-2xl bg-black/20 shadow-xl">
                  {Array.from({ length: count }).map((_, index) => (
                    <div
                    className={`w-3 h-3 rounded-full ${index + 1 <= current ? "bg-[#27B1FC]" : "bg-[#222c36] border border-white/30 "}  `}
                    />
                  ))}
                </div>
                <div onClick={() => api?.scrollNext()} className="border flex items-center justify-center p-1 rounded-full border-white/20 bg-black/20 shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03];">
                  <ChevronRightIcon />
                </div>
                <p className="text-muted-foreground text-xs font-thin ml-auto "> Image {current} of {count} </p>
              </div>
              </>
            }


            <div className="space-y-4">
              <motion.div
                className="text-3xl font-bold flex flex-row mr-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 5,
                  type: "spring",
                }}
              >
                {post?.Title}
                {userIsAuthor && authorOption()}
              </motion.div>

              <div className="flex items-center p-2 gap-2">
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 5,
                    type: "spring",
                    delay: 0.4,
                  }}
                >
                  <img
                    src={profilePic ? profilePicLink : images.profile}
                    alt={`cover_pic`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {/* TO DO: link to a profile page */}

                  <div className="flex flex-col">
                    <p className="font-semibold flex items-center gap-1">
                      {authorName}{" "}
                      <span className="text-xs text-muted-foreground">
                        @{authorUsername}
                      </span>{" "}
                    </p>

                    <p className="text-muted-foreground text-sm">
                      {format(new Date(post!.$createdAt), "MMM d, yyyy")} |{" "}
                      {readTime} {readTime === 1 ? "minute" : "minutes"} read
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 5,
                    type: "spring",
                    delay: 0.8,
                  }}
                  className="ml-auto flex"
                  onMouseEnter={() => EyeIconRef.current?.startAnimation()}
                  onMouseLeave={() => EyeIconRef.current?.stopAnimation()}
                >
                  <SpotlightCard
                    className="custom-spotlight-card border border-white/20 shadow-xl py-3.5 px-3 flex flex-row gap-3 items-center rounded-2xl cursor-pointer "
                    spotlightColor="rgba(200, 200, 200, 0.4)"
                  >
                    <EyeIcon
                      ref={EyeIconRef}
                      className={`w-5 h-5 cursor-pointer ${liked ? "text-[#C8C8C8] fill-[#C8C8C8] scale-110 animate-[pop_0.3s_ease]" : "text-muted-foreground "} `}
                    />
                    <div className="flex flex-row gap-1">
                      <CountUp
                        from={0}
                        to={post!.Views}
                        separator=","
                        direction="up"
                        duration={1}
                        className="count-up-text"
                      />
                      <p className="">Views</p>
                    </div>
                  </SpotlightCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 5,
                    type: "spring",
                    delay: 0.8,
                  }}
                  className="bg-[#171718] flex p-3.5 gap-4 rounded-2xl items-center border border-white/20 shadow-xl"
                >
                  <HeartIcon
                    onClick={
                      !userIsAuthor && userId !== null ? handleLike : () => {}
                    }
                    className={`w-5 h-5 cursor-pointer ${liked ? "text-red-500 fill-red-500 scale-110 animate-[pop_0.3s_ease]" : "text-muted-foreground "} `}
                  />
                  <CountUp
                    from={0}
                    to={post!.Likes}
                    separator=","
                    direction="up"
                    duration={1}
                    className="count-up-text"
                  />

                  <BookmarkIcon
                    onClick={
                      !userIsAuthor && userId !== null ? handleSave : () => {}
                    }
                    className={`w-5 h-5 cursor-pointer ${bookmark ? "text-[#27B1FC] fill-[#27B1FC] scale-110 animate-[pop_0.3s_ease]" : "text-muted-foreground "} `}
                  />
                  <CountUp
                    from={0}
                    to={post!.Saves}
                    separator=","
                    direction="up"
                    duration={1}
                    className="count-up-text"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 5,
                  type: "spring",
                  delay: 1,
                }}
                className="leading-7 text-base"
              >
                {post?.Body}
              </motion.div>
            </div>

            <div className='h-1 w-full bg-[#27B1FC]/20 mb-8 rounded-2xl' />

            {/* Comments section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 5,
                type: "spring",
                delay: 1.4,
              }}
            >
              <Card className="bg-[#171718]/50 border border-[#27B1FC]/30 transition-all duration-250 transform hover:border-[#27B1FC]/60 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">
                    Comments{" "}
                    <span className="text-muted-foreground text-sm">
                      {" "}
                      ({comments.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {comments.length > 0 ? (
                    comments.map((item: Comments, index: number) => (
                      <CommentBar
                        key={index}
                        comment={item}
                        index={index}
                        delay={index * 0.25}
                      />
                    ))
                  ) : (
                    <p className="text-white text-center text-md">
                      Be the first to comment.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="gap-4">
                  {userId !== null ? (
                    <>
                      <Input
                        id={`input-field-comment`}
                        type={"text"}
                        value={newComment}
                        placeholder={`Enter a comment`}
                        aria-invalid={newCommentInvalid}
                        onChange={(e) => {
                          setNewCommentInvalid(false);
                          setNewComment(e.target.value);
                        }}
                        className={`text-white transition-all duration-350 ${newCommentInvalid ? "border-red-500 focus-visible:ring-red-500" : ""} `}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-1/5"
                        disabled={newComment.length === 0 || commentUploading}
                        onClick={() => {
                          handleNewComment();
                        }}
                      >
                        {commentUploading && <Spinner />}
                        Comment
                      </Button>
                    </>
                  ) : (
                    <div className="text-white w-full flex flex-row gap-2 items-center shadow-2xl">
                      <div className="border p-2 w-9/10 rounded-lg text-center text-muted-foreground">
                        <p>Log in to add a comment</p>
                      </div>
                      <div className="">
                        <Button
                          className="bg-[#27B1FC]/80 hover:bg-[#27B1FC]/70"
                          onClick={() => {
                            navigate("/login");
                          }}
                        >
                          Log in
                        </Button>
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className="bg-[#555555] border-none"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-row gap-1">
              {editing ? (
                <p>Edit post</p>
              ) : (
                <>
                  Delete <p className="font-bold italic">"{truncatedTitle}"</p>
                </>
              )}
            </DialogTitle>
            {editing ? (
              <DialogDescription className="text-white flex flex-col gap-4">
                <div className="mt-3">
                  <FieldLabel>New Title</FieldLabel>
                  <Input
                    id={`input-field-title`}
                    type={"text"}
                    value={newTitle}
                    placeholder={`Edit your title`}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                    }}
                    className="bg-[#171718]/50 border-0 shadow-2xl mt-2"
                  />
                </div>

                <div>
                  <FieldLabel>New Body</FieldLabel>
                  <Textarea
                    id={`input-field-body`}
                    value={newBody}
                    placeholder={`Edit your body`}
                    onChange={(e) => {
                      setNewBody(e.target.value);
                    }}
                    rows={8}
                    className="bg-[#171718]/50 border-0 shadow-2xl mt-2"
                  />
                </div>
              </DialogDescription>
            ) : (
              <DialogDescription className="text-white">
                Are you sure you want to delete this post? This will delete all
                comments and images associated as well.
              </DialogDescription>
            )}
          </DialogHeader>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                if (editing) setEditing(false);
              }}
              disabled={updating}
            >
              Cancel
            </Button>
            {editing ? (
              <Button
                className="bg-green-800 hover:bg-green-900"
                onClick={() => {
                  handleSavePostEdit();
                }}
                disabled={
                  updating || newTitle === post?.Title || newBody === post?.Body
                }
              >
                {" "}
                {updating && <Spinner />} {updating ? "Updating..." : "Save"}
              </Button>
            ) : (
              <Button
                className="text-destructive hover:bg-destructive/30"
                onClick={() => {
                  handlePostDelete();
                }}
                disabled={updating}
              >
                {" "}
                {updating && <Spinner />} {updating ? "Deleting..." : "Confirm"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PostDetails;
