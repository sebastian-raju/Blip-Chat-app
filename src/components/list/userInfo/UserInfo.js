import React from 'react'
import '../userInfo/UserInfo.css'
import { useUserStore } from '../../../lib/userStore'
import { auth } from '../../../lib/firebase';

function UserInfo() {

  const { currentUser } = useUserStore();

  const handleLogout = () => {

    document.body.classList.add('fade-out');

    setTimeout(()=>{// Clear user data from Zustand store
    useUserStore.setState({ currentUser: null, isLoading: false });
    // Sign out the user from Firebase authentication
    localStorage.clear();
    sessionStorage.clear();
    auth.signOut();
    window.location.reload();
    },200)
  };

  return (
    <div className='user-info-container'>
      <div className="user-details-container">
        <div className="profile-img-container">
          <img src={ currentUser?.avatar ||"https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png"} alt="" />
        </div>
        <div className="name-container">
          {currentUser?.username}
        </div>
      </div>
      <div className="user-options-container">
      {/* <i class="fa-solid fa-ellipsis"></i>
      <i class="fa-solid fa-video"></i>
      <i class="fa-regular fa-pen-to-square"></i> */}
      <div className="user-logout-btn" onClick={handleLogout}>
      <i class="fa-solid fa-right-to-bracket fa-sm"></i>
      </div>
      </div>
    </div>
  )
}

export default UserInfo
