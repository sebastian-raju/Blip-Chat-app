import React from 'react'
import '../userComponent/UserComponent.css'
import { auth } from '../../lib/firebase'
import { useUserStore } from '../../lib/userStore';

function UserComponent() {

  const { currentUser } = useUserStore();

  return (
    <div className='user-component-container'>
      <img src={ currentUser?.avatar ||"https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png"} alt="" />
      <div className="user-component-name">
      {currentUser?.username}
      </div>
      <div className="user-component-status">
        {currentUser?.about}
      </div>
      <button className="user-component-logout" onClick={()=>{auth.signOut()}}><i class="fa-solid fa-key"></i> Logout</button>
    </div>
  )
}

export default UserComponent
