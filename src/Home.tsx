import { useEffect, useState } from 'react'
import { getAllPosts, getLivePicture } from './services/appwriteServices'
import HomeCard from './components/HomeCard';
import { Skeleton } from './components/ui/skeleton';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Button } from './components/ui/button';
import { useNavigate } from 'react-router-dom';

// Route: "/"
// Homepage: Main page highlighing most recent post and other noticable post/sections.
function Home() {

  // Posts array
  const [posts, setPosts] = useState<Post[]>([])

  // Skeleton loading state
  const [skeleton, setSkeleton] = useState(true)


  // TO DO: refine skeleton sizing and timing
  // Timeout for skeleton
  useEffect(() => {

    const change = () => {
      setSkeleton(false)
    }
    
    setTimeout(change, 250)

  }, [])
  

  // Fetches all posts
  const fetchPosts = async () => {

    try {
      
      const response = await getAllPosts();

      // Construct post object
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

      // Set all posts
      setPosts(unfiltered)
      
    } catch (error:any) {
      console.log("Error [Home.tsx]: Error getting all posts")
      console.log(error.message)
    }

  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const navigate = useNavigate()

  
  const heroPost = posts.find((p) => p.Userid === 'riyf20')
  
  const transferPost = () => {
    if (heroPost) {
      navigate(`/post/${heroPost.$id}`);
    }
  };

  const debug = false

  return (
    <div className='flex flex-row px-8 py-6 gap-4 pb-20'>

      <div className='flex-7/8'>

        {/* Show most recent post as hero */}
        <div className="mb-8 mt-2 relative overflow-hidden rounded-xl bg-[#171718] border border-[#222] transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_0_15px_#27B1FC] shadow-xl ">
          { heroPost && (
            <div
              className="h-95 w-full bg-cover bg-center flex items-end"
              style={{
                backgroundImage: heroPost.Pictures?.[0]
                  ? `url(${getLivePicture(heroPost.Pictures[0])})`
                  : "none",
              }}
            >
              <div className="w-full bg-linear-to-t from-black/80 via-black/40 to-transparent p-6">
                <p className="text-sm text-[#27B1FC] font-semibold mb-1">
                  Featured Post
                </p>
                <h1 className="text-2xl font-bold text-white">
                  {heroPost.Title}
                </h1>
                <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                  {heroPost.Body?.slice(0, 140)}...
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>{heroPost.Views} views</span>
                  <span>{heroPost.Likes ?? 0} likes</span>
                  <span>{heroPost.Saves ?? 0} saves</span>
                </div>

                <Button className="mt-4" onClick={transferPost} >
                  View Post
                </Button>
              </div>
            </div>
          )}
        </div>

        <div>
          <p className='text-[#27B1FC] font-bold text-[24px]' >Recent Posts</p>
          <div className='flex gap-3 mt-2'>
            {skeleton ?
              
              Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="w-52 bg-[#171718] border-none shadow-2xl"
                >
                  <CardHeader>
                    <Skeleton className=" h-40 w-full bg-[#1E1E20]" />
                  </CardHeader>
                  <CardContent className="flex flex-col -mt-2 -mb-3">
                    <Skeleton className="h-4 w-9/10 bg-[#1E1E20]" />
                    <Skeleton className="h-4 w-3/5 bg-[#1E1E20] mt-2" />
                  </CardContent>
                  <div className="flex px-5 flex-row pb-3">
                    <Skeleton className="w-6 h-6 rounded-full bg-[#1E1E20]" />
                    <Skeleton className="ml-auto h-6 w-3/5 bg-[#1E1E20]" />
                  </div>
                </Card>
              ))
              :
                posts.map((item:Post, index:number) => (
                
                  item.Userid === 'riyf20' &&
                  <HomeCard key={item.$id} post={item} delay={index * 0.1} />

                ))
            }

          </div>
        </div>

        <div className='mt-6'>
          <p className='text-[#27B1FC] font-bold text-[24px]' >All Posts</p>
          <div className='flex'>
            {skeleton ?
              
              Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="w-52 bg-[#171718] border-none shadow-2xl"
                >
                  <CardHeader>
                    <Skeleton className=" h-40 w-full bg-[#1E1E20]" />
                  </CardHeader>
                  <CardContent className="flex flex-col -mt-2 -mb-3">
                    <Skeleton className="h-4 w-9/10 bg-[#1E1E20]" />
                    <Skeleton className="h-4 w-3/5 bg-[#1E1E20] mt-2" />
                  </CardContent>
                  <div className="flex px-5 flex-row pb-3">
                    <Skeleton className="w-6 h-6 rounded-full bg-[#1E1E20]" />
                    <Skeleton className="ml-auto h-6 w-3/5 bg-[#1E1E20]" />
                  </div>
                </Card>
              ))
              :
                posts.map((item:Post, index:number) => (
                
                  <HomeCard key={item.$id} post={item} delay={index * 0.1} />

                ))
            }

          </div>
        </div>

      </div>

      {/* TO DO: make trending section */}
      {debug &&
        <div className='flex-1/8'>
          <p className='text-[#27B1FC] font-bold text-[24px]' >Trending Users</p>
          <div className='flex border-2 border-blue-400 h-40'>
          </div>
        </div>
      }


    </div>
  )
}

export default Home