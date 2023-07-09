
document.addEventListener('DOMContentLoaded', function(){
    //implement login
    let log_err_line=document.getElementById("login_err")
    let log_btn=document.getElementById("login_btn")
    let main_cont= document.getElementById("main_cont")
    let login_cont= document.getElementById("login_cont")
    let logged_user= document.getElementById("logged_user")
    let user_email_=document.getElementById("user_email")
    let live_reload_lists_yes= document.getElementById("live_reload_lists_inp_yes")
    let live_reload_lists_no= document.getElementById("live_reload_lists_inp_no")
    let hide_video_suggestion_yes= document.getElementById("hide_video_suggestion_inp_yes")
    let hide_video_suggestion_no= document.getElementById("hide_video_suggestion_inp_no")

    let handlers_reload_info= document.getElementById("handlers_reload_info")
    //preserve popup input states on close/open 
    chrome.storage.local.get().then((strg)=>{
        //live list counter
        if(strg.live_reload_lists===true){
            live_reload_lists_yes.checked=true
            live_reload_lists_no.checked=false
        }else if (strg.live_reload_lists===false){
            live_reload_lists_no.checked=true
            live_reload_lists_yes.checked=false

        }
        //hide video suggestion
        if(strg.hide_video_suggestion===true){
            hide_video_suggestion_yes.checked=true
            hide_video_suggestion_no.checked=false
        }else if (strg.hide_video_suggestion===false){
            hide_video_suggestion_no.checked=true
            hide_video_suggestion_yes.checked=false

        }


    })



    live_reload_lists_yes.addEventListener("click", function(){
        live_reload_lists_no.checked=false
        handle_storage({"live_reload_lists":true})
        
    })

    live_reload_lists_no.addEventListener("click", function(){
        live_reload_lists_yes.checked=false

        handle_storage({"live_reload_lists":false})
    })

    hide_video_suggestion_yes.addEventListener("click", function(){
        hide_video_suggestion_no.checked=false
        handle_storage({"hide_video_suggestion":true})
        
    })

    hide_video_suggestion_no.addEventListener("click", function(){
        hide_video_suggestion_yes.checked=false

        handle_storage({"hide_video_suggestion":false})
    })

    log_btn.addEventListener("click",function (){
        //remove text from error line
        log_err_line.innerHTML=""
        //take email and pass
        let email_=document.getElementById("email_inp").value
        let pass_=document.getElementById("pass_inp").value

        const sending= chrome.runtime.sendMessage({
            action:log_btn.innerHTML,
            email:email_,
            pass:pass_
        })


        sending.then(function(response){
            console.log("response: ",response, typeof response)
            //change btn text only if correct login
            if (response !== null){
                if(log_btn.innerHTML === "Log in"){
                    main_cont.style["display"]="block"
                    login_cont.style["display"]="none"
                    log_btn.innerHTML = "Log out"
                    logged_user.innerHTML= "Connected as: "
                    user_email_.innerHTML= response.email
                    handlers_reload_info.style.display="block"
                                       
                }else if(log_btn.innerHTML ==="Log out"){
                    main_cont.style["display"]="none"
                    login_cont.style["display"]="flex"
                    log_btn.innerHTML = "Log in"
                    logged_user.innerHTML= ""
                    user_email_.innerHTML= ""
                    handlers_reload_info.style.display="none"

                }
            } else{
               log_err_line.innerHTML="<b>Try again</b> . If the error persists insert a valid email or password."
               window.close() // close on login click

            }
        }, function(e){
            console.log(e)
        })
    
    
    },false)

    
    
    //login if user in storage (if user close the popup without logout, the user is still logged in but the popup needs to reload the loggin)
    chrome.storage.local.get().then(function(response){
        if (response["user"]!==undefined){
           if (response["user"]!==null){
             log_btn.click()
             console.log("LOG AUTO CLICK")
           }
           
        }
    })


    
}, false)


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
      })
      
}

