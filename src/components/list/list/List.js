import React from 'react'
import '../list/List.css'
import ChatList from '../chatlist/ChatList'
import UserInfo from '../userInfo/UserInfo'

function List() {
  return (
    <div>
      <UserInfo/>
      <ChatList/>
    </div>
  )
}

export default List
