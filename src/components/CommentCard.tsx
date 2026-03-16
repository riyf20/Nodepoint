import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon, type ChevronDownIconHandle } from "./ui/animatedIcons/chevron-down-icon";
import { ChevronUpIcon, type ChevronUpIconHandle} from "./ui/animatedIcons/chevron-up-icon";
import CoverPhoto from "./CoverPhoto";
import { Button } from "./ui/button";
import { TrashIcon, type DashboardIconHandle } from "./ui/animatedIcons/trash-icon";
import { UserPenIcon, type UserPenHandle } from "./ui/animatedIcons/user-pen-icon";
import { Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle} from "./ui/dialog";
import { Spinner } from "./ui/spinner";
import { deleteComment, fetchSpecificPost, 
  getLivePicture} from "../services/appwriteServices";
import { SquareArrowOutUpRightIcon, 
  type SquareArrowOutUpRightIconHandle} from "./ui/animatedIcons/square-arrow-out-up-right-icon";
import { useNavigate } from "react-router";

// Comment block used to show all users comments in the posts page
function CommentCard({ comment, delay, onDelete }: CommentCardProps) {
  // Comment's assocaited post
  const [post, setPost] = useState<Post | null>(null);

  // Grabs the post (will be used to show posts's title and cover image)
  const fetchPost = async () => {
    try {
      const response = await fetchSpecificPost(comment.Postid);

      setPost(response as unknown as Post);

      setLoaded(true);
    } catch (error: any) {
      console.log("Error [CommentCard].tsx: Fetching post");
      console.log(error.message);
    }
  };

  // Will fetch post once comment is loaded
  useEffect(() => {
    if (comment) {
      fetchPost();
    }
  }, [comment]);

  // Post's cover image (first image)
  const [posterPicture, setPosterPicture] = useState(false);
  const [miniPictureId, setMiniPictureId] = useState<string>("");

  // Wil use default cover if post doesnt have any images
  const setPicture = async () => {
    if (post!.Pictures.length > 0) {
      setPosterPicture(true);

      let link = await getLivePicture(post!.Pictures[0]);

      setMiniPictureId(link);
    } else {
      setPosterPicture(false);
    }
  };

  // Calls the image cover function above
  useEffect(() => {
    if (post) {
      setPicture();
    }
  }, [post]);

  // Comment load state
  const [loaded, setLoaded] = useState(false);

  // If the comment block is expanded
  const [expanded, setExpanded] = useState(false);

  // Animated icons refs
  const ChevronUpIconRef = useRef<ChevronUpIconHandle>(null);
  const ChevronDownIconRef = useRef<ChevronDownIconHandle>(null);
  const userPenRef = useRef<UserPenHandle>(null);
  const trashCanRef = useRef<DashboardIconHandle>(null);
  const squareArrowRef = useRef<SquareArrowOutUpRightIconHandle>(null);

  // If delete comment prompt is open
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Shortended title used in the delete prompt
  const truncatedTitle =
    comment.Body.length > 30
      ? '"' + comment.Body.slice(0, 30) + "..." + '"'
      : comment.Body;

  // Update state
  const [updating, setUpdating] = useState(false);

  let navigate = useNavigate();

  // Sends user to posts page
  const transferPost = () => {
    navigate(`/post/${post!.$id}`, {
      state: { post },
    });
  };

  const handleCommentDelete = async () => {
    setUpdating(true);

    try {
      await deleteComment(comment.$id);
    } catch (error: any) {
      console.log("Error [CommentCard].tsx: Deleting comment");
      console.log(error.message);
    }

    setExpanded(false);

    // Will delete this comment in the posts page so it re-renders
    onDelete(comment.$id);

    setUpdating(false);
    setShowDeleteDialog(false);
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
      className="  bg-[#555555]/50 rounded-2xl cursor-pointer hover:shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.006] border border-white/16"
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
              src={miniPictureId}
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
          <p className="font-bold text-lg line-clamp-1">{comment.Body}</p>
          <p className="font-normal text-md">
            Commented on{" "}
            <span className="italic text-[#27B1FC] ">
              "{loaded && post!.Title}"
            </span>{" "}
          </p>
          <p className="text-muted-foreground">
            {format(new Date(comment.$createdAt), "MMM d")}
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
              {/* Comment */}
              <div className="flex-2/3">
                <div className="flex justify-start">
                  <p className="font-bold text-md text-[#27B1FC]">
                    Full Comment
                  </p>
                </div>
                <div className="flex flex-row justify-start gap-6 mt-4">
                  <div className="flex gap-2 ml-3 border-l-2 border-[#27B1FC] pl-3 italic text-md">
                    {comment.Body}
                  </div>
                </div>
              </div>

              {/* Comment ctions */}
              <div className="flex-1/6 flex flex-col items-center border">
                <div className="flex justify-center">
                  <p className="font-bold text-md text-[#27B1FC]">
                    Comment Actions
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-4 w-[90%]">
                  <Button
                    onMouseEnter={() => {
                      squareArrowRef.current?.startAnimation();
                    }}
                    onMouseLeave={() => {
                      squareArrowRef.current?.stopAnimation();
                    }}
                    className={`bg-[#27B1FC]/60 hover:bg-[#27B1FC]/50 transition-all duration-300 text-slate-300 hover:text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      transferPost();
                    }}
                  >
                    <SquareArrowOutUpRightIcon ref={squareArrowRef} size={18} />
                    View Post
                  </Button>

                  <div className="flex flex-row gap-2 justify-evenly">
                    <Button
                      onMouseEnter={() => {
                        userPenRef.current?.startAnimation();
                      }}
                      onMouseLeave={() => {
                        userPenRef.current?.stopAnimation();
                      }}
                      className={`flex-1 bg-[#222c36]/80 hover:bg-[#222c36]/70 transition-all duration-300 text-slate-300 hover:text-white`}
                      onClick={() => {
                        console.log("edit comment...");
                      }}
                      // TO DO: finish edit comment
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
              Are you sure you want to delete this comment? This action cannot
              be undone.
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
                handleCommentDelete();
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

export default CommentCard;
