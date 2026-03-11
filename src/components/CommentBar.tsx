import { EllipsisVerticalIcon } from './ui/ellipsis-vertical-icon'
import { images } from '../constants/images'
import { motion } from 'framer-motion'

// Comment bar used in the comment section of a post
function CommentBar({comment, index, delay}:CommentBarProps) {

  return (
    <motion.div
    initial={{ opacity: 0, scale: 0.99, y: 4 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{
        delay,
        type: "spring",
        opacity: {duration: 2},
        scale: {duration: 0.2}
    }}
        key={index} className='flex flex-row gap-2 items-center py-2 px-4'>
        <img src={images.profile} className='w-8 h-8 rounded-full'/>
        <div className=''>
            <p className='text-white font-semibold'>{comment.Userid}</p>
            <p className='text-white font-thin'>{comment.Body}</p>
        </div>
        {/* TO DO: make options for the bar */}
        <EllipsisVerticalIcon className='text-white ml-auto cursor-pointer' />
    </motion.div>
  )
}

export default CommentBar