import { useEffect, useRef, useState } from 'react'
import { searchComments, searchPosts } from './services/appwriteServices'
import PostCard from './components/PostCard'
import { BookOpenIcon, type BookOpenIconHandle } from './components/ui/book-open-icon'
import { Button } from './components/ui/button'
import { useNavigate } from 'react-router'
import { MessageCircleIcon, type MessageCircleIconHandle } from './components/ui/message-circle-icon'
import CommentCard from './components/CommentCard'
import { AnimatePresence } from 'framer-motion'

// Route: "/posts"
// Posts page: Dashboard of logged in user's post and comments.
function Posts() {

  // Userid
  const userId = localStorage.getItem("userid")
  
  // Router navigation
  let navigate = useNavigate();

  // All users posts
  const [posts, setPosts] = useState<Post[]>([])

  // All users comments
  const [comments, setComments] = useState<Comments[]>([])

  // Fetch posts
  const fetchAllPosts = async () => {

    try {
      const response = await searchPosts(userId!)

      const unfiltered = response.documents.map((item) => {
        const current = {
          $id: item.$id,
          Title: item.Title,
          Body: item.Body,
          Pictures: item.Pictures,
          Comments: item.Comments,
          Userid: item.Userid,
          Views: item.Views,
          Likes: item.Likes,
          Saves: item.Saves,
          $createdAt: item.$createdAt,
          $updatedAt: item.$updatedAt,
        } as Post
        return current
      })

      if (response.documents.length > 0) {
        setPosts(unfiltered)
      } else {
        setPosts([])
      }

    } catch (error:any) {
      console.log("Error [Posts.tsx]: Fetching posts")
      console.log(error.message)

    }
  }

  const fetchAllComments = async () => {
    try {

      const response = await searchComments(userId!)

      const unfiltered = response.documents.map((item) => {
        const current = {
          $id: item.$id,
          Body: item.Body,
          Userid: item.Userid,
          Postid: item.Postid,
          $createdAt: item.$createdAt,
          $updatedAt: item.$updatedAt,
        }
        return current
      })

      if (response.documents.length > 0) {
        setComments(unfiltered)
      } else {
        setComments([])
      }

    } catch (error:any) {
      console.log("Error [Posts.tsx]: Fetching posts")
      console.log(error.message)

    }
  }

  useEffect(() => {
    fetchAllPosts()
    fetchAllComments()
  }, [userId])


  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(post => post.$id !== id))

    setComments(prev =>
      prev.filter(comment => comment.Postid !== id)
    )
  }

  const handleDeleteComment = (id: string) => {
    setComments(prev => prev.filter(comment => comment.$id !== id))
  }  
  // Animated icons ref
  const bookOpenIconRef = useRef<BookOpenIconHandle>(null)
  const messageCircleIconRef = useRef<MessageCircleIconHandle>(null)

  return (
    <div className='flex flex-col w-full items-center justify-center pb-25'>

      <div className=' w-[90%] mt-6 items-center justify-center'>

        <div className='flex flex-row'>
          <p className='text-[#27B1FC] font-bold text-[24px]' >Your Posts</p>
        </div>

        <div className='border-4 border-[#27B1FC]/60 mt-4 p-4 flex flex-col gap-4 rounded-2xl overflow-hidden'>
        
          {posts!.length > 0 ?
            
            <AnimatePresence>
              {posts?.map((item:Post, index:number) => (

                <PostCard key={item.$id} post={item} delay={index * 0.15} onDelete={handleDeletePost} />
              ))}
            </AnimatePresence>
            :
            <div className='bg-[#555555]/40 border-0 text-white w-[30%] self-center rounded-2xl p-8 transition-all duration-300 hover:-translate-y-0.5 hover:scale '
              onMouseEnter={() => bookOpenIconRef.current?.startAnimation()}
              onMouseLeave={() => bookOpenIconRef.current?.stopAnimation()}
            >
              <div className='font-bold flex flex-row gap-2 justify-center '>
                <BookOpenIcon size={18} ref={bookOpenIconRef} />
                No posts yet
              </div>
              <div className='text-muted-foreground text-sm p-2 text-center flex flex-col gap-4'>
                Create your first post to get started

                <Button className='w-1/2 self-center' onClick={() => {navigate('/createpost')}}>
                New Post
                </Button>
              </div>
            </div>
          }

        </div>

        <div className='flex flex-row mt-6'>
          <p className='text-[#27B1FC] font-bold text-[24px]' >Your Comments</p>
        </div>

        <div className='border-4 border-[#27B1FC]/60 mt-4 p-4 flex flex-col gap-4 rounded-2xl overflow-hidden'>
        
          {comments!.length > 0 ?
          
            <AnimatePresence>
              {comments?.map((item:Comments, index:number) => (

                <CommentCard key={item.$id} comment={item} delay={index * 0.15} onDelete={handleDeleteComment} />
              ))}
            </AnimatePresence>

            :
            <div className='bg-[#555555]/40 border-0 text-white w-[30%] self-center rounded-2xl p-8 transition-all duration-300 hover:-translate-y-0.5 hover:scale '
              onMouseEnter={() => messageCircleIconRef.current?.startAnimation()}
              onMouseLeave={() => messageCircleIconRef.current?.stopAnimation()}
            >
              <div className='font-bold flex flex-row gap-2 justify-center '>
                <MessageCircleIcon size={18} ref={messageCircleIconRef}/>
                No comments yet
              </div>
              <div className='text-muted-foreground text-sm p-2 text-center flex flex-col gap-4'>
                Create a comment and start a conversation!

                <Button className='w-1/2 self-center' onClick={() => {navigate('/')}}>
                  Browse posts
                </Button>
              </div>
            </div>
          }

        </div>

      </div>
    </div>
  )
}

export default Posts