import { useEffect, useState } from 'react'
import { getAllPosts, getLivePicture, getUserTable } from './services/appwriteServices'
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

  const [trendingUsers, setTrendingUsers] = useState<TrendingUsers[]>([])

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
        const current = item as unknown as Post
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

  const getTrendingUsers = async () => {
    const userStats: Record<string, { score: number; posts: number; views: number, likes: number }> = {}

    posts.forEach((item) => {
      const user = item.Userid
      const score = (item.Views * 0.6) + (item.Likes * 0.3) + (item.Comments.length * 0.1)

      if (userStats[user]) {
        userStats[user].score += score
        userStats[user].posts += 1
        userStats[user].views += item.Views
        userStats[user].likes += item.Likes
      } else {
        userStats[user] = {
          score: score,
          posts: 1,
          views: item.Views,
          likes: item.Likes
        }
      }
    })

    const sortedUsers = Object.entries(userStats)
      .map(([user, data]) => ({ user, ...data }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    const usersWithPictures = await Promise.all(
      sortedUsers.map(async ({ user, score, posts, views, likes }) => {
        const link = await getPicture(user)
        return {
          user,
          score,
          posts,
          views,
          likes,
          link: link ?? ''
        }
      })
    )

    setTrendingUsers(usersWithPictures)
  }

  useEffect(() => {
    if(posts) {
      getTrendingUsers()
    }
  }, [posts])


  const getPicture = async (user:string) => {
    try {
      const response = await getUserTable(user)

      if (response.ProfilePic) {

        return await getLivePicture(response.ProfilePicId);
      }
      
      return('')
      
    } catch (error:any) {
      console.log("Error [Home.tsx]: Getting trending user pictures");
    }
  }

  const handleProfile = (user: string) => {

    localStorage.setItem("trendingUsers", JSON.stringify(trendingUsers))

    navigate(`/profile/${user}`);

  }

  return (
    <div className='flex flex-row px-8 py-6 gap-4 pb-20'>

      <div className='w-10/12'>

        {/* Show most recent post as hero */}
        <div className="mb-8 mt-2 relative overflow-hidden rounded-xl bg-[#171718] border border-[#27B1FC]/30 transition-all duration-450 transform hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_0_15px_#27B1FC] shadow-xl ">
          {skeleton ?
            <Card
              className="w-full bg-[#171718] border-none shadow-2xl mb-6"
            >
              <CardHeader>
                <Skeleton className="h-95 w-full bg-[#1E1E20]" />
              </CardHeader>
              <CardContent className="flex flex-col -mt-2 -mb-3">
                <Skeleton className="h-4 w-1/4 bg-[#1E1E20]" />
                <Skeleton className="h-4 w-1/8 bg-[#1E1E20] mt-2" />
              </CardContent>
              <div className="flex px-5 flex-row pb-3">
                <Skeleton className="h-6 w-20 bg-[#1E1E20]" />
              </div>
            </Card>
          : heroPost && (
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

        <div className='h-1 w-full bg-[#27B1FC]/20 my-3 rounded-2xl' />

        <div>
          <p className='text-[#27B1FC] font-bold text-[24px]' >Recent Posts</p>
          <div className='flex gap-4 mt-2 mb-8 border transition-all duration-250 transform hover:border-[#27B1FC]/60 border-[#27B1FC]/20 rounded-2xl shadow-2xl p-5 bg-[#171718]'>
            {skeleton ?
              
              Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="w-58 bg-[#171718] border-none shadow-2xl"
                >
                  <CardHeader>
                    <Skeleton className="h-40 w-full bg-[#1E1E20]" />
                  </CardHeader>
                  <CardContent className="flex flex-col -mt-2 -mb-3">
                    <Skeleton className="h-4 w-9/10 bg-[#1E1E20]" />
                    <Skeleton className="h-4 w-3/5 bg-[#1E1E20] mt-2" />
                  </CardContent>
                  <div className="flex px-5 flex-row pb-3">
                    <Skeleton className="w-6 h-6 rounded-full bg-[#1E1E20]" />
                    <Skeleton className="ml-4 h-6 w-3/5 bg-[#1E1E20]" />
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

        <div className='h-1 w-full bg-[#27B1FC]/20 my-3 rounded-2xl' />

        <div className='mt-6'>
          <p className='text-[#27B1FC] font-bold text-[24px]' >All Posts</p>
          <div className='flex gap-4 mt-2 border transition-all duration-250 transform hover:border-[#27B1FC]/60 border-[#27B1FC]/20 rounded-2xl shadow-2xl p-5 bg-[#171718]'>
            {skeleton ?
              
              Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="w-58 bg-[#171718] border-none shadow-2xl"
                >
                  <CardHeader>
                    <Skeleton className="h-40 w-full bg-[#1E1E20]" />
                  </CardHeader>
                  <CardContent className="flex flex-col -mt-2 -mb-3">
                    <Skeleton className="h-4 w-9/10 bg-[#1E1E20]" />
                    <Skeleton className="h-4 w-3/5 bg-[#1E1E20] mt-2" />
                  </CardContent>
                  <div className="flex px-5 flex-row pb-3">
                    <Skeleton className="w-6 h-6 rounded-full bg-[#1E1E20]" />
                    <Skeleton className="ml-4 h-6 w-3/5 bg-[#1E1E20]" />
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

      <div className='w-2/12 sticky top-6 h-fit'>
        <p className='text-[#27B1FC] font-bold text-[24px]' >Trending Users</p>
        <div className='flex flex-col gap-2 mt-2 border border-[#27B1FC]/20 rounded-2xl shadow-2xl p-2.5 bg-[#171718]'>
          {
            skeleton ?
              Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="w-full bg-[#171718] border-none shadow-2xl my-2"
              >
                <CardContent className="flex flex-row p-2">
                  <Skeleton className="w-9 h-9 rounded-full bg-[#1E1E20]" />
                  <Skeleton className="h-7 flex-1 bg-[#1E1E20] mx-2 self-center" />
                </CardContent>
                <div className="flex px-5 flex-row pb-3">
                  <Skeleton className="ml-8 mr-2 h-3 flex-1 bg-[#1E1E20]" />
                  <Skeleton className="mr-2 h-3 flex-1 bg-[#1E1E20]" />
                </div>
              </Card>))
            :
            trendingUsers.map((item, index) => (
            <div key={index} onClick={() => handleProfile(item.user)} className="flex bg-[#1E1E20] p-2 rounded-md items-center hover:-translate-y-0.5 hover:scale-[1.03] transition-all duration-350 cursor-pointer hover:shadow-[0_0_8px_#27B1FC] shadow-2xl">
              <img
                src={item.link}
                alt={`Preview ${index}`}
                className='w-9 h-9 object-cover rounded-full'
              />
              <div className='ml-2 flex flex-col'>
                <span className="text-gray-300">{item.user}</span>
                <span className='text-xs text-gray-400'> {item.posts} posts | {item.views} views</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Home