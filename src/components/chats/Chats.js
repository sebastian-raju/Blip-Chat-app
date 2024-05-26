import React, { useEffect, useRef, useState } from 'react'
import '../chats/Chats.css'
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';

function Chats() {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();
  const [img, setImg] = useState({
    file: null,
    url:"",
  })


  useEffect(()=>{
    if (chat) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += 1000; // Adjust this value as needed
        }
      }, 100);
    }
  },[chat])

  // useEffect(()=>{
    
  //     endRef.current?.scrollIntoView({ behavior: "smooth" });
    
  // },[])

  useEffect(()=>{
    const unSub = onSnapshot(doc(db,"chats", chatId),(res)=>{
      setChat(res.data());
    } )

    return ()=>{
      unSub();
    }
  },[chatId])

  const handleEmoji = (e) =>{
    setInput(prev=> prev + e.emoji);
    setOpen(false);
  }


  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };


  const handleSend = async () =>{
    if(input === "") return;

    let imgUrl = null;

      try{

        if(img.file) {
          imgUrl = await upload(img.file)
        }

        await updateDoc(doc(db, "chats", chatId),{
          messages:arrayUnion({
            senderId: currentUser.id,
            text:input,
            createdAt:new Date(),
            ...(imgUrl &&  {img: imgUrl}),
          })
        });

        const userIDs = [currentUser.id, user.id];


        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, 'userChats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if(userChatsSnapshot.exists()){
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData?.chats.findIndex(c=>c.chatId === chatId);

          userChatsData.chats[chatIndex].lastMessage = input;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData?.chats,
          });
        }

        });
        
      }catch(error){
        console.log(error)
      }
      
      setImg({
        file:null,
        url:""
      });

      setInput("");
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  console.log(chat);

  return (
    <div className='main-chat-container'>

      {/* chat heading */}
      <div className="main-chat-details">
       <div className="main-chat-person-container">
        <div className="main-chat-img-container">
          <img src={(isCurrentUserBlocked || isReceiverBlocked)?
                  "https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png":
                  user?.avatar ||"https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png"} alt="" />
        </div>
        <div className="main-chat-name-container">
          <div className="main-chat-name">
          {(isCurrentUserBlocked || isReceiverBlocked)?"User":user?.username}
          </div>
          <div className="main-chat-status">
          {(isCurrentUserBlocked || isReceiverBlocked)?"":user?.about}
          </div>
        </div>
        </div> 

        <div className="main-chat-options-container">
        <i class="fa-solid fa-phone"></i>
        <i class="fa-solid fa-video"></i>
        <i class="fa-solid fa-ellipsis-vertical"></i>
        </div>
      </div>

      <div className="main-message-section" ref={scrollContainerRef}>
        <div className='backdrop-filter'>

          {/* <div className="main-message-container">
            <div className='message-content'>
              <div className="message-sender-pic">
                <img src="https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png" alt="" />
              </div>
              <div className="message-data">
                <div className='message-text'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ex aut reprehenderit sed autem voluptas ullam, quis corrupti consequatur doloremque ipsam impedit omnis rem quas maxime, dolores atque doloribus optio temporibus.</div>
              </div>
            </div>
            <div className="message-time">1 min ago</div>
          </div>         */}
          
          { chat?.messages?.map(message=>(
            <div className={message.senderId === currentUser?.id ?"main-message-container own":"main-message-container"} key={message?.createAt}>
            <div className='message-content'>
              <div className="message-data">
              {
                message?.img &&
                <img src={message?.img} alt="" />
              }
                <div className='message-text'>{message?.text}
                {/* <div className="message-time">{formatTimestamp(message.createdAt)}</div> */}
                </div>
              </div>
              
            </div>
            <div className="message-time">{formatTimestamp(message.createdAt)}</div>
          </div>
          ))
          }
          {img.url && <div className="main-message-container own">
            <div className='message-content'>
              <div className="message-data">
              
                <img src={img.url} alt="" />
                
              </div>
            </div>
          </div>
          }

      
          <div ref={endRef}></div>
        </div>
      </div>

      {/* main-chat-input */}
      <div className="main-chat-input-container">
        <div className='main-chat-input'>
          <div className='message-input-container'>
            <input type="text" name="" id="" placeholder={(isCurrentUserBlocked || isReceiverBlocked)? 'You cannot send message':'Type your message...'} value={input} onChange={(e)=>{setInput(e.target.value)}} disabled={isCurrentUserBlocked || isReceiverBlocked}/>
            <div className='emoji-container'>
              <i class="fa-regular fa-face-smile fa-lg" onClick={()=>{setOpen(prev=>!prev)}}></i>
              {open && <div className='emoji-picker'><EmojiPicker onEmojiClick={handleEmoji} /></div>}
              {/* <div className='emoji-picker'><EmojiPicker onEmojiClick={handleEmoji} open={open}/></div> */}
            </div>
          </div>
          <label htmlFor='file' className="input-options-container">
            <input type="file" id='file' style={{display:"none"}} onChange={handleImg}/>
            <i class="fa-solid fa-image"></i>
          </label>
        </div>
        <button className="message-send-btn" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
        <i class="fa-solid fa-paper-plane"></i>
        </button>
        </div>
    </div>
    //  <img src="https://i.postimg.cc/yxvMcbMj/Wolverine-1.avif" alt="" />
  )
}

export default Chats
