import { useEffect, useState } from "react";
import { getLivePicture, getUserTable } from "../services/appwriteServices";
import { images } from "../constants/images";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CoverPhoto from "./CoverPhoto";

// Card view of posts used in the homepage
function HomeCard({ post, delay }: HomeCardProps) {

  // Posts image states
  const hasImages = (post.Pictures.length > 0);

  const [coverImage, setCoverImage] = useState("");

  // Will grab image ids if there are any
  useEffect(() => {
    if (hasImages) {
      const id = getLivePicture(post.Pictures[0]);
      setCoverImage(id);
    }
  }, [hasImages]);

  // Post's author profile picture
  const [profilePic, setProfilePic] = useState(false);
  const [profilePicLink, setProfilePicLink] = useState("");

  // Grabs the authors data
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUserTable(post.Userid);
      if (user.ProfilePic) {
        let link = getLivePicture(user.ProfilePicId);
        setProfilePicLink(link);
        setProfilePic(true);
      } else {
        setProfilePic(false);
        setProfilePicLink("");
      }
    };

    fetchUser();
  }, [post]);

  let navigate = useNavigate();

  // Will transfer to specific post
  const transferPost = () => {
    navigate(`/post/${post.$id}`, {
      state: { post },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay,
      }}
      onClick={transferPost}
      className="flex w-52 flex-col cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_0_15px_#27B1FC] shadow-xl p-2 rounded-2xl"
    >
      {hasImages ? (
        <img
          src={coverImage.length > 0 ? coverImage : images.profile}
          alt={`cover_pic`}
          className="w-full h-48 rounded-xl object-cover"
        />
      ) : (
        <div className="relative h-48 bg-[#27B1FC]/10 rounded-xl overflow-hidden">
          
          <CoverPhoto textScale="scale-75" />
        </div>
      )}

      <p className="mt-2 mb-2 line-clamp-2">{post.Title}</p>

      <div className="flex flex-row gap-2 font-extralight mt-auto">
        <img
          src={profilePic ? profilePicLink : images.profile}
          alt={`cover_pic`}
          className="w-6 h-6 rounded-full object-cover"
        />

        {format(new Date(post.$createdAt), "MMM d, yyyy")}
      </div>
    </motion.div>
  );
}

export default HomeCard;
