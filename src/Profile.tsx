import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLivePicture, getUserTable, searchPosts } from './services/appwriteServices'
import { images } from './constants/images'
import { format } from 'date-fns'
import SpotlightCard from './components/reactbits/SpotlightCard'
import { FlameIcon } from './components/ui/animatedIcons/flame-icon'
import HomeCard from './components/HomeCard'
import GradientText from './components/reactbits/GradientText'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { Button } from './components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeftIcon } from './components/ui/animatedIcons/chevron-left-icon'
import { ChevronRightIcon } from './components/ui/animatedIcons/chevron-right-icon'

function Profile() {

    const {id} = useParams()

    const [user, setUser] = useState<User | null>(null)

    const fetchUser = async () => {

        if (!id) return

        try {
            const response = await getUserTable(id)

            setUser(response as unknown as User)
        } catch (error:any) {
            console.log("Error [Profile.tsx]: Error fetching user");
            console.log(error.message);
        }
    }

    // Will grab specific users details 
    useEffect(() => {
        fetchUser()
    }, [id])

    const [livePicture, setLivePicture] = useState('')

    const getUserProfilePicture = async () => {
        const link = getLivePicture(user!.ProfilePicId)
        setLivePicture(link)
    }

    // Will grab users profile picture if there is any
    useEffect(() => {
      if(user && user.ProfilePic) {
        getUserProfilePicture()
      }
    }, [user?.ProfilePic])
    
    // Grabs trending users list 
    const trendingUsers = JSON.parse(localStorage.getItem("trendingUsers") || '')
    const [trendingIndex, setTrendingIndex]= useState(-1)

    // If user is trending then stats will be shown below
    // TO DO: if user is not a trending user then i can calulate this when reading the posts below
    const [isTrending, setIsTrending] = useState(false);
    const [trendingPostsCount, setTrendingPostsCount] = useState(0)
    const [trendingViewsCount, setTrendingViewsCount] = useState(0)
    const [trendingLikesCount, setTrendingLikesCount] = useState(0)

    useEffect(() => {
      if(trendingUsers) {
        let current = trendingUsers.find((item:TrendingUsers, index: number) => {
            if(item.user === id) {
                setTrendingIndex(index)
                return item;
            }
        }) as TrendingUsers

        if(current) {
            setIsTrending(true)
            setTrendingPostsCount(current.posts)
            setTrendingViewsCount(current.views)
            setTrendingLikesCount(current.likes)
        }
       
      }
    }, [trendingUsers])

    const [allPosts, setAllPosts] = useState<Post[] | null>(null)
    const [featuredPosts, setFeaturedPosts] = useState<Post[] | null>(null)

    // Will get all posts and parse out user selected feature posts
    const geUsersPosts = async () => {

        if(!id) return

        try {
            const response = await searchPosts(id)

            const filtered = response.documents.map((item) => {
                return item as unknown as Post
            }) as Post[]

            setAllPosts(filtered)

        } catch (error:any) {
            console.log("Error [Profile.tsx]: Error fetching user's posts");
            console.log(error.message);
        }
    }

    useEffect(() => {
      if(user) {
        geUsersPosts()
      }
    }, [user])

    // User's top posts
    const [mostLiked, setMostLiked] = useState<Post | null>(null)
    const [mostViewed, setMostViewed] = useState<Post | null>(null)
    const [mostCommented, setMostCommented] = useState<Post | null>(null)


    // Will calculate users post
    useEffect(() => {

        if(!allPosts) return

        let topliked = 0
        let topviews = 0
        let topcommented = 0

        const featured: Post[] = []
        allPosts.map((item) => {
            if(item.Likes > topliked) {
                topliked = item.Likes
                setMostLiked(item)
            }
            if(item.Views > topviews) {
                topviews = item.Views
                setMostViewed(item)
            }
            if(item.Comments.length > topcommented) {
                topcommented = item.Comments.length
                setMostCommented(item)
            }
            if(item.Featured) {
                featured.push(item)
            }
        })

        setFeaturedPosts(featured)
      
    }, [allPosts])
    
    // Carousel controls
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
            setProgress(0)
        });
    }, [api, featuredPosts]);

    const plugin = React.useRef(
        Autoplay({ delay: 6000, stopOnInteraction: true }),
    );

    const navigate = useNavigate()

    const transferPost = (postId: string) => {
        if (postId) {
            navigate(`/post/${postId}`);
        }
    };

    const [showStats, setShowStats] = useState(false)

    const [progress, setProgress] = useState(0)

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
    <div className='flex flex-row px-8 py-6 gap-8 pb-20'>

        {user &&
            <>
                <div 
                    className='flex-2/8 sticky top-6 h-fit border border-[#27B1FC]/30 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_12px_#27B1FC] '
                >
                <SpotlightCard
                    className="custom-spotlight-card bg-[#171718] border-0  shadow-2xl rounded-2xl flex flex-col items-center p-4"
                    spotlightColor="rgba(39, 177, 252, 0.16)"
                  >

                    <img
                        src={livePicture.trim() ? livePicture : images.profile}
                        alt={`Profile pic`}
                        className='w-36 h-36 object-cover rounded-full'
                    />
                    

                    <div className='flex flex-col items-center'>
                        {isTrending &&
                            <span className="mt-3 px-3 py-1 text-sm rounded-full bg-orange-500/20 text-orange-400 flex items-center gap-1 flex-row justify-center shadow-[0_0_5px_rgba(249,115,22,0.3)]">
                                <FlameIcon size={14} /> Trending
                            </span>
                        }

                        <div className='flex flex-row items-end mt-2 gap-2'>
                            <h2 className="text-xl font-bold">{user.Name}</h2>
                            <p className="text-gray-400 text-sm">@{user.$id}</p>
                        </div>
                            

                        <p className="text-sm text-gray-300 mt-3 font-light ">{user.Bio}</p>

                        <p className='text-sm text-gray-300 mt-3 self-start'>Joined: {format(new Date(user.$createdAt), "MMM yyyy")}</p>
                    </div>

                    <div className='h-0.5 w-full bg-[#27B1FC]/20 m-3 rounded-2xl' />

                    {isTrending &&
                        <div className="text-sm text-gray-400">
                            <p>Ranked #{trendingIndex + 1} this week</p>
                        </div>
                    }

                    <div className="flex flex-wrap gap-4 mt-2 h-fit items-center justify-center">
                        <span className="px-3 py-1 text-sm rounded-full bg-[#27B1FC]/10 text-[#27B1FC] font-normal">
                            {trendingViewsCount} Views
                        </span>

                        <span className="px-4 py-2 text-md rounded-full bg-[#27B1FC]/10 text-[#27B1FC] font-semibold">
                            {trendingPostsCount} Posts
                        </span>

                        <span className="px-3 py-1 text-sm rounded-full bg-[#27B1FC]/10 text-[#27B1FC] font-normal">
                            {trendingLikesCount} Likes
                        </span>
                    </div>

                  </SpotlightCard>


                </div>

                <div className='flex-6/8 flex flex-col gap-4'>
     
                    {featuredPosts && featuredPosts?.length > 0 &&
                        <>
                            <GradientText
                                colors={['#FACC15', "#F59E0B", "#FFF176", "#FFD700"]}
                                className='px-2'
                            >
                                <p className='text-2xl font-bold'>{user.Name}'s Featured Posts</p>
                            </GradientText>
                            <div 
                                className='border transition-all duration-250 transform hover:border-[#FFD700]/40 border-[#FFD700]/20 rounded-2xl p-4 bg-[#171718] flex flex-col gap-4 justify-center items-center shadow-[0_0_6px_rgba(255,215,0,0.15)]'
                            >
                                <Carousel className='flex w-[98%] h-full rounded-2xl overflow-hidden'
                                    plugins={[plugin.current]}
                                    onMouseEnter={plugin.current.stop}
                                    onMouseLeave={ () => {
                                        plugin.current.reset() 
                                        plugin.current.play()
                                    }}
                                    setApi={setApi}
                                >
                                <CarouselContent >
                                    {featuredPosts?.map((item) => (
                                        <CarouselItem key={item.$id} onMouseEnter={() => {setShowStats(true)}} onMouseLeave={() => {setShowStats(false)}}>
                                            <AnimatePresence>
                                                <div
                                                    key={item.$id}
                                                    className="h-75 w-full bg-cover bg-center flex items-end"
                                                    style={{
                                                        backgroundImage: item.Pictures?.[0]
                                                        ? `url(${getLivePicture(item.Pictures[0])})`
                                                        : "none",
                                                    }}
                                                    >
                                                    <div className="w-full bg-linear-to-t from-black/90 via-black/60 to-transparent p-6 ">
                                                        <motion.div
                                                            initial={{ y: 0 }}
                                                            animate={{ y: -2 }}
                                                            exit={{y: 0}}
                                                            transition={{
                                                                delay: 100,
                                                                y: {
                                                                    type: "spring",
                                                                    stiffness: 0,
                                                                    damping: 50,
                                                                    // mass: 1
                                                                },
                                                            }}
                                                        >

                                                            <h1 className="text-2xl font-bold text-white">
                                                                {item.Title}
                                                            </h1>
                                                            <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                                                            {item.Body?.slice(0, 140)}...
                                                            </p>
                                                        </motion.div>

                                                        <AnimatePresence>
                                                            {showStats &&
                                                                <motion.div 
                                                                    initial={{ opacity: 0, y: 1 }}
                                                                    animate={{ opacity: 1, y: 0}}
                                                                    transition={{
                                                                        duration: 510,
                                                                        type: "spring",
                                                                        stiffness: 20,
                                                                        damping: 20,
                                                                    }}                                                            
                                                                    className="flex items-center gap-4 mt-3 text-xs text-gray-400"
                                                                >
                                                                    <span>{item.Views} views</span>
                                                                    <span>{item.Likes ?? 0} likes</span>
                                                                    <span>{item.Saves ?? 0} saves</span>
                                                                </motion.div>
                                                            }
                                                        </AnimatePresence>

                                                        <Button className="mt-4" onClick={() => {transferPost(item.$id)}} >
                                                            View Post
                                                        </Button>
                                                    </div>
                                                </div>
                                            </AnimatePresence>

                                        </CarouselItem>

                                    ))}
                                    {/* <CarouselItem>nothing...</CarouselItem> */}
                                </CarouselContent>
                                {/* <CarouselPrevious className='text-black' />
                                <CarouselNext className='text-black' /> */}
                                </Carousel>
                                

                                {count > 1 &&

                                    <div className='flex flex-col gap-3 w-[50%]'>

                                        <div className='flex flex-row items-center justify-center gap-4 px-8'>
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
                                        

                                        <div className="flex items-center justify-center gap-3">

                                            <div onClick={() => api?.scrollPrev()} className=" border flex items-center justify-center p-1 rounded-full border-[#27B1FC]/20 bg-black/20 shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03];">
                                                <ChevronLeftIcon className='text-[#27B1FC]/60' />
                                            </div>
                                            
                                            <div className=" flex flex-row gap-3 border border-[#27B1FC]/20 p-3 rounded-2xl bg-black/20 shadow-xl">
                                                <p className="text-xs font-thin "> Post {current} of {count} </p>
                                            </div>
                                            
                                            <div onClick={() => api?.scrollNext()} className="border flex items-center justify-center p-1 rounded-full border-[#27B1FC]/20 bg-black/20 shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03];">
                                                <ChevronRightIcon className='text-[#27B1FC]/60' />
                                            </div>

                                        </div>
                                    
                                    </div>
                                }

                            </div>
                       

                            <div className='h-0.5 w-full bg-[#27B1FC]/20 m-3 rounded-2xl' />
                        </>
                    }

                    {(mostLiked || mostViewed || mostCommented) &&

                        <>
                            <GradientText
                                colors={["#E2E8F0", "#FF758F", "#A78BFA"]}
                                className='px-2'
                            >
                                <p className='text-2xl font-bold'>Best of {user.Name}</p>
                            </GradientText>
                            <div className="border transition-all duration-250 transform hover:border-white/40 border-white/20 rounded-2xl shadow-2xl p-4 bg-[#171718] flex gap-4 flex-wrap">

                                {mostViewed &&
                                    <div className="flex-1 flex flex-col items-center min-w-62.5 ">
                                        
                                        <GradientText
                                            className="flex w-full text-sm font-semibold py-1 mb-4 shadow-[0_0_6px_#C8C8C8]"
                                            colors={["#C8C8C8", "#CAD5E2", "#E2E8F0"]}
                                            animationSpeed={4}
                                            showBorder
                                            >
                                            Most Viewed | {mostViewed?.Views} Views
                                        </GradientText>
                                        {mostViewed && <HomeCard post={mostViewed} delay={0.1} key={mostViewed.$id} best={1} />}

                                    </div>
                                }

                                {mostLiked &&
                                    <div className="flex-1 flex flex-col items-center min-w-62.5 ">

                                        <GradientText
                                            className="flex w-full text-sm font-semibold py-1 mb-4 shadow-[0_0_6px_#FF4D6D]"
                                            colors={["#FF4D6D", "#FF758F", "#FFB3C1"]}
                                            animationSpeed={4}
                                            showBorder
                                            >
                                            Most Liked | {mostLiked?.Likes} Likes
                                        </GradientText>
                                        {mostLiked && <HomeCard post={mostLiked} delay={0.2} key={mostLiked.$id} best={2} />}

                                    </div>
                                }

                                {mostCommented &&
                                    <div className="flex-1 flex flex-col items-center min-w-62.5 ">

                                        <GradientText
                                            className="flex w-full text-sm font-semibold py-1 mb-4 shadow-[0_0_6px_#5227ff]"
                                            animationSpeed={4}
                                            showBorder
                                            >
                                            Most Commented | {mostCommented?.Comments.length} Comments
                                        </GradientText>
                                        {mostCommented && <HomeCard post={mostCommented} delay={0.3} key={mostCommented.$id} best={3} />}

                                    </div>
                                }

                            </div>

                            <div className='h-0.5 w-full bg-[#27B1FC]/20 m-3 rounded-2xl' />
                        </>
                    }

                    <GradientText
                        colors={['#27B1FC', '#222c36', '#8B5CF6']}
                    >
                        <p className='text-2xl font-bold'>All posts by {user.Name}</p>
                    </GradientText>
                    <div 
                        className='border transition-all duration-250 transform hover:border-[#27B1FC]/40 border-[#27B1FC]/20 rounded-2xl shadow-2xl p-4 bg-[#171718] flex gap-4 flex-wrap'
                    >
                        { allPosts &&
                            allPosts?.map((item, index) => (
                                <HomeCard post={item} delay={index * 0.1} key={item.$id} />
                            ))
                        }
                    </div>

                </div>
            </>
        }
    </div>
  )
}

export default Profile