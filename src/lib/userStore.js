import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading:true,
  fetchUserInfo: async(uid) => {
    if(!uid) return set({currentUser:null,isLoading:false});

    try{
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser : docSnap.data(), isLoading : false })
      } else {
        set({currentUser:null, isLoading:false});
      }

    }catch(error){
      console.log(error);
      return set({currentUser:null,isLoading:false});
    }
  },
  resetUserState: () => {
    set({ currentUser: null, isLoading: true });
  },

  // setCurrentUser: (user) => {
  //   set({ currentUser: user });
  // }

  updateCurrentUser: (updatedUser) => {
    set({ currentUser: updatedUser });
  },
  listenToUserUpdates: (uid) => {
    const userDocRef = doc(db, "users", uid);
    return onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        set({ currentUser: doc.data() });
      }
    });
  }
 
  
}))