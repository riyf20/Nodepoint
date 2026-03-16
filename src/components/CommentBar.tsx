import { EllipsisVerticalIcon } from "./ui/animatedIcons/ellipsis-vertical-icon";
import { images } from "../constants/images";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getLivePicture, getUserTable } from "@/services/appwriteServices";

// Comment bar used in the comment section of a post
function CommentBar({ comment, index, delay }: CommentBarProps) {
  
  const [username, setUsername] = useState("");
  const [hasProfilePic, setHasProfilePic] = useState(false);
  const [miniPictureId, setMiniPictureId] = useState<string>("");

  const getUserDetails = async () => {
    try {
      const response = await getUserTable(comment.Userid);

      setUsername(response.Username);

      if (response.ProfilePic) {
        setHasProfilePic(true);

        let link = await getLivePicture(response.ProfilePicId);

        setMiniPictureId(link);
      }
    } catch (error: any) {
      console.log("Error [CommentBar.tsx]: Fetching user");
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (comment) {
      getUserDetails();
    }
  }, [comment]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99, y: 4 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay,
        type: "spring",
        opacity: { duration: 2 },
        scale: { duration: 0.2 },
      }}
      key={index}
      className="flex flex-row gap-2 items-center py-2 px-4"
    >
      <img
        src={hasProfilePic ? miniPictureId : images.profile}
        className="w-8 h-8 rounded-full"
      />
      <div className="">
        <p className="text-white font-semibold">{username}</p>
        <p className="text-white font-thin">{comment.Body}</p>
      </div>
      {/* TO DO: make options for the bar */}
      <EllipsisVerticalIcon className="text-white ml-auto cursor-pointer" />
    </motion.div>
  );
}

export default CommentBar;
