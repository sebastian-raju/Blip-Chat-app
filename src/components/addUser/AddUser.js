import React, { useState } from 'react'
import '../addUser/AddUser.css'
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from '../../lib/firebase';
import { useUserStore } from '../../lib/userStore';


function AddUser() {

  const [user, setUser] = useState(null);
  const {currentUser} = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username"); 

    try{

      const userRef = collection(db, "users");

      // Create a query against the collection.
      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q)

      if(!querySnapShot.empty){
        setUser(querySnapShot.docs[0].data());
      }

    }catch(error){
      console.log(error)
    }
  }

  const handleAdd = async () => {

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userChats");

    try{
      const newChatRef = doc(chatRef)

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: []
      })

      await updateDoc(doc(userChatsRef, user.id),{
        chats:arrayUnion({
          chatId: newChatRef.id,
          lastMessage:"",
          receiverId: currentUser.id,
          updatedAt:Date.now()
        })
      })

      await updateDoc(doc(userChatsRef, currentUser.id),{
        chats:arrayUnion({
          chatId: newChatRef.id,
          lastMessage:"",
          receiverId: user.id,
          updatedAt:Date.now()
        })
      })

    }catch(error){
      console.log(error)
    }
  }
 
  return (
    <div className='add-user-container'>
      <form className='input-username-form' action="" onSubmit={handleSearch}>
        <input type="text" name="username" id="" placeholder='Username' className='input-username'/>
        <button className="username-search-btn">Search</button>
      </form>
      {user && <div className="username-container">
        <div className="user-details-container">
          <img src={ user.avatar ||"https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png"} alt="" />
          <div className="add-username">{user.username}</div>
        </div>
          <button className='add-user-btn' onClick={handleAdd}>Add User</button>
      </div>}
    </div>
  )
}

export default AddUser
