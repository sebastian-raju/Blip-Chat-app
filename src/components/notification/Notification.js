import React from 'react'
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Notification() {
  return (
    <div>
      <ToastContainer position='bottom-right' closeOnClick autoClose={3000} transition={Bounce}/>
    </div>
  )
}

export default Notification
