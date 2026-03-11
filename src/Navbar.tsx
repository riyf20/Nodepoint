import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom";
import { images } from "./constants/images";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { getLivePicture, getUserTable, logOut } from "./services/appwriteServices";
import { account } from "./lib/appwrite";
import { UserIcon, type UserIconHandle } from "./components/ui/user-icon";
import { BookOpenIcon, type BookOpenIconHandle } from "./components/ui/book-open-icon";
import { LogoutIcon, type LogoutIconHandle } from "./components/ui/logout-icon";

// Dynamic navbar 
function Navbar() {

    // Router location + navigation
    const location = useLocation()
    let navigate = useNavigate();

    // Logo special characters
    const logo = '{_}'
    
    // Current tab
    const [tab, setTab] = useState<String | null>('Home');

    // User logged in state
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

    // Users profile picture + live link
    const [profilePic, setProfilePic] = useState<boolean>(false)
    const [profilePicLink, setProfilePicLink] = useState('')

    // Checks if user is logged in
    useEffect(() => {

        const checkUser = async () => {

            // Checks Appwrite session cookie
            const hasSession = localStorage.getItem('sessionid')

            if (!hasSession) {
                setLoggedIn(false)
                return
            }

            try {
                // Double checks with Appwrite 
                const user = await account.get()

                setLoggedIn(true)

                const response = await getUserTable(user.$id)

                localStorage.setItem('username', response.Username)
                localStorage.setItem('likes', JSON.stringify(response.Likes))
                localStorage.setItem('saves', JSON.stringify(response.Saves))

                // If user has profile picture store data
                if (response.ProfilePic) {
                    localStorage.setItem('profilePicture', response.ProfilePic)
                    localStorage.setItem('profilePictureId', response.ProfilePicId)
                    let link = getLivePicture(response.ProfilePicId)
                    setProfilePicLink(link)
                    setProfilePic(true)
                }
            } catch {
                setLoggedIn(false)
            }
        }

        checkUser()
    }, [location.pathname])

    // Checks any changes done to profile picture (ex: changed in settings)
    useEffect(() => {
      
        // Will get the id from event sent from the customevent
        const handleUpdate = (e: Event) => {
            const event = e as CustomEvent 
            const id = event.detail.id
            let link = getLivePicture(id)
            setProfilePicLink(link)
            setProfilePic(true)
        }

        window.addEventListener("profile-picture-updated", handleUpdate)

        return () => {
            window.removeEventListener("profile-picture-updated", handleUpdate)
        }
    }, [])

    // Handles auth changes
    useEffect(() => {

        const handleAuthChange = async () => {
            const hasSession = localStorage.getItem('sessionid')

            if (!hasSession) {
                setLoggedIn(false)
                setLoggedIn(false)
                setProfilePic(false)
                setProfilePicLink('')
            }
            
        }

            window.addEventListener("auth-changed", handleAuthChange)

            return () => {
                window.removeEventListener("auth-changed", handleAuthChange)
            }

    }, [])
    
    // Tab bar constants
    const tabBarNames = ['Home', 'Search', 'Log In', 'New Post']
    const tabBarRoutes = ['/', '/search', '/login']
    const tabBarRoutesLoggedIn = ['/createpost', '/account', '/posts']
    
    // Hides navbar for selected pages
    const hideNavBar = location.pathname === '/login' || (!loggedIn && tabBarRoutesLoggedIn.includes(location.pathname))

    // Switches active tab border
    useEffect(() => {
      
        switch (location.pathname) {
            case '/':
                setTab(tabBarNames[0])
                break;
            case '/search':
                setTab(tabBarNames[1])
                break;
            case '/createpost':
                setTab(tabBarNames[3])
                break;
            default:
                setTab(null)
                break;
        }

    }, [location.pathname])
    

    // Div location rev
    const navRef = useRef<HTMLDivElement>(null)
    
    // Animated icon refs
    const userIconRef = useRef<UserIconHandle>(null)
    const bookOpenIconRef = useRef<BookOpenIconHandle>(null)
    const logOutIconRef = useRef<LogoutIconHandle>(null)
    
    // Dynamic mouse data
    const [mousePos, setMousePos] = useState({x: 0, y:0})
    const [renderPos, setRenderPos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const animationRef = useRef<number>(0);

    // Stores mouse events
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = navRef.current?.getBoundingClientRect();
        if(!rect) return;

        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    // Mouse animation
    useEffect(() => {
        const animate = () => {
            setRenderPos(prev => ({
            x: prev.x + (mousePos.x - prev.x) * 0.1,
            y: prev.y + (mousePos.y - prev.y) * 0.1,
            }));
            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current!);
    }, [mousePos]);


    // Reusable tab bar component
    const tabBarOption = (index:number) => {
        return (
            <Link 
                onClick={() => {setTab(tabBarNames[index])}}
                to={ index===3 ? tabBarRoutesLoggedIn[0] : tabBarRoutes[index]}
                className={`group font-bold p-2 cursor-pointer rounded-md transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.03] ${tab===tabBarNames[index] ? 'bg-[#27B1FC]/30 shadow-[0_0_5px_#27B1FC] hover:shadow-[0_0_10px_#27B1FC]' : 'hover:bg-[#27B1FC]/15 hover:shadow-[0_0_25px_#27B1FC]'} `} >
                <span className={`text-transparent ${tab!==tabBarNames[index] && 'group-hover:text-[#27B1FC] transition-colors duration-200'} `}>{logo[0]} </span> 
                {tabBarNames[index]} 
                <span className={`text-transparent ${tab!==tabBarNames[index] && 'group-hover:text-[#27B1FC] transition-colors duration-200'} `}> {logo[2]}</span>
            </Link>
        )
    }

    // Logs out user
    const handleLogOut = async () => {
        
        try {
            logOut()

            // Clear local variables
            localStorage.removeItem('userid')
            localStorage.removeItem('sessionid')
            localStorage.removeItem('profilePicture')
            localStorage.removeItem('profilePictureId')
            localStorage.removeItem('likes')
            localStorage.removeItem('saves')
            localStorage.removeItem('username')
            sessionStorage.removeItem('viewedPosts')

            // Resets navbar data
            setLoggedIn(false)
            setProfilePic(false)
            setProfilePicLink('')

            window.dispatchEvent(new Event("auth-changed"));
            navigate('/')
        } catch (error:any) {
            console.log("Error [Navbar.tsx]: Error logging out")
        }
    }

    // Dropdown menu for user profile
    const profileOption = () => {
        return (
            <>
            <DropdownMenu>

                <DropdownMenuTrigger asChild>
                    <img 
                        src={ profilePic ? profilePicLink : images.profile} 
                        alt={`profile_pic`} 
                        className="w-10 h-10 object-cover rounded-full cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[#27B1FC]/15 hover:shadow-[0_0_25px_#27B1FC]"
                    />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                   className="relative right-5 top-5 bg-[#171718] scale-105"
                >

                    <DropdownMenuItem className="text-white font-bold cursor-pointer" onClick={() => {navigate('/account')}} onMouseEnter={() => {userIconRef.current?.startAnimation()}} onMouseLeave={() => {userIconRef.current?.stopAnimation()}} >
                        <UserIcon size={18} ref={userIconRef} />
                        Account
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-white font-bold cursor-pointer" onClick={() => {navigate('/posts')}} onMouseEnter={() => {bookOpenIconRef.current?.startAnimation()}} onMouseLeave={() => {bookOpenIconRef.current?.stopAnimation()}}>
                        <BookOpenIcon size={18} ref={bookOpenIconRef} />
                        Posts
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/40 [&_svg]:text-destructive font-bold cursor-pointer" onClick={handleLogOut} onMouseEnter={() => {logOutIconRef.current?.startAnimation()}} onMouseLeave={() => {logOutIconRef.current?.stopAnimation()}}>
                        <LogoutIcon size={18} ref={logOutIconRef} />
                        Log out
                    </DropdownMenuItem>

                </DropdownMenuContent>

            </DropdownMenu>

            </>
        )
    }

  return (

    !hideNavBar &&
        <div
        ref={navRef}
        onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        className="relative overflow-hidden bg-[#171718]/50 backdrop-blur-md border-b border-white/10 flex flex-row items-center py-4"
        >   

        <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
            opacity: isHovering ? 1 : 0,
            background: `radial-gradient(${isHovering ? '260px' : '140px'} circle at ${renderPos.x}px ${renderPos.y}px, rgba(39,177,252,0.35), transparent 70%),
                            radial-gradient(${isHovering ? '320px' : '180px'} circle at ${renderPos.x}px ${renderPos.y}px, rgba(139,92,246,0.15), transparent 75%)`,
            filter: 'blur(20px)',}}
        />       

            <Link to={'/'} onClick={() => setTab('Home')}>
                <p className='text-[28px] ml-4 font-bold'> 
                    <span className='text-[#27B1FC]'>{logo[0]} </span>
                    NODE
                    <span className='text-[#27B1FC]'>{logo[1]}</span>
                    POINT
                    <span className='text-[#27B1FC]'>{logo[1]} {logo[2]}</span>
                </p>
            </Link>

            <div className='flex flex-row ml-auto gap-4 mr-6'>

                {tabBarOption(0)}
                {loggedIn &&
                    tabBarOption(3)
                }
                {tabBarOption(1)}
                {loggedIn ?
                    profileOption()
                    :
                    tabBarOption(2)
                }

            </div>
        </div>
    
  )
}

export default Navbar