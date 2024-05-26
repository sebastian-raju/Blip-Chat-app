import React, { useState } from 'react'
import '../login/Login.css'
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {auth, db} from '../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import upload from '../../lib/upload'
import { useUserStore } from '../../lib/userStore'



function Login() {
  const [show, setShow] = useState(true);
 
  const [avatar, setAvatar] = useState({ 
    file: null, 
    url: "" 
  });
  const [loading, setLoading] = useState(false);
  const { fetchUserInfo } = useUserStore(); 

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
      console.log(avatar.url);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      fetchUserInfo(auth.currentUser.uid); 
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password, about } = Object.fromEntries(formData);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);
      // const imgUrl = avatar.file ? await upload(avatar.file) : "https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png";
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        about,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userChats", res.user.uid), { chats: [] });
      toast.success("Account created! You can login now!");
      setShow(true);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {show?
       (<div className='main-signin-container'>
          <div className="signin-title">
            Welcome back !!
          </div>
          <form className='signin-form' onSubmit={handleLogin}>
            <div className="email-input-container">
              <input type="email" placeholder='Email*' name="email" id="" required />
            </div>
            <div className="password-input-container">
              <input type="password" placeholder='Password*' name="password" id="" required />
            </div>
            <button className='sign-in-btn' disabled={loading}>{loading? 'Loading':'Sign In'}</button>
          </form>
          <div className='registration-text' onClick={()=>{setShow(prev=>!prev)}}>Click if you aren't signed up ! <i className="fa-solid fa-circle-chevron-right fa-xl"></i></div>
        </div>)
        :
  
        (<div className="main-registration-container">
           <div className="create-account-title">
            Create an account
          </div>
          <div className="upload-image-container">
            <div className="dp-img"><img src={`${avatar.url}` ||`https://i.postimg.cc/W3k0tRZ1/istockphoto-1495088043-612x612.png`} alt="" /></div>
            <label htmlFor='file' className="upload-img">Upload image*</label>
            <input type="file" name="" id="file" onChange={handleAvatar}/>
          </div>
          <form className='registration-form' onSubmit={handleRegister}>
            <div className="username-input-container">
              <input type="text" placeholder='Username*' name="username" id="" required />
            </div>
            <div className="username-input-container">
              <input type="text" placeholder='About' name="about" id="" />
            </div>
            <div className="email-input-container">
              <input type="email" placeholder='Email*' name="email" id="" required/>
            </div>
            <div className="password-input-container">
              <input type="password" placeholder='Password*' name="password" id="" required/>
            </div>
          <button className='sign-up-btn' disabled={loading}>{loading? 'Loading':'Sign Up'}</button>
          </form>
          <div className='registration-text' onClick={()=>{setShow(prev=>!prev)}}>Click to go back to Login <i className="fa-solid fa-circle-chevron-left fa-xl" ></i></div>
        </div>)
      }
    </>
  )
}

export default Login
