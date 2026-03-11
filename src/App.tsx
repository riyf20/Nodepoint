import Navbar from './Navbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Search from './Search';
import Login from './Login';
import NotFound from './NotFound';
import Home from './Home';
import { useEffect, useState } from 'react';
import CreatePost from './CreatePost';
import Account from './Account';
import Posts from './Posts';
import { account } from './lib/appwrite';
import PostDetails from './PostDetails';
import ScrollToTop from './components/ScrollToTop';

// Main app logic | Routes
function App() {

  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  // Checks users auth state
  useEffect(() => {

    const checkUser = async () => {

      // Checks Appwrite session cookie
      const hasSession = localStorage.getItem('sessionid')

      if (!hasSession) {
        setLoggedIn(false);
        return;
      }

      try {
        const user = await account.get();
        setLoggedIn(!!user);
      } catch {
        setLoggedIn(false);
      }
    };

    checkUser();

    window.addEventListener("auth-changed", checkUser);

    return () => {
      window.removeEventListener("auth-changed", checkUser);
    };
  }, []);
  
  if (loggedIn === null) {
    return null;
  }

  return (

    <Router>

      <Navbar />
      <ScrollToTop/>
      <Routes>
        {/* Valid paths for all users */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />

        {/* Protected paths for logged in users */}
        <Route path='/createpost' element={ loggedIn ? <CreatePost /> : <Login/>  } /> 
        <Route path='/account' element={ loggedIn ? <Account /> : <Login/>  } /> 
        <Route path='/posts' element={ loggedIn ? <Posts /> : <Login/>  } /> 
        <Route path='/post/:id' element={<PostDetails /> } /> 

        {/* Not found boundary */}
        <Route path='*' element={<NotFound/>}></Route>
      </Routes>

    </Router>
  )
}

export default App
