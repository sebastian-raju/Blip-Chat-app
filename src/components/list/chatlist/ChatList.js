import React, { useEffect, useState } from 'react'
import '../chatlist/ChatList.css'
import AddUser from '../../addUser/AddUser';
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

function ChatList() {
  const [chats, setChats] = useState([]);
  const [toggle, setToggle] = useState(false);
  const {currentUser} = useUserStore();
  const { chatId, changeChat, isCurrentUserBlocked, isReceiverBlocked, resetChat } = useChatStore();
  const [input, setInput] = useState("");

  console.log(chatId);

  useEffect(()=>{
    const unSub = onSnapshot(doc(db, "userChats", currentUser.id), async (res) => {
      const data = res.data(); 
     const items = res.data().chats;

     const promises = items.map(async (item) => {
      const userDocRef = doc(db, 'users', item.receiverId);
      const userDocSnap = await getDoc(userDocRef);

      const user = userDocSnap.data();

      return {...item, user};
     })

     const chatData = await Promise.all(promises);

     setChats(chatData.sort((a,b)=> b.updatedAt - a.updatedAt));

     if (data.chatRemoved) {
      resetChat();
      await updateDoc(doc(db, "userChats", currentUser.id), {
        chatRemoved: false // Reset the flag
      });
    }
  });

  

  return ()=>{
    unSub();
  }
  },[currentUser.id])

  const handleSelect = async (chat) => {
    // if (isCurrentUserBlocked || isReceiverBlocked) {
    //   // If the current user is blocked, don't allow selection
    //   return;
    // }

    const userChats = chats.map(item=>{
      const {user, ...rest} = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, 'userChats', currentUser.id);

    try{
      await updateDoc(userChatsRef,{
        chats:userChats,
      })
    }catch(error){
      console.log(error);
    }

    changeChat(chat.chatId, chat.user)
  }

  const filteredChats = chats.filter((c)=>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );


  const handleRemoveUser = async (userId) => {
    try {
      // Delete the chat with the user from the userChats collection
      const userChatsRef = doc(db, 'userChats', currentUser.id);
      await updateDoc(userChatsRef, {
        chats: chats.filter(chat => chat.user.id !== userId)
      });

      // Delete the chat with the current user from the other user's chat list
      const otherUserChat = chats.find(chat => chat.user.id === userId);
      if (otherUserChat) {
        const otherUserChatsRef = doc(db, 'userChats', otherUserChat.user.id);
        const otherUserChatsSnap = await getDoc(otherUserChatsRef);
        if (otherUserChatsSnap.exists()) {
          const otherUserChats = otherUserChatsSnap.data().chats;
          const updatedOtherUserChats = otherUserChats.filter(chat => chat.chatId !== otherUserChat.chatId);
          await updateDoc(otherUserChatsRef, {
            chats: updatedOtherUserChats,
            chatRemoved: true // Add a flag to indicate that a chat was removed
          });
        }
      }

      resetChat();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className='chatlist-container'>
        <div className="search-container">
          <div className="inp-container">
            <input type="text" placeholder='search...' onChange={(e)=>setInput(e.target.value)}/>
            <i class="fa-solid fa-magnifying-glass fa-xl"></i>
          </div>
          <div className="plus-container" onClick={()=>{
            setToggle(prev=> !prev);
          }}>
          {
            toggle?
            <i class="fa-solid fa-minus "></i>
            :
            <i class="fa-solid fa-plus "></i>
          }
          </div>
        </div>
  
        <div className="main-chatlist">
  
          {
            filteredChats?.map(chat=>(
            <div className='single-container' style={{backgroundColor: chat?.isSeen ? "white" : "rgb(198, 213, 218)"}}>
              <div className="single-chat-container" key={chat?.chatId} onClick={()=>handleSelect(chat)}>
              <div className='single-chat-details'>
                <div className="single-chat-img-container">
                  <img src={
                    chat.user.blocked.includes(currentUser.id)?
                    "https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png":
                    chat.user.avatar ||"https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png"} alt="" />
                    {/* <img src={(isCurrentUserBlocked || isReceiverBlocked)?
                    "https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png":
                    chat?.user?.avatar ||"https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png" } alt="" /> */}
                </div>
                <div className="single-name-text-container">
                  <div className='single-name-container'>
                    {chat.user.blocked.includes(currentUser.id)
                    ? "User"
                    : chat.user.username}
                  </div>
                  <div className="single-text-container">
                    {chat?.lastMessage}
                  </div>
                </div>
              </div>
              <div className="delete-chat-btn" onClick={(e)=>{
                e.stopPropagation(); // Prevent event propagation to the parent container
                handleRemoveUser(chat?.user?.id);
                }}>
              <i class="fa-solid fa-circle-minus"></i>
              </div>
              </div>
            </div>
            ))
          }

          
 
  
        </div>
        
      </div>
      {toggle && <AddUser/>}
    </>
  )
}

export default ChatList
