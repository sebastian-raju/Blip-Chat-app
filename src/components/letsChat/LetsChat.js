import React from 'react'
import '../letsChat/LetsChat.css'

function LetsChat() {
  return (
    <>
      <div className='lets-chat-container'>
        
        <div className='backdrop'>
          <div className='middle-logo-container'>
            <img src="https://i.postimg.cc/HxPf2yvL/imageedit-1-9909645781.png" alt="" />
            <div className="lets-chat-title">
            <i className="fa-solid fa-circle-chevron-left fa-xl" style={{color:'rgb(9, 116, 124)', marginRight:"2px"}} ></i> Start chatting..
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LetsChat
