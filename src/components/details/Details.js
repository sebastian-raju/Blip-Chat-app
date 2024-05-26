import React, { useEffect, useState } from 'react'
import '../details/Details.css'
import { auth, db } from '../../lib/firebase'
import { useChatStore } from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore';
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';



function Details() {

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();

  const { currentUser, listenToUserUpdates, updateCurrentUser } = useUserStore();

  const [otherUser, setOtherUser] = useState(user);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.id);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setOtherUser(docSnap.data());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    const unsubscribe = listenToUserUpdates(currentUser.id);
    return () => {
      unsubscribe();
    };
  }, [currentUser.id, listenToUserUpdates]);

  const handleBlock = async () => {
    if(!user) return

    const userDocRef = doc(db,"users", currentUser.id);
    const otherUserDocRef = doc(db, "users", user.id);

    try{
      const updatedBlocked = isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id);
      await updateDoc(userDocRef, {
        blocked: updatedBlocked
      });
      await updateDoc(otherUserDocRef, {
        blockedBy: isReceiverBlocked ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id)
      });

      // Update the local state to reflect the change immediately
      // setCurrentUser({
      //   ...currentUser,
      //   blocked: isReceiverBlocked
      //     ? currentUser.blocked.filter(id => id !== user.id)
      //     : [...currentUser.blocked, user.id]
      // });

      // Update the local state to reflect the change immediately
      updateCurrentUser({
        ...currentUser,
        blocked: isReceiverBlocked
          ? currentUser.blocked.filter((id) => id !== user.id)
          : [...currentUser.blocked, user.id],
      });

      changeBlock();
    }catch(error){
      console.log(error)
    }
  }

  const handleLogout = () => {

    document.body.classList.add('fade-out');

    setTimeout(()=>{// Clear user data from Zustand store
    useUserStore.setState({ currentUser: null, isLoading: false });
    // Sign out the user from Firebase authentication
    localStorage.clear();
    sessionStorage.clear();
    auth.signOut();
    window.location.reload();
    },500)
  };

  return (
    <div className='main-details-container'>
      <div className="sender-profile-information-container">
        <div className="sender-profile-picture">
          <img src={(isCurrentUserBlocked || isReceiverBlocked)?
                  "https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png":
                  otherUser?.avatar ||"https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png"} alt="" />
        </div>
        <div className="sender-name">{(isCurrentUserBlocked || isReceiverBlocked)?"User":otherUser?.username}</div>
        <div className="sender-status">{(isCurrentUserBlocked || isReceiverBlocked)?"":otherUser?.about}</div>
        <button className='block-button' onClick={handleBlock}><i className="fa-solid fa-ban"></i> {
          isCurrentUserBlocked ? "You are Blocked!" : isReceiverBlocked? "Unblock":
          "Block User"
        }</button>
      </div>

      {/* <div className="settings-container">
        <div className="options-settings-container">
          <div className="options-settings">Chat settings</div>
          <div className="spread-icon-container"><i class="fa-solid fa-angle-up"></i></div>
        </div>
        <div className="options-settings-container">
          <div className="options-settings">Shared photos</div>
          <div className="spread-icon-container"><i class="fa-solid fa-angle-down"></i></div>
        </div> */}

        {/* <div className="main-shared-photos-container">
          <div className='shared-photos-container'>
            <div className='shared-content-details'>
              <div className="shared-photo">
              <img src="https://i.postimg.cc/yxvMcbMj/Wolverine-1.avif" alt="" />
              </div>
              <div className="shared-photo-name">
                photo-2024.jpg
              </div>
            </div>
            <div className="download-container">
            <i class="fa-solid fa-download"></i>
            </div>
          </div>

          <div className='shared-photos-container'>
            <div className='shared-content-details'>
              <div className="shared-photo">
              <img src="https://i.postimg.cc/yxvMcbMj/Wolverine-1.avif" alt="" />
              </div>
              <div className="shared-photo-name">
                photo-2024.jpg
              </div>
            </div>
            <div className="download-container">
            <i class="fa-solid fa-download"></i>
            </div>
          </div>

          <div className='shared-photos-container'>
            <div className='shared-content-details'>
              <div className="shared-photo">
              <img src="https://i.postimg.cc/yxvMcbMj/Wolverine-1.avif" alt="" />
              </div>
              <div className="shared-photo-name">
                photo-2024.jpg
              </div>
            </div>
            <div className="download-container">
            <i class="fa-solid fa-download"></i>
            </div>
          </div>

          <div className='shared-photos-container'>
            <div className='shared-content-details'>
              <div className="shared-photo">
              <img src="https://i.postimg.cc/yxvMcbMj/Wolverine-1.avif" alt="" />
              </div>
              <div className="shared-photo-name">
                photo-2024.jpg
              </div>
            </div>
            <div className="download-container">
            <i class="fa-solid fa-download"></i>
            </div>
          </div>
          <div className='shared-photos-container'>
            <div className='shared-content-details'>
              <div className="shared-photo">
              <img src="https://i.postimg.cc/yxvMcbMj/Wolverine-1.avif" alt="" />
              </div>
              <div className="shared-photo-name">
                photo-2024.jpg
              </div>
            </div>
            <div className="download-container">
            <i class="fa-solid fa-download"></i>
            </div>
          </div>

        </div> */}
      {/* </div> */}

      <div className="logout-container">
        <button className='logout-btn' onClick={handleLogout}><i class="fa-solid fa-key"></i> Logout</button>
      </div>
    </div>
  )
}

export default Details
