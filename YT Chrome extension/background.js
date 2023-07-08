import { initializeApp } from "/firebase/firebase-app.js";
import {getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword} from '/firebase/firebase-auth.js';
import {getFirestore, getDoc,getDocs,  setDoc, doc, updateDoc, arrayUnion, arrayRemove, collection, increment} from '/firebase/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDIH2ixZtIFLKfGHe-qmAiVEiZLB2qGFrU",
    authDomain: "thesis-yt-chrome-extension.firebaseapp.com",
    projectId: "thesis-yt-chrome-extension",
    storageBucket: "thesis-yt-chrome-extension.appspot.com",
    messagingSenderId: "198319187571",
    appId: "1:198319187571:web:2e4197ab4b8938c927ec06",
    measurementId: "G-YW7W10ZK5R"
  };

let firebase = initializeApp(firebaseConfig);
let auth = getAuth(firebase);
let db=getFirestore(firebase);

function alert(msg) { //alert is not usable in background
  chrome.notifications.create({
      type : 'basic',
      message : msg,
      title : 'Extension alert',
      iconUrl: chrome.runtime.getURL("yt_img.png"),
  });
}

function close_extention_popup(){
  chrome.runtime.sendMessage({action:"close extension popup"})
}

function signup_prompt(msg, yes_btn_text, no_btn_text, auth, data, user_blacklist, user_whitelist) { //alert is not usable in background
  chrome.notifications.create("",{
      type : 'basic',
      message : msg,
      title : 'Extension alert',
      iconUrl: chrome.runtime.getURL("yt_img.png"),
      buttons:[
              {
                title: yes_btn_text,
              },
              {
                title: no_btn_text,

              }
            ]
  }, function(id){
     
  });
  //add actions to the popup
  chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx){
    console.log(notifId, btnIdx)
    if(btnIdx===0){
      console.log("CONTINUE")

      //create a user and login
      createUserWithEmailAndPassword(auth, data.email.trim(), data.pass.trim())
      .then(function(){
        reload_active_tab()
        send_scores()
        handle_storage({"user":auth.currentUser.email.trim(), "black_list":user_blacklist, "white_list":user_whitelist, "password": data.pass.trim(), "live_reload_lists":true});
        //setTimeout(()=>{send_scores()},4000)
        

      }).catch((signup_err)=>{
        console.log("signup err", signup_err.message);
        //switch(signup_err.message){
        //  case "Firebase: Error (auth/email-already-in-use).":
        //    alert(`${data.email} is already taken. Choose another mail.`)
        //}
      })
      
      
    }else if(btnIdx===1){
      console.log("STOP")

      
    }
  })
}


  //send scores to content (impossible to store it in storage)
  //setTimeout(()=>{send_scores()},4000)

//listen for log in
chrome.runtime.onMessage.addListener((data, sender, sendResponse)=>{
 (async ()=>{
  if (data.action === "Log in"){
    console.log("SUCCESSFUL", data.email, data.pass, auth.currentUser)
    //console.log("SCORES", scores_dict)
    //get user blacklist
    let doc_ref= doc(db, "user", data.email.trim())
    //get user white and blacklist
    getDoc(doc_ref).then((docSnap)=>{
      let user_blacklist
      let user_whitelist
      if(docSnap.exists()){
        let docSnap_data= docSnap.data()
        user_blacklist= docSnap_data["black_list"]
        user_whitelist= docSnap_data["white_list"]
      } else{
        user_blacklist=[]
        user_whitelist=[]
      }

      signInWithEmailAndPassword(auth, data.email.trim(), data.pass.trim())
            .then(function(){
              reload_active_tab()
              send_scores()
              handle_storage({"user":auth.currentUser.email, "black_list":user_blacklist, "white_list":user_whitelist, "password": data.pass.trim(), "live_reload_lists":false, "hide_video_suggestion":false});
              //setTimeout(()=>{send_scores()},4000)
            })//
            .catch(async (login_err)=>{
              console.log("logine err", login_err.message);
              if (login_err.message==="Firebase: Error (auth/invalid-email)."){
                alert("Invalid email: use only valid email format")
              }else if (login_err.message==="Firebase: Error (auth/user-not-found)."){
                let signup_bool= signup_prompt("The account doesn't exists. Do you want to create it?", "Yes", "No", auth, data, user_blacklist, user_whitelist)
              }else if (login_err.message==="Firebase: Error (auth/wrong-password)."){
                alert("Wrong password: insert the correct password or create a new account")
              }



            });


      /*
      //create a user and login
      createUserWithEmailAndPassword(auth, data.email.trim(), data.pass.trim())
      .then(function(){
        reload_active_tab()
        send_scores()
        handle_storage({"user":auth.currentUser.email.trim(), "black_list":user_blacklist, "white_list":user_whitelist, "password": data.pass.trim(), "live_reload_lists":true});
        //setTimeout(()=>{send_scores()},4000)
        

      })
      .catch((err)=>{
        console.log(err.message)
        switch(err.message){
          case "Firebase: Error (auth/too-many-requests).": console.log("too many req");
          case "Firebase: Error (auth/email-already-in-use).":
            signInWithEmailAndPassword(auth, data.email.trim(), data.pass.trim())
            .then(function(){
              reload_active_tab()
              send_scores()
              handle_storage({"user":auth.currentUser.email, "black_list":user_blacklist, "white_list":user_whitelist, "password": data.pass.trim(), "live_reload_lists":true});
              //setTimeout(()=>{send_scores()},4000)
            })//
            .catch((err2)=>console.log(err2));
        }
      })
      */
    })


    // or, if already exists, just log in
  } else if (data.action === "Log out"){
    console.log("SUCCESSFUL logout")
    signOut(auth)
    .then(function(){
      reload_active_tab()
      handle_storage({"user":null, "black_list":null, "white_list":null, "password":null, "all_scores":null, "live_reload_lists":null, "hide_video_suggestion":null}); //, "all_scores":null {do not read all_scores if are already in storage (save reads on firebase)}
    })
    .catch((err)=>console.log(err))

  }


 })(sendResponse(auth.currentUser))

})

//listen for blacklist and safelist action
chrome.runtime.onMessage.addListener((data, sender, sendResponse)=>{
  (async ()=>{
    console.log("AUTH:", auth.currentUser)
    let storage_=await chrome.storage.local.get()
    let live_reload_lists= storage_["live_reload_lists"]
    /*  notification is useless 
    if(auth.currentUser===null && (data.action=="add to blacklist" || data.action==="remove from blacklist" || data.action==="add to whitelist" || data.action==="remove from whitelist")){
      
      
      //remove all notifications
      chrome.notifications.getAll((items) => {
        if ( items ) {
            for (let key in items) {
                chrome.notifications.clear(key);
            }
        }
      });
      //create a new notification
      chrome.notifications.create(
        "Example",
        {
          type:"basic",
          iconUrl:"yt_img.jpg",
          title:"LOG IN FIRST",
          message: "You need to login first. Go to the extension icon."
        }
      )
    }
    */

    //console.log("CHANNEL_aDRRES_TYPE: ", data.channel_address, data.channel_address.isArray())
    //channel or list of channels
    if (typeof data.channel_address === "string"){ //if single channel
      //handle BLACKLIST
      //let central_db_ref= doc(db,"central",data.channel_address) // ref to central in order to update blacklist and whitelist counter live
      //create document in central_db if channel does not exists
      //await setDoc(central_db_ref, {}, {merge:true})      

      if (auth.currentUser!==null && data.action==="add to blacklist"){
        //add ch to blacklist
        let doc_ref=doc(db,"user",auth.currentUser.email)
        setDoc(doc_ref,{black_list: arrayUnion(data.channel_address)}, {merge:true}) //update user list
        .then(function(){live_reload_lists===true ?update_firebase_scores(data.channel_address,data.action) :console.log("live reload is set to false") }) 
        .then(function(){//retrieve again blacklist
          getDoc(doc_ref).then((docSnap)=>{//live_reload_lists===true ?update_local_scores(data.channel_address) :console.log("live reload is set to false");
                                           handle_storage( {"black_list": docSnap.data()["black_list"]} ) })
        })

      } else if (auth.currentUser!==null && data.action==="remove from blacklist"){
        //remove ch from blacklist
        let doc_ref=doc(db,"user",auth.currentUser.email)
        setDoc(doc_ref,{black_list: arrayRemove(data.channel_address)}, {merge:true})
        .then(function(){live_reload_lists===true ?update_firebase_scores(data.channel_address,data.action) :console.log("live reload is set to false")})
        .then(function(){
          getDoc(doc_ref).then((docSnap)=>{//live_reload_lists===true ?update_local_scores(data.channel_address) :console.log("live reload is set to false");
                                           handle_storage( {"black_list": docSnap.data()["black_list"]} )})
        })

      }
      //handle WHITELIST
      else if (auth.currentUser!==null && data.action==="add to whitelist"){
        console.log("HANDLEIGN WHITELIST")
        //add ch to blacklist
        let doc_ref=doc(db,"user",auth.currentUser.email)
        setDoc(doc_ref,{white_list: arrayUnion(data.channel_address)}, {merge:true})
        .then(function(){ live_reload_lists===true ?update_firebase_scores(data.channel_address,data.action) :console.log("live reload is set to false")})
        .then(function(){
          getDoc(doc_ref).then((docSnap)=>{//live_reload_lists===true ?update_local_scores(data.channel_address) :console.log("live reload is set to false");
                                             handle_storage( {"white_list": docSnap.data()["white_list"]} ) })
        })

      } else if (auth.currentUser!==null && data.action==="remove from whitelist"){
        console.log("HANDLEIGN WHITELIST")
        let doc_ref=doc(db,"user",auth.currentUser.email)
        setDoc(doc_ref,{white_list: arrayRemove(data.channel_address)}, {merge:true})
        .then(function(){live_reload_lists===true ?update_firebase_scores(data.channel_address,data.action) :console.log("live reload is set to false") })
        .then(function(){
          getDoc(doc_ref).then((docSnap)=>{ //live_reload_lists===true ?update_local_scores(data.channel_address) :console.log("live reload is set to false");
                                             handle_storage( {"white_list": docSnap.data()["white_list"]} )})
        })

}
    //} else if(data.channel_address.isArray()){ // also correlated channels
    //  console.log("MULTIPLE CHANNELS")
      
    }
   

  })(sendResponse("done")) //send new black and white scores
})

/*
//check for url change
let old_url=""
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
  console.log("URLS: ", old_url, changeInfo.url)
  if (changeInfo.url && changeInfo.url!=undefined && changeInfo.url!==old_url){
    old_url=changeInfo.url
    if (changeInfo.url.includes("/shorts/") && !old_url.includes("/shorts")){    //handle story change (otherwise reloads at each short change)
      console.log("CHANGED URL")
      chrome.tabs.reload(tabId)
    }else if(!changeInfo.url.includes("/shorts/")){ //handle any other change
      console.log("CHANGED URL")
      chrome.tabs.reload(tabId)
    }
    

  }
  
})
*/
//check for url change
let old_url=""
let hist_page_count=0
let home_page_count=0
let search_page_count=0
let video_page_count=0
let channel_page=0
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=>{
  setTimeout(()=>{
    console.log("URL: ",  changeInfo.url, hist_page_count, home_page_count, search_page_count, video_page_count)  
    if(changeInfo.url !== undefined){
      if (changeInfo.url &&  changeInfo.url!==old_url){
        if (changeInfo.url.includes("/shorts/") && !old_url.includes("/shorts") & hist_page_count==0){    //handle story change (otherwise reloads at each short change)
          console.log("CHANGED TO SHORTS URL")
          old_url=changeInfo.url
          chrome.tabs.reload(tabId)
          //hist_page_count=1  //it seems that shorts page need reload each time SO NO COUNTER
  
        }else if(!changeInfo.url.includes("/shorts/") && old_url!==changeInfo.url){ //handle any other change
          console.log("CHANGED URL")
          old_url=changeInfo.url

          if(changeInfo.url.includes("results?search_query=") && search_page_count==0){
            //search_page_count=1
            chrome.tabs.reload(tabId)

          }else if(changeInfo.url==="https://www.youtube.com/" && home_page_count==0){
            home_page_count=1
            chrome.tabs.reload(tabId)
        
          }else if(changeInfo.url.includes("/watch?") && video_page_count==0){
              video_page_count=1
              chrome.tabs.reload(tabId)
          }
        }
      }
    }
  },1000)
 
  
  
})

async function handle_storage(obj){
  let storage_= await chrome.storage.local.get()
  //update storage
  Object.entries(obj).map(d=>storage_[d[0]]=d[1])
  chrome.storage.local.set(storage_)
  
  chrome.storage.local.get().then((response)=>console.log("NEW STORAGE: ", response))
}

function reload_active_tab(){
  //reload tab
  chrome.tabs.query({
     active:true,
     lastFocusedWindow:true
   }, function(tabs){
     let tab_idx= tabs[0].id
     chrome.tabs.reload(tab_idx)
     console.log("reloaddd")
   })

   //send scores to content (impossible to store it in storage)
  //setTimeout(()=>{send_scores()},4000)
  
}

//_OLD functions are for "central" (list of channels, wates too many reads)

function send_scores_OLD(){
    //check if scores are already in stroge (save firebase reads)
    //this approach is problematic: local storage persists also to closed browser and pc reboot
    //this means that not posing all_scores to null when logging out, then scores will not be reloaded again
    // a possible solution is that to create a document with all the scores inside in order to read data only once! 
    // the form would be a dict having as keys channels and as values another dict containing the scores for that channel
  
    chrome.storage.local.get().then((storage_)=>{
      console.log("STORAGE", Array(Object.keys(storage_)))

      if ( storage_["all_scores"]===null || !Object.keys(storage_).includes("all_scores")){ //read all document in central collection IFF they are not in the local storage 
        //get all channels scores
        let scores_collection_ref= collection(db, "central")
        getDocs(scores_collection_ref).then((docsSnap)=>{
          let scores_dict={}
          docsSnap.forEach((doc)=>{
            console.log(doc.id + "==>"+ doc.data()["comment_vulgarity_score"])
            scores_dict[doc.id]=doc.data()
          })
          handle_storage({"all_scores":scores_dict})
          console.log("scores updated")
        })

      } else if (storage_["all_scores"]!==null|| Object.keys(storage_).includes("all_scores") ){ //else skip (otherwise it would read all documents at each login and this will not be usefull as centralized data is the same for all users)
        console.log("scores already in storage")
        return
      }
    })


    
}

function update_local_scores_OLD(ch_name, field){
  //get all channels scores
  let scores_collection_ref= doc(db, "central", ch_name)
  getDoc(scores_collection_ref).then(async (docSnap)=>{
    let newscores= docSnap.data()
    let storage_ = await chrome.storage.local.get()
    let old_scores= storage_["all_scores"]
    //update old_scores for that channel
    old_scores[ch_name]=newscores
    handle_storage({"all_scores":old_scores})
  })
  
}

//these are for "central_dict" (dict of channels, saves reads)

function send_scores(){
  //check if scores are already in stroge (save firebase reads)
  //this approach is problematic: local storage persists also to closed browser and pc reboot
  //this means that not posing all_scores to null when logging out, then scores will not be reloaded again
  // a possible solution is that to create a document with all the scores inside in order to read data only once! 
  // the form would be a dict having as keys channels and as values another dict containing the scores for that channel

  chrome.storage.local.get().then((storage_)=>{
    console.log("STORAGE", Array(Object.keys(storage_)))

    if ( storage_["all_scores"]===null || !Object.keys(storage_).includes("all_scores")){ //read all document in central collection IFF they are not in the local storage 
      let scores_collection_ref= doc(db, "central_dict","all_channels")
      getDoc(scores_collection_ref).then((docSnap)=>{
        let doc=docSnap.data()
        let scores_dict=doc["channels"]
        console.log("CENTRAL SCORES DICT_", doc, scores_dict)
        handle_storage({"all_scores":scores_dict})

      }).catch((error)=>{console.log("CENTRAL SCORES DICT_", error)})

    } else if (storage_["all_scores"]!==null|| Object.keys(storage_).includes("all_scores") ){ //else skip (otherwise it would read all documents at each login and this will not be usefull as centralized data is the same for all users)
      console.log("scores already in storage")
      return
    }
  })


  
}

function update_local_scores(ch_name, field){
//get all channels scores
let scores_collection_ref= doc(db, "central_dict","all_channels")
getDoc(scores_collection_ref).then(async (docSnap)=>{
  let newscores= docSnap.data()["channels"][ch_name]
  let storage_ = await chrome.storage.local.get()
  let old_scores= storage_["all_scores"]
  //update old_scores for that channel
  old_scores[ch_name]=newscores

  handle_storage({"all_scores":old_scores})
})

}

function update_firebase_scores(ch_name, action){
 
    //read data, update and return it to firebase
    let central_db_ref=doc(db,"central_dict","all_channels")
    let score_= action.split(" ").slice(-1)[0]
    console.log("SCORE_", action, score_)
    let score_label= score_+"_score"
    getDoc(central_db_ref).then(async (docSnap)=>{
      let channels_dict_old= docSnap.data()["channels"]
      console.log("channel keys: ",[...Object.keys(channels_dict_old)], ![...Object.keys(channels_dict_old)].includes(ch_name) )
      if (![...Object.keys(channels_dict_old)].includes(ch_name)){
        channels_dict_old[ch_name]={"blacklist_score":0, "whitelist_score":0}
      }
      let ch_scores_old= channels_dict_old[ch_name]
      if (action.includes("add")){
        console.log("ADD", score_)
        if (ch_scores_old[score_label]<0 || ch_scores_old[score_label]===undefined){
          ch_scores_old[score_label]= 0+1
        }else{
          ch_scores_old[score_label]= ch_scores_old[score_label]+1
        }
      }else if (action.includes("remove")){
        console.log("REMOVE", score_)
        //0 if val is minor than 0
        if( ch_scores_old[score_label]-1 <0 || ch_scores_old[score_label]===undefined){
          ch_scores_old[score_label]= 0
        }else {
          ch_scores_old[score_label]= ch_scores_old[score_label]-1
        }
      }

      channels_dict_old[ch_name]= ch_scores_old //add updated channel to old scores

      let final_data= {"channels":channels_dict_old}
      console.log("FINAL DATA", final_data)
      return final_data

      
    }).then((final_data)=>{
      setDoc(central_db_ref, final_data).then(()=>{console.log("local update done"),update_local_scores(ch_name)}) //update 
    })

  
}

