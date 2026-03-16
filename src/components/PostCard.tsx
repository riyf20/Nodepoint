import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { MessageCircleIcon, type MessageCircleIconHandle} 
  from "./ui/animatedIcons/message-circle-icon";
import { BookmarkIcon, type BookmarkIconHandle } 
  from "./ui/animatedIcons/bookmark-icon";
import { HeartIcon, type HeartIconHandle } from "./ui/animatedIcons/heart-icon";
import { EyeIcon, type ExternalLinkIconHandle } from "./ui/animatedIcons/eye-icon";
import { changefeaturedPost, deleteComment, deletePicture, 
  deletePost, getLivePicture } from "../services/appwriteServices";
import { ChevronDownIcon, type ChevronDownIconHandle } 
  from "./ui/animatedIcons/chevron-down-icon";
import { ChevronUpIcon, type ChevronUpIconHandle } 
  from "./ui/animatedIcons/chevron-up-icon";
import CoverPhoto from "./CoverPhoto";
import SpotlightCard from "./reactbits/SpotlightCard";
import { TrashIcon, type DashboardIconHandle } from "./ui/animatedIcons/trash-icon";
import { UserPenIcon, type UserPenHandle } from "./ui/animatedIcons/user-pen-icon";
import { Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Spinner } from "./ui/spinner";
import { SquareArrowOutUpRightIcon, type SquareArrowOutUpRightIconHandle } 
  from "./ui/animatedIcons/square-arrow-out-up-right-icon";
import { useNavigate } from "react-router";
import CountUp from "./reactbits/CountUp";
import GradientText from "./reactbits/GradientText";
import { StarIcon, type StarIconHandle } from "./ui/animatedIcons/star-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

// Post block used to show all users post in the posts page
function PostCard({ post, delay, onDelete, onFeatureChange, totalFeatured }: PostCardProps) {

  // Post's cover photo state
  const posterPicture = post.Pictures.length > 0;
  const [miniPictureIds, setMiniPictureIds] = useState<string[]>([]);

  // If the block has been expanded
  const [expanded, setExpanded] = useState(false);

  // Animated Icon refs
  const MessageCircleIconRef = useRef<MessageCircleIconHandle>(null);
  const ChevronUpIconRef = useRef<ChevronUpIconHandle>(null);
  const ChevronDownIconRef = useRef<ChevronDownIconHandle>(null);
  const BookmarkIconRef = useRef<BookmarkIconHandle>(null);
  const HeartIconRef = useRef<HeartIconHandle>(null);
  const EyeIconRef = useRef<ExternalLinkIconHandle>(null);
  const userPenRef = useRef<UserPenHandle>(null);
  const trashCanRef = useRef<DashboardIconHandle>(null);
  const squareArrowRef = useRef<SquareArrowOutUpRightIconHandle>(null);
  const StarIconRef = useRef<StarIconHandle>(null);

  // Delete prompt
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  let navigate = useNavigate();

  // Send user to specific post
  const transferPost = (edit: boolean) => {
    navigate(`/post/${post!.$id}`, {
      state: { post, edit },
    });
  };

  // Will grab post images
  useEffect(() => {
    if (posterPicture && post.Pictures.length > 0) {
      let links = post.Pictures.map((item) => {
        return getLivePicture(item);
      });
      setMiniPictureIds(links);
    }
  }, [post]);

  // Shortened title
  const truncatedTitle =
    post.Title.length > 30
      ? '"' + post.Title.slice(0, 30) + "..." + '"'
      : post.Title;

  // Updating to backend state
  const [updating, setUpdating] = useState(false);

  // Deletes all associated images
  const deleteAllImages = async () => {
    try {
      post.Pictures.map(async (item) => {
        await deletePicture(item);
      });
    } catch (error: any) {
      setUpdating(false);
      console.log("Error [PostCard].tsx: Deleting images");
      console.log(error.message);
    }
  };

  // Deletes all associated comments
  const deleteAllComments = async () => {
    try {
      post.Comments.map(async (item) => {
        await deleteComment(item);
      });
    } catch (error: any) {
      setUpdating(false);
      console.log("Error [PostCard].tsx: Deleting comments");
      console.log(error.message);
    }
  };

  // Deletes full post
  const deleteFullPost = async () => {
    try {
      await deletePost(post.$id);
    } catch (error: any) {
      setUpdating(false);
      console.log("Error [PostCard].tsx: Deleting post");
      console.log(error.message);
    }
  };

  // Main delete function
  const handlePostDelete = async () => {
    setUpdating(true);

    if (post.Pictures.length > 0) {
      deleteAllImages();
    }

    if (post.Comments.length > 0) {
      deleteAllComments();
    }

    if (post) {
      deleteFullPost();
    }

    setExpanded(false);

    // Removes the post from the array in the posts page so data is synced
    onDelete(post.$id);

    setUpdating(false);
    setShowDeleteDialog(false);
  };

  const featurePost = async () => {
    try {
      await changefeaturedPost(post.$id, !post.Featured);

      onFeatureChange(post.$id, !post.Featured);
    } catch (error: any) {
      console.log("Error [PostCard].tsx: Deleting post");
      console.log(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99, y: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -6, animationDuration: 0.04 }}
      transition={{
        delay,
        type: "spring",
        opacity: { duration: 2 },
        scale: { duration: 0.2 },
      }}
      className="  bg-[#555555]/50 rounded-2xl cursor-pointer hover:shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.006] border border-white/16 "
      onClick={() => {
        setExpanded((prev) => !prev);
      }}
      onMouseEnter={() => {
        if (expanded) {
          ChevronUpIconRef.current?.startAnimation();
        } else {
          ChevronDownIconRef.current?.startAnimation();
        }
      }}
      onMouseLeave={() => {
        if (expanded) {
          ChevronUpIconRef.current?.stopAnimation();
        } else {
          ChevronDownIconRef.current?.stopAnimation();
        }
      }}
    >
      <div className="flex flex-row p-4 gap-3">
        <div>
          {posterPicture ? (
            <img
              src={miniPictureIds[0]}
              className="w-12 h-12 rounded-md object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-md">
              <div className="relative h-12 bg-[#27B1FC]/10 rounded-md overflow-hidden">
                <CoverPhoto textScale="scale-15" />
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg flex items-center">
            {post.Title}
            {post.Featured && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-yellow-500/70 text-xs ml-2 px-2 py-0.5 border rounded-2xl shadow-[0_0_3px_#FFEB3B] ">
                    Featured
                  </span>
                </TooltipTrigger>
                <TooltipContent className="text-sm bg-black/60 ">
                  <p>This post is featured on your public profile.</p>
                </TooltipContent>
              </Tooltip>
            )}
          </p>
          <p className="text-muted-foreground">
            {format(new Date(post.$createdAt), "MMM d")}
          </p>
        </div>
        <div
          className={`ml-auto shrink-0 flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#27B1FC]/30 hover:shadow-xl transition-all duration-300 ${expanded && "bg-[#27B1FC]/30"} `}
        >
          {expanded ? (
            <ChevronUpIcon
              className="text-[#27B1FC]"
              onClick={() => {
                setExpanded(true);
              }}
              ref={ChevronUpIconRef}
            />
          ) : (
            <ChevronDownIcon
              className="text-[#27B1FC]"
              onClick={() => {
                setExpanded(false);
              }}
              ref={ChevronDownIconRef}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{
              height: {
                type: "spring",
                stiffness: 220,
                damping: 22,
              },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                delay: 0.35,
                y: { type: "spring", stiffness: 180, damping: 18 },
                opacity: { duration: 0.5 },
              }}
              className="flex flex-row p-4 bg-[#555555]/80"
            >
              {/* Mini view of posts images */}
              <div className="flex-1/4">
                <div className="flex justify-center">
                  <p className="font-bold text-md text-[#27B1FC] ">
                    Post Media
                  </p>
                </div>
                <div className="flex flex-row justify-center mt-4">
                  {posterPicture && miniPictureIds.length > 0 ? (
                    miniPictureIds.map((item, index) =>
                      index <= 2 ? (
                        <img
                          src={item}
                          key={index}
                          className={`w-14 h-14 object-cover rounded-md border border-[slategray]`}
                          style={{
                            zIndex: index,
                            marginLeft: index === 0 ? 0 : -10,
                          }}
                        />
                      ) : index === 3 ? (
                        <div
                          className={`w-14 h-14 object-cover rounded-md bg-[#222c36] flex justify-center items-center`}
                          style={{ marginLeft: -10, zIndex: 3 }}
                        >
                          {" "}
                          <p> +{miniPictureIds.length - 3} </p>{" "}
                        </div>
                      ) : null,
                    )
                  ) : (
                    <div
                      className={`w-1/3 h-10 object-cover rounded-md bg-[#222c36] flex justify-center items-center`}
                      style={{ marginLeft: -10, zIndex: 3 }}
                    >
                      {" "}
                      <p className="font-light">No media</p>{" "}
                    </div>
                  )}
                </div>
              </div>

              {/* Posts main stats */}
              <div className="flex-2/4">
                <div className="flex justify-center">
                  <p className="font-bold text-md text-[#27B1FC]">Post Stats</p>
                </div>
                <div className="flex flex-row justify-center gap-6 mt-3 h-[70%]">
                  <SpotlightCard
                    className="custom-spotlight-card border py-2 px-3 items-center justify-center rounded-2xl border-white/44 shadow-2xl"
                    spotlightColor="rgba(200, 200, 200, 0.4)"
                  >
                    <div
                      className="flex gap-2"
                      onMouseEnter={() => EyeIconRef.current?.startAnimation()}
                      onMouseLeave={() => EyeIconRef.current?.stopAnimation()}
                    >
                      <EyeIcon
                        size={18}
                        ref={EyeIconRef}
                        className="text-slate-300"
                      />
                      <GradientText
                        className="text-lg"
                        colors={["#C8C8C8", "#CAD5E2", "#E2E8F0"]}
                      >
                        Views
                      </GradientText>
                    </div>
                    <div className="text-lg font-bold text-center mt-1">
                      <CountUp
                        from={0}
                        to={post.Views}
                        separator=","
                        direction="up"
                        duration={1}
                        className="count-up-text"
                      />
                    </div>
                  </SpotlightCard>

                  <SpotlightCard
                    className="custom-spotlight-card border py-2 px-3 items-center justify-center rounded-2xl border-white/44 shadow-2xl"
                    spotlightColor="rgba(255, 80, 80, 0.4)"
                  >
                    <div
                      className="flex gap-2"
                      onMouseEnter={() =>
                        HeartIconRef.current?.startAnimation()
                      }
                      onMouseLeave={() => HeartIconRef.current?.stopAnimation()}
                    >
                      <HeartIcon
                        size={18}
                        ref={HeartIconRef}
                        className="fill-none text-red-400"
                      />
                      <GradientText
                        className="text-lg"
                        colors={["#FF4D6D", "#FF758F", "#FFB3C1"]}
                      >
                        Likes
                      </GradientText>
                    </div>
                    <div className="text-lg font-bold text-center mt-1">
                      <CountUp
                        from={0}
                        to={post.Likes}
                        separator=","
                        direction="up"
                        duration={1}
                        className="count-up-text"
                      />
                    </div>
                  </SpotlightCard>

                  <SpotlightCard
                    className="custom-spotlight-card border py-2 px-3 items-center justify-center rounded-2xl border-white/44 shadow-2xl"
                    spotlightColor="rgba(39, 177, 252, 0.4)"
                  >
                    <div
                      className="flex gap-2"
                      onMouseEnter={() =>
                        BookmarkIconRef.current?.startAnimation()
                      }
                      onMouseLeave={() =>
                        BookmarkIconRef.current?.stopAnimation()
                      }
                    >
                      <BookmarkIcon
                        size={18}
                        ref={BookmarkIconRef}
                        className="fill-none text-[#27B1FC] top-1"
                      />
                      <GradientText
                        className="text-lg"
                        colors={["#27B1FC", "#58C2FF", "#A3E1FF"]}
                      >
                        Saves
                      </GradientText>
                    </div>
                    <div className="text-lg font-bold text-center mt-1">
                      <CountUp
                        from={0}
                        to={post.Saves}
                        separator=","
                        direction="up"
                        duration={1}
                        className="count-up-text"
                      />
                    </div>
                  </SpotlightCard>

                  <SpotlightCard
                    className="custom-spotlight-card border py-2 px-3 items-center justify-center rounded-2xl border-white/44 shadow-2xl"
                    spotlightColor="rgba(168, 85, 247, 0.4)"
                  >
                    <div
                      className="flex gap-2"
                      onMouseEnter={() =>
                        MessageCircleIconRef.current?.startAnimation()
                      }
                      onMouseLeave={() =>
                        MessageCircleIconRef.current?.stopAnimation()
                      }
                    >
                      <MessageCircleIcon
                        size={18}
                        ref={MessageCircleIconRef}
                        className="text-purple-400"
                      />
                      <GradientText className="text-lg">Comments</GradientText>
                    </div>

                    <div className="text-lg font-bold text-center mt-1">
                      <CountUp
                        from={0}
                        to={post.Comments.length}
                        separator=","
                        direction="up"
                        duration={1}
                        className="count-up-text"
                      />
                    </div>
                  </SpotlightCard>
                </div>
              </div>

              {/* Main post actions */}
              <div className="flex-1/4 flex flex-col items-center border">
                <div className="flex justify-center">
                  <p className="font-bold text-md text-[#27B1FC]">
                    Post Actions
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-4 w-[90%]">
                  <div className="flex flex-row gap-2 justify-evenly">
                    <Button
                      onMouseEnter={() => {
                        StarIconRef.current?.startAnimation();
                      }}
                      onMouseLeave={() => {
                        StarIconRef.current?.stopAnimation();
                      }}
                      className={`flex-1 bg-yellow-500/40 hover:bg-yellow-500/70 ${post.Featured && "fill-white"} transition-all duration-300 text-slate-300 hover:text-white w-full`}
                      onClick={(e) => {
                        e.stopPropagation();
                        featurePost();
                      }}
                      disabled={totalFeatured === 3 && !post.Featured}
                    >
                      <StarIcon size={18} ref={StarIconRef} />
                      {post.Featured ? "Unfeature" : "Feature Post"}
                    </Button>
                    <Button
                      onMouseEnter={() => {
                        squareArrowRef.current?.startAnimation();
                      }}
                      onMouseLeave={() => {
                        squareArrowRef.current?.stopAnimation();
                      }}
                      className={`flex-1 bg-[#27B1FC]/60 hover:bg-[#27B1FC]/50 transition-all duration-300 text-slate-300 hover:text-white w-full`}
                      onClick={(e) => {
                        e.stopPropagation();
                        transferPost(false);
                      }}
                    >
                      <SquareArrowOutUpRightIcon
                        ref={squareArrowRef}
                        size={18}
                      />
                      View Post
                    </Button>
                  </div>

                  <div className="flex flex-row gap-2 justify-evenly">
                    <Button
                      onMouseEnter={() => {
                        userPenRef.current?.startAnimation();
                      }}
                      onMouseLeave={() => {
                        userPenRef.current?.stopAnimation();
                      }}
                      className={`flex-1 bg-[#222c36]/80 hover:bg-[#222c36]/70 transition-all duration-300 text-slate-300 hover:text-white w-full`}
                      onClick={(e) => {
                        e.stopPropagation();
                        transferPost(true);
                      }}
                    >
                      <UserPenIcon size={18} ref={userPenRef} />
                      Edit
                    </Button>

                    <Button
                      onMouseEnter={() => {
                        trashCanRef.current?.startAnimation();
                      }}
                      onMouseLeave={() => {
                        trashCanRef.current?.stopAnimation();
                      }}
                      className={`flex-1 text-destructive hover:bg-destructive/30 [&_svg]:text-destructive transition-all duration-300`}
                      onClick={(e) => {
                        // This stops the click going to the parent container and closes the expanded view
                        e.stopPropagation();
                        setExpanded(true);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <TrashIcon size={18} ref={trashCanRef} />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className="bg-[#555555] border-none"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-row gap-1">
              Delete <p className="font-bold italic">"{truncatedTitle}"</p>
            </DialogTitle>
            <DialogDescription className="text-white">
              Are you sure you want to delete this post? This will delete all
              comments and images associated as well.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
              }}
              disabled={updating}
            >
              Cancel
            </Button>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default PostCard;
