import { useEffect } from 'react';
import Chats from './components/chats/Chats';
import Details from './components/details/Details';
import Header from './components/header/Header';
import List from './components/list/list/List';
import Login from './components/login/Login';
import Notification from './components/notification/Notification';
import './styles/App.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useUserStore } from './lib/userStore';
import { useChatStore } from './lib/chatStore';
import LetsChat from './components/letsChat/LetsChat';
import UserComponent from './components/userComponent/UserComponent';



function App() {

  const {currentUser, isLoading, fetchUserInfo} = useUserStore();
  const {chatId} = useChatStore();

  useEffect(()=>{
    const unSub = onAuthStateChanged(auth, (user)=>{
      
          fetchUserInfo(user?.uid)
       
    });

    return ()=>{
      unSub();
    };
  },[fetchUserInfo])

  return (
    <div className="App">
      <Header/>
        {
          currentUser? isLoading?(<div className='loading-container'><div className="loading-gif"><img src="https://i.postimg.cc/MK78Fk09/Bean-Eater-1x-1-0s-200px-200px-1.gif" alt="" /></div></div>):(          
          <div className='chat-container'>
            <List/>
            {/* <Chats/>
            <Details/> */}
            {chatId ? <Chats/> : <LetsChat/> }
            {chatId ? <Details/> : <UserComponent/>}
            
          </div>
           )
          :
          isLoading?(<div className='loading-container'><div className="loading-gif"><img src="https://i.postimg.cc/MK78Fk09/Bean-Eater-1x-1-0s-200px-200px-1.gif" alt="" /></div></div>):
          (<div className='login-container'>
            <Login/>
           </div>)
        }
        <Notification/>
    </div>
  );
}

export default App;
