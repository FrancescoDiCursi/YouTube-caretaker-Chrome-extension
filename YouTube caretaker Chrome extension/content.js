


//
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }


//let black_list

//list of deviant channel address 
//understand how to set the database
//meanwhile use a test list

let home_url="https://www.youtube.com/"
let search_url="https://www.youtube.com/results?search_query="
let video_url="https://www.youtube.com/watch?v="

let home_thumbs="ytd-rich-item-renderer"
let search_thumbs="ytd-video-renderer"
let video_thumbs="ytd-compact-video-renderer"


let old_url=""
let n_old_els=0
let ch_addresses=[]


let current_story_id=-1
suggestion_hidden=false





setTimeout(()=>{

    if (document.readyState !== 'loading'){ //
        chrome.storage.local.get().then((response)=>{
            let black_list= response["black_list"]!==undefined ?response["black_list"] :[]
            let white_list= response["white_list"]!==undefined ?response["white_list"] :[]
            let all_scores= response["all_scores"]!==undefined ?response["all_scores"] :[]
            let password=response["password"]!==undefined ?response["password"] :[]
            console.log("INITIAL RESPOSNE: ", response, black_list, white_list, all_scores)
            let show_unsafe= response["show_unsafe"]
            let hide_video_suggestion= response["hide_video_suggestion"]
            let logged_user= response["user"]
        
            console.log("BLACK: ", black_list)
            console.log("CHANNEL NAME", document.querySelectorAll("ytd-reel-video-renderer")) //[1].querySelector("#channel-info > a").getAttribute("href"))
            console.log("LOGGED USER", logged_user)
            if(logged_user!==undefined){
                if(logged_user!==null){
                    try{
                        const callback= (mutationList, observer)=>{
                            console.log("mutation", mutationList)
                            let story_renderer=document.querySelectorAll("[is-active]")[1]
                            let story_channel_name= story_renderer.querySelector("#channel-info > a").getAttribute("href").replace("/","")
                            console.log(story_channel_name)
                            if (black_list.includes(story_channel_name)){
                                console.log(story_channel_name)
                                current_story_id=document.querySelectorAll("[is-active]")[1].getAttribute("id")
                                setTimeout(()=>{
                                    try{
                                        console.log("remove short")
                                        let target_story=document.querySelector(`ytd-reel-video-renderer[id="${current_story_id}"]`)
                                        target_story.remove()
                                    }catch{
                                        console.log("no short")
                                    }
                                    
        
                                },2000)                        
                            } else{
                                //check for opened shorts' comment section
                                //(if it is open and one changes the shorts and then come back to this, the comment section is bugged. so close and reopen it)
                                //// sometimes in triggers the shorts page counter in background.js
                                //// remove this else condition if the problem persists
                                setTimeout(()=>{
                                   if(document.querySelector(`[is-active][is-watch-while-mode]`)!==null ){
                                    console.log(" SHORTS COMMENT: ",  document.querySelector("div#actions > div#comments-button > ytd-button-renderer > yt-button-shape > label > button"))
                                    let story_renderer=document.querySelectorAll("[is-active]")[1]
                                    story_renderer.querySelector("div#actions > div#comments-button > ytd-button-renderer > yt-button-shape > label > button").click()
                                   }
                                },500)
                            }
                            
                    }
                    const stories_observer=new MutationObserver(callback)
                    const stories_progress_bar=   document.querySelector("yt-page-navigation-progress")//document.getElementsByTagName("ytd-shorts")[0]
                    const observer_config = { attributes: true};
                    stories_observer.observe(stories_progress_bar, observer_config)
        
                    }catch{
                        console.log("no stories page")
                    }
                   
                    /*
                    if (window.location.href.includes("/shorts/")){
        
                        setTimeout(()=>{
                            console.log("CHANNEL NAME", document.querySelectorAll("ytd-reel-video-renderer")) //[1].querySelector("#channel-info > a").getAttribute("href"))
                            let story_channel_names= document.querySelectorAll("[is-active]")[1].querySelector("#channel-info > a").getAttribute("href")
                            document.body.innerHTML= "Shorts are blocked.<br> <a href='https://www.youtube.com'> Go back to the home. </a>"
                            document.body.style.fontSize="50px"
                            //document.body.style.marginLeft="25%"
                            document.body.style.marginTop="20%"
                            document.body.style.textAlign="center"
                            //document.getElementsByTagName("html")[0].
                           
                        },3000)
        
                    }
                    */
                    var default_bg_color= "rgba(226, 223, 210,0.5)"
        
        
                    
        
                    addEventListener("scroll", (event)=>{
        
                        if(window.location.href.includes("/shorts/")){
                            
                        }
                        //disable video page if in blacklist
                        if (window.location.href.includes("/watch?v=") && suggestion_hidden===false){
                            setTimeout(()=>{
                                //check if it is a video of an unsafe channel. If so, obscure it.
                                let video_auth_ch_address="@"+document.getElementById("text-container")
                                .getElementsByTagName("a")[0].getAttribute("href").split("@")[1]
                                console.log("VIDEO ADDRS",video_auth_ch_address)
                                if (black_list.includes(video_auth_ch_address)){
                                document.body.innerHTML= "Videos by "+ video_auth_ch_address + " are blocked.<br> <a href='https://www.youtube.com'> Go back to the home. </a>"
                                document.body.style.fontSize="50px"
                                //document.body.style.marginLeft="25%"
                                document.body.style.marginTop="20%"
                                document.body.style.textAlign="center"
                                //document.getElementsByTagName("html")[0].appendChild(new_body)
                                }
        
                                //disable suggestions
                                if(hide_video_suggestion===true){
                                    document.getElementById("secondary").remove()
                                    let video_btns=document.getElementsByClassName("ytp-chrome-bottom")[0].getElementsByTagName("a")
                                    //skip to next and previous video
                                    for (let i=0;i<video_btns.length;i++){
                                    video_btns.item(i).style.display="none" //remove not working in this for loop
                                    }
        
                                    //autoplay toggle
                                    //document.getElementsByClassName("ytp-chrome-bottom")[0].getElementsByTagName("div")[46].remove()
                                    document.getElementsByClassName("ytp-autonav-toggle-button-container")[0].remove()
                                    //final screen
                                    document.getElementsByClassName("html5-endscreen")[0].remove()
                                    suggestion_hidden=true
                                }
                                
                            },1000)
                            
                        }
                        //disable channel page if in blacklist
                        //chanel page have no special substring, use channel header instead
                        //console.log("IS CHANNEL PAGE, ", document.querySelectorAll("ytd-formatted-string#channel-header"))
                        if(Array(document.querySelectorAll("div#channel-container")).length>0){
                            try{
                                let channel_address_=document.querySelector("yt-formatted-string#channel-handle").innerHTML
                                console.log("CHANNEL PAGE, ", channel_address_)
                                if (black_list.includes(channel_address_)){
                                    document.body.innerHTML= "Channel of "+ channel_address_ + " is blocked.<br> <a href='https://www.youtube.com'> Go back to the home. </a>"
                                    document.body.style.fontSize="50px"
                                    //document.body.style.marginLeft="25%"
                                    document.body.style.marginTop="20%"
                                    document.body.style.textAlign="center"
                                }
                            }catch{
        
                            }
                           
                        }
                        console.log(window.location.href)
                        var curr_url=window.location.href
                        if (curr_url!==old_url){
                            n_old_els=0
                            ch_addresses=[]
                            old_url=curr_url
                        }
                        let new_els=get_thumbs(curr_url)
                        
                        console.log("address list: ",ch_addresses)
                        console.log("thumbs: ", new_els.length)
        
                        if (new_els.length>=n_old_els){  
                        for(let i=0; i<new_els.length; i++){
                            let el= new_els.item(i)
                            el.style.minHeight="15vh"
                            if (i>=n_old_els){ //                    
                                icons_cont=document.createElement("div")
                                console.log(window.location.href)
                                let div_dismiss= el.querySelector("div#dismissible")
                                let div_video_text= el.querySelector("div.text-wrapper.style-scope.ytd-video-renderer")
                                try{
                                    let thumbnail= el.querySelector("ytd-thumbnail")
                                    thumbnail.style.position="relative"
                                    if(window.location.href.includes("https://www.youtube.com/results?search_query=")){
                                        thumbnail.style.marginLeft="33%"
                                        thumbnail.style.marginTop="5%"
        
                                    }else if(window.location.href==="https://www.youtube.com/"){
                                        thumbnail.style.marginTop="15%"
                                    }
        
                                }
                                catch{
        
                                }
                                if (window.location.href==="https://www.youtube.com/"){
                                    //create icons cont for thumb
                                    icons_cont.className="customized_icon_cont"
                                    icons_cont.style.position="absolute"
                                    icons_cont.style.top="0%"
                                    icons_cont.style.paddingTop="10%"
                                    icons_cont.style.marginLeft="-1.5vw"
                                    icons_cont.style.width="90%"
                                    //move video img down
                                    div_dismiss.style.marginTop="20%"
                                    div_dismiss.style.maxWidth="100%"
                                } else if(window.location.href.includes("/results?search_query=")){
                                    icons_cont.className="customized_icon_cont"
                                    icons_cont.style.position="absolute"
                                    icons_cont.style.top="0%"
                                    icons_cont.style.paddingTop="5vh"
                                    icons_cont.style.marginLeft="0%"
                                    icons_cont.style.width="95%"
                                    icons_cont.style.marginBottom="5%"
                                    //move video img down
                                    div_dismiss.style.marginTop="12vh"
                                    //div_dismiss.style.marginLeft="-20vw"
        
                                    div_video_text.style.marginTop="3vh"
                                    div_video_text.style.backgroundColor="rgba(226, 223, 210,0.2)" //
                                    div_video_text.style.border="1px solid black"
                                    div_video_text.style.padding="3%"
        
        
                                }
        
                                //add rem btn
                                btn_remove= document.createElement("button")
                                btn_remove.className="btn_remove"
                                btn_remove.style.width="50%"
                                btn_remove.style.height="3vh" 
                                btn_remove.style.fontSize="115%"
                                btn_remove.style.border="black 1px solid"
                                //add safe btn
                                btn_safe= document.createElement("button")
                                btn_safe.className="btn_safe"
                                btn_safe.style.width="50%"
                                btn_safe.style.height="3vh" 
                                btn_safe.style.fontSize="115%"
                                btn_safe.style.border="black 1px solid"
        
        
                                //use channel url to get correlated channels
                                
                                
        
        
                                //mark deviants
                                try {
                                    let ch_address= get_channel(curr_url, el) //err (whitelist is undefined)
                                    //let ch_url=el.querySelector("div#dismissible > div#details > a#avatar-link").getAttribute("href")
                                    let ch_url=''
                                    console.log("CHANNEL URL", ch_url)
                                    //btn_remove.innerHTML = "Block"
                                    //btn_remove.onclick=function(){add_to_blacklist(ch_address, show_unsafe)}
        
                                    
                                    //handle blacklist btn
                                    if (black_list.includes(ch_address)){ // && !white_list.includes(ch_address)
                                        console.log(ch_address)
                                        
                                        //modifgy element according to input value in popup
                                        //if visible: alter color and place icons (icons only after merging user database to main database and subsequent computation)
                                        //elif not visible: hide elements
                                        handle_thumb_style(el, ch_address, btn_remove, btn_safe, "add to black", password, ch_url)
                                        //if(show_unsafe==="Show unsafe videos"){ //if it's written "Show", then it is in the hide state
                                            //el.remove()
                                        //}
                                    } else if (!black_list.includes(ch_address)){
                                        handle_thumb_style(el, ch_address,btn_remove, btn_safe, "remove from black", password, ch_url)
                                    }
        
                                                             
                                } catch (error) {
                                    console.log("ERROR in thumbnails handling (blacklist): ", error)
                                }
        
                             
                        
                                //mark safe
                                try {
                                    let ch_address= get_channel(curr_url, el) 
                                    //let ch_url=el.querySelector("div#dismissible > div#details > a#avatar-link").getAttribute("href")
                                    let ch_url=""
                                    console.log("Start marking safe")
                                    //handle safelist btn
                                    if (white_list.includes(ch_address) ){ //&& !black_list.includes(ch_address)  
                                        console.log("Is in whitelist")
                                        handle_thumb_style(el, ch_address, btn_remove, btn_safe,"add to white", password, ch_url)
                                    }else if (!white_list.includes(ch_address)){
                                        console.log("Is not in whitelist")
        
                                        handle_thumb_style(el, ch_address, btn_remove, btn_safe, "remove from white", password, ch_url)
                                    } 
                                } catch (error){
                                    console.log("ERROR in thumbnails handling (whitelist): ", error)
                                }
        
                                //APPENDS
                                //append to cont
                                icons_cont.appendChild(btn_remove)
                                icons_cont.appendChild(btn_safe)
                                
                
                                //append cont to thumb (avoid multiple cont) (only to thumb)
                                if(el.getElementsByClassName("customized_icon_cont").length===0 && btn_remove.innerHTML!=""){
                                    //el.insertBefore(icons_cont, el.firstChild)
                                    el.appendChild(icons_cont)
                                    //move channel label to the top
                                    try{
                                        el.querySelector(".channel_label").style.position="absolute"
                                        el.querySelector(".channel_label").style.top=0
                                    }catch{
        
                                    }
                                    //handle el color
                                    if(btn_safe.disabled===true){
                                        el.style.backgroundColor="rgba(255,0,0,0.5)"
                                    }else if(btn_remove.disabled===true){
                                        el.style.backgroundColor="rgba(0,255,0,0.5)"
                                    }else if(btn_remove.disabled===false && btn_safe.disabled===false){
                                        el.style.backgroundColor="rgba(255,255,255,0)"
                                    }
                                    
                                }
        
                                try{
                                    //handle external scores
                                    let ch_address= get_channel(curr_url, el)
                                    //let ch_url=el.querySelector("div#dismissible > div#details > a#avatar-link").getAttribute("href")
                                    let ch_url=""
        
                                    console.log(ch_address, Object.keys(all_scores))
                                    if(Object.keys(all_scores).includes(ch_address)){
                                        try{
                                            let thumbnail=el.querySelector("ytd-thumbnail")
                                            if(window.location.href==="https://www.youtube.com/"){
                                                thumbnail.style.marginTop="25%"
                                            }else if(window.location.href.includes("https://www.youtube.com/results?search_query=")){
                                                thumbnail.style.marginTop="15%"
        
                                            }
                                        }catch{
                                            
                                        }
                                       //create and append table
                                       tableCreate(icons_cont, all_scores[ch_address])
                                    }
                                }catch (error){
                                    console.log("ERROR in thumbnails handling (scores): ", error)
                                }
                               
        
                                //handle radar score
                                if (btn_remove.innerHTML!==""){ //if on a video
                                    let radar_toggle=document.createElement("button")
                                    radar_toggle.innerHTML="Show other scores"
                                    radar_toggle.style.backgroundColor=" rgba(255,255,255,1)"
                                    radar_toggle.style.opacity=1
                                    radar_toggle.style.width="100%"
                                    radar_toggle.style.marginTop="1vh"
                                    radar_toggle.className="radar_btn"
                                    radar_toggle.style.border="1px solid black"
                                    radar_toggle.style.fontSize="115%"
                                    radar_toggle.style.height="3vh"
                                    let ch_address= get_channel(curr_url, el) 
                                    //let ch_url=el.querySelector("div#dismissible > div#details > a#avatar-link").getAttribute("href")
                                    let ch_url=""
                                    console.log("CH ADDRES RADAR", ch_address, all_scores[ch_address])
                                    radar_toggle.onclick=function(){handle_radar(el, radar_toggle,
                                                                                 all_scores[ch_address], ch_address)}
                                    if(el.getElementsByClassName("radar_btn").length===0){
                                        icons_cont.appendChild(radar_toggle)
                                    }
                                }
                                
                
                                }
                            }
                            
                
                        n_old_els = new_els.length 
        
                        //add hover effect to all btns
                        document.querySelectorAll(".customized_icon_cont>button").forEach(btn=>{
                            btn.onmouseover= function(event){
                                btn.style.backgroundColor="rgba(75, 177, 249, 1)"
                                btn.style.color="rgba(255,255,255,1)"
                                btn.style.transition="all 250ms ease-in-out" //slow end
        
                            }
        
                            btn.onmouseout= function(event){
                                btn.style.backgroundColor="rgba(255,255,255,1)"
                                btn.style.color="rgba(0,0,0,1)"
                                btn.style.transition="all 700ms ease-in-out" //slow start
        
        
                            }
                        })
                
                
                        }
                    })
                }
 
            }
            //setting observer for stories
            

           
        
        
        })
    }



    //scroll action
    chrome.storage.local.get().then((response)=>{
       if(response["user"]!==undefined){
            if(response["user"]!==null){
                if(window.location.href.includes("/shorts/")){
                    setTimeout(()=>{
                        console.log("story scroll")
                        //scrolling doesnt work, use btn down-up
                        let story_btnup= document.querySelector("div#navigation-button-up > ytd-button-renderer")
                        let story_btndown= document.querySelector("div#navigation-button-down > ytd-button-renderer")
            
                        story_btndown.click()
                        setTimeout(()=>{
                            story_btnup.click()
                        },1000)
                        }, 500)
            
                }else{
                    setTimeout(()=>{window.scrollTo(0,2000);window.scrollTo(0,0)}, 1000 )
                }
            }
       } 
    })
    

},3500)

function handle_radar(el,btn,data, ch_address){
        setTimeout(()=>{
                try{
                    let old_radar_div= document.getElementById("radar_div")
                    old_radar_div.remove() 
                }catch{
                    
                }
               
                //reenable all disabled radar_btn
                document.querySelectorAll("button.radar_btn[disabled]").forEach(d=>{d.disabled=false; d.style.opacity=1, d.style.cursor="pointer"})

                //disable radar_btn
                btn.disabled=true
                btn.style.backgroundColor="rgba(255,255,255,1)"
                btn.style.opacity=0.6
                btn.style.cursor="not-allowed"
                //add score div (appears on hover on the video, contains scores' radar plot in d3 from https://mallahyari.github.io/visualdecode/blog/beautiful-radar-plot/#prepare-the-data)
                let radar_div=document.createElement("div")
                radar_div.style.zIndex=1000
                radar_div.style.padding="1%"
                radar_div.style.position="fixed"
                radar_div.style.marginLeft="30%"
                if(window.location.href=="https://www.youtube.com/"){ //home
                    radar_div.style.top="13%"

                }else if(window.location.href.includes("/results?search_query=")){ //search page
                    radar_div.style.top="7%"

                }


                let radar_div_bg=el.style.backgroundColor.split(",").slice(0,-1)
                radar_div_bg.push("0.9)")
                radar_div_bg=radar_div_bg.join(",")
                console.log(radar_div_bg)
                radar_div.style.backgroundColor= radar_div_bg
                radar_div.style.height="85%"
                radar_div.style.width="50%"
                radar_div.style.border="solid black 2px"

                radar_div.id="radar_div"

                let btn_close_radar= document.createElement("button")
                btn_close_radar.id="btn_close_radar"
                btn_close_radar.style.backgroundColor="rgba(255,255,255,1)"
                btn_close_radar.style.border="1px black solid"
                btn_close_radar.innerHTML="Close popup"
                btn_close_radar.style.width="100%"
                btn_close_radar.onclick=function (radar_div){
                                                        document.getElementById("radar_div").remove();
                                                        btn.disabled=false; btn.style.opacity=1;
                                                        btn.style.cursor="pointer";
                                                        el.querySelector(".radar_btn").style.color="rgba(0,0,0,1)("}
                //add hover effect to popup btn
                btn_close_radar.onmouseover= function(event){
                    btn_close_radar.style.backgroundColor="rgba(75, 177, 249, 1)"
                    btn_close_radar.style.color="rgba(255,255,255,1)"
                    btn_close_radar.style.transition="all 250ms ease-in-out" //slow end

                }

                btn_close_radar.onmouseout= function(event){
                    btn_close_radar.style.backgroundColor="rgba(255,255,255,1)"
                    btn_close_radar.style.color="rgba(0,0,0,1)"
                    btn_close_radar.style.transition="all 700ms ease-in-out" //slow start


                }


                //append popup
                radar_div.appendChild(btn_close_radar)

                //append ch_name
                let ch_name_p=document.createElement("p")
                ch_name_p.innerHTML=`<b>${ch_address}</b>`
                ch_name_p.style.fontSize="20px"
                ch_name_p.style.width="100%"
                ch_name_p.style.textAlign="center"
                ch_name_p.style.marginTop="2%"
                radar_div.appendChild(ch_name_p)
                
                //create and append table for popup
                tableCreate(radar_div,data)


                document.body.insertBefore(radar_div, document.body.firstChild)

                //let plot_cont=document.createElement("div")
                //plot_cont.className=".radarChart"
                //radar_div.appendChild(plot_cont)

                //CREATE PLOT
                //init data
                let data_keys=Object.keys(data)
                let data_vals=Object.values(data)
                let data_item= []
                let final_data=[]
                let external_scores=["blacklist_score","whitelist_score", "title_aoa_score","comment_aoa_score","title_sent_score","comment_sent_score"]
                let external_scores_short=["#black", "#white", "tAoA", "cAoA", "tSent", "cSent"]
                for (let i=0;i<data_keys.length;i++){
                    if (!external_scores.includes(data_keys[i])){
                        data_item.push( {axis: data_keys[i], value: data_vals[i]} )
                    }
                }
                final_data.push(data_item)
                console.log("DATA: ", final_data)
                
                 /* Radar chart design created by Nadieh Bremer - VisualCinnamon.com */
      
                ////////////////////////////////////////////////////////////// 
                //////////////////////// Set-Up ////////////////////////////// 
                ////////////////////////////////////////////////////////////// 

                var margin = {top: 100, right: 150, bottom: 300, left: 150},
                width = Math.min(radar_div.offsetWidth-45, window.innerWidth -10) - margin.left - margin.right,
                height = Math.min(width-100, window.innerHeight - margin.top - margin.bottom - 100);
                    
                var color = d3.scale.ordinal()
				.range(["#ADD8E6","#CC333F","#00A0B0"]);

                
                var radarChartOptions = {
                w: width,
                h: height,
                margin: margin,
                maxValue:Math.max(...data_vals),
                levels: 5,
                roundStrokes: true,
                color: color
                };
                //Call function to draw the Radar chart
                el_bg_color= radar_div_bg.replace("255, 255, 255, 0.9", "173, 216, 230, 1") //in case of white it replace it with blue for shapes in radar)
                console.log("FINAL DATA", final_data)
                if (final_data[0].length>0){ //show radar only for already computed channels
                    RadarChart("#radar_div", final_data, radarChartOptions, el_bg_color= el_bg_color);

                }
    
        },500)
        

}

function add_to_blacklist(address, password, data){
    let dialogue_pass=prompt("Enter your password", "")
    //let channels_opt=confirm(`Do you want to do the same with channels correlated to ${address}?`)
    let channels_opt=false
    let ch_url=""
    console.log("channels opt: ", channels_opt, typeof channels_opt)
    if(password==dialogue_pass){
        //correlated channel first otherwise channel page blocked
        if(channels_opt===true){
            //handle correlated channels
            include_channel_tab(ch_url).then(()=>{
                let sending=chrome.runtime.sendMessage({"action":"add to blacklist","channel_address":address})
                    sending.then(function(response){
                        //update thumbs of address
                        setTimeout(()=>{
                            chrome.storage.local.get().then((storage_)=>{
                                update_thumbs(address, "added to blacklist", password, storage_["all_scores"][address])
                            })
                        },1000)

                     
                    

                    }, function(err){
                        console.log(err)
                    })
            })    
        }else if (channels_opt===false){
            let sending=chrome.runtime.sendMessage({"action":"add to blacklist","channel_address":address})
            sending.then(function(response){
                //update thumbs of address
                setTimeout(()=>{
                    chrome.storage.local.get().then((storage_)=>{
                        console.log("CHANNEL DATA", storage_)

                        update_thumbs(address, "added to blacklist", password, storage_["all_scores"][address])
                    })
                },2000)
                
               
            
    
            }, function(err){
                console.log(err)
            })
        }

       
    }else{
        alert("Wrong password")
    }
}

function remove_from_blacklist(address, password, data){
    let dialogue_pass=prompt("Enter your password", "")
    //let channels_opt=confirm(`Do you want to do the same with channels correlated to ${address}?`)
    let channels_opt=false
    let ch_url=""
    if(password==dialogue_pass){
        
        if(channels_opt===true){
            //handle correlated channels
            include_channel_tab(ch_url).then(()=>{
                let sending=chrome.runtime.sendMessage({"action":"remove from blacklist", "channel_address":address})
                sending.then(function(response){
                    setTimeout(()=>{
                        chrome.storage.local.get().then((storage_)=>{
                            update_thumbs(address, "removed from blacklist", password, storage_["all_scores"][address])
                        })
                    },1000)
                    
                       
                }, function(err){
                    console.log(err)
                }
                )
            })
        }else if(channels_opt===false){
            let sending=chrome.runtime.sendMessage({"action":"remove from blacklist", "channel_address":address})
            sending.then(function(response){
                setTimeout(()=>{
                    chrome.storage.local.get().then((storage_)=>{
                        update_thumbs(address, "removed from blacklist", password,  storage_["all_scores"][address])
                    })
                },2000)
               
            }, function(err){
                console.log(err)
            }
            )
        }
        


    }else{
        alert("Wrong password")
    }
   
}


function add_to_whitelist(address, password, data){
    //alert(address)
    let dialogue_pass=prompt("Enter your password", "")
    //let channels_opt=confirm(`Do you want to do the same with channels correlated to ${address}?`)
    let channels_opt=false
    let ch_url=""

    if(password==dialogue_pass){
    if(channels_opt===true){
        include_channel_tab(ch_url).then(()=>{
            let sending=chrome.runtime.sendMessage({"action":"add to whitelist","channel_address":address})
            sending.then(function(response){
                //update thumbs of address
                setTimeout(()=>{
                    chrome.storage.local.get().then((storage_)=>{
                        update_thumbs(address, "added to whitelist",password, storage_["all_scores"][address])
                    })
                },1000)

              
               
        
            }, function(err){
                console.log(err)
            })
        })
    }else if(channels_opt===false){
        let sending=chrome.runtime.sendMessage({"action":"add to whitelist","channel_address":address})
        sending.then(function(response){
            //update thumbs of address
            setTimeout(()=>{
            chrome.storage.local.get().then((storage_)=>{
                update_thumbs(address, "added to whitelist",password, storage_["all_scores"][address])
            })
            }, 2000)

           
    
        }, function(err){
            console.log(err)
        })
    }
    
    }else{
        alert("Wrong passowrd")
    }
}

function remove_from_whitelist(address, password, data){
    let dialogue_pass=prompt("Enter your password", "")
    //let channels_opt=confirm(`Do you want to do the same with channels correlated to ${address}?`)
    let channels_opt=false
    let ch_url=""

    console.log("PASS", dialogue_pass, password)
    if(password==dialogue_pass){
        if(channels_opt===true){
            include_channel_tab().then(()=>{
                let sending=chrome.runtime.sendMessage({"action":"remove from whitelist", "channel_address":address})
                sending.then(function(response){
                    setTimeout(()=>{
                        chrome.storage.local.get().then((storage_)=>{
                            update_thumbs(address, "removed from whitelist", password, storage_["all_scores"][address] )
    
                        })
                    },1000)

                   
                }, function(err){
                    console.log(err)
                }
                )
            })
        }else if(channels_opt===false){
            let sending=chrome.runtime.sendMessage({"action":"remove from whitelist", "channel_address":address})
            sending.then(function(response){
                setTimeout(()=>{
                    chrome.storage.local.get().then((storage_)=>{
                        update_thumbs(address, "removed from whitelist", password, storage_["all_scores"][address] )
                    })
                },1000)


            }, function(err){
                console.log(err)
            }
            )
        }
        
    }else{
        alert("Wrong password")
    }
}

function reload_active_tab(){
    //reload tab
    chrome.tabs.query({
       active:true,
       //lastFocusedWindow:true
     }, function(tabs){
       let tab_idx= tabs[0].id
       chrome.tabs.reload(tab_idx)
     })
}

function update_thumbs(address, flag, password, data){
    //close radar popup if open
    try{
        document.querySelector("#radar_div").remove()
        //enable again radar btns in all thumbs
        document.querySelectorAll(".radar_btn").forEach(d=>{d.disabled=false; d.style.opacity=1, d.style.cursor="pointer"})
    }catch{

    }
    let curr_url=window.location.href
    let thumbs=get_thumbs(curr_url)
    for(let i=0; i<thumbs.length; i++){
        let el= thumbs.item(i)
        let icon_cont= el.querySelector(".customized_icon_cont")
        let radar_toggle= el.querySelector(".radar_btn")
        try {
            let ch_address= get_channel(curr_url, el)
            //let ch_url=el.querySelector("div#dismissible > div#details > a#avatar-link").getAttribute("href")
            let ch_url=""

            let btn_remove= el.getElementsByClassName("btn_remove")[0]
            let btn_safe= el.getElementsByClassName("btn_safe")[0]


            if (ch_address === address){
                //recreate table
                console.log("DATA UPDATE:", data, radar_toggle)
                tableCreate(icon_cont, data)
                radar_toggle.onclick=function(){handle_radar(el, radar_toggle,
                       data, ch_address)}

                if (flag==="added to blacklist"){
                    handle_thumb_style(el, ch_address, btn_remove, btn_safe, "add to black",password, data)
                    //if(show_unsafe==="Show unsafe videos"){ //if it's written "Show", then it is in the hide state
                       // el.remove()
                    //}

                } else if (flag==="removed from blacklist"){
                    handle_thumb_style(el, ch_address, btn_remove, btn_safe, "remove from black", password, data)

                } else if (flag==="added to whitelist"){
                    handle_thumb_style(el, ch_address,btn_remove, btn_safe, "add to white", password, data)
                } else if (flag==="removed from whitelist"){
                    handle_thumb_style(el, ch_address, btn_remove, btn_safe, "remove from white", password, data)
                }
                
            }
        } catch (error){
            console.log("ERR UPDATING THUMBS: ", address, flag, error)
            continue
        }

    }
    
}


function get_thumbs(curr_url){
    let new_els
    if(curr_url===home_url){
        new_els=document.getElementsByTagName(home_thumbs) //home
    }else if(curr_url.includes(search_url)){
        // check for "see more" btn in search page
        vertical_search_renderers= document.querySelectorAll("ytd-vertical-list-renderer > div#more > yt-formatted-string")
        console.log("vertical serach renderers: ", vertical_search_renderers)
        for (let i=0; i<vertical_search_renderers.length; i++){
            try{
                vertical_search_renderers.item(i).click()
            }catch(err){
                console.log("ERR in search more btn", err)
            }
        }
        new_els=document.getElementsByTagName(search_thumbs) //search
       

    }else{
        new_els=[]
    }
    return new_els
}


function get_channel(curr_url, el){
    let ch_address
    //console.log("CHANNEL", el.getElementsByTagName("div")[0].getElementsByTagName("a")[0].getAttribute("href"))
    if(curr_url===home_url){
        ch_address= el.getElementsByTagName("div")[0].getElementsByTagName("a")[4].getAttribute("href").replace("/","")
    }else if(curr_url.includes(search_url)){
        ch_address= el.getElementsByTagName("div")[0].getElementsByTagName("a")[4].getAttribute("href").replace("/","")
    }else{
        ch_address=[]
    }

    return ch_address
}

function handle_thumb_style(el, ch_address, btn_remove, btn_safe,type, password, data){
    el.style.padding="3%"
    el.style.border="solid rgba(0,0,0,0.7) 2px"
    var default_bg_color= "rgba(226, 223, 210,0.5)"
    el.style.backgroundColor=default_bg_color


    if(type==="add to black"){
        try{
            el.getElementsByTagName("p")[0].remove()
        }catch{

        }
        el.style.backgroundColor="rgba(255,0,0,0.5)"
        el.getElementsByTagName("div")[0].style.display="none"
        btn_remove.innerHTML= "Remove from blacklist"
        btn_remove.onclick=function(){remove_from_blacklist(ch_address, password, data)}
        //add name of the channel
        let channel_name_p= document.createElement("p")
        if(window.location.href==="https://www.youtube.com/"){
            channel_name_p.style.width="80%"
        }else if(window.location.href.includes("/results?search_query=")){
            channel_name_p.style.width="95%"
        }
        channel_name_p.innerHTML=ch_address
        channel_name_p.className="channel_label"
        channel_name_p.style.marginTop="1%"
        channel_name_p.style.fontSize="15px"
        channel_name_p.style.position="absolute"
        channel_name_p.style.textAlign="center"
    
        

        channel_name_p.style.top=0
        el.appendChild(channel_name_p)
        btn_safe.disabled=true
        btn_safe.style.opacity=0.6
        btn_safe.style.cursor="not-allowed"

    }else if(type==="remove from black"){

        el.style.backgroundColor= default_bg_color
        el.getElementsByTagName("div")[0].style.display="block"
        btn_remove.innerHTML= "Add to blacklist"
        btn_remove.onclick=function(){add_to_blacklist(ch_address, password, data)}
        btn_safe.disabled=false
        btn_safe.style.backgroundColor="rgba(255, 255, 255,1)"
        btn_safe.style.opacity=1
        btn_safe.style.cursor="pointer"


        try{
            el.getElementsByTagName("p")[0].remove()
        }catch{

        }        
    }
    else if (type==="add to white"){
        try{
            el.getElementsByTagName("p")[0].remove()
        }catch{

        }
        //el.querySelector("div#dismissible").style.backgroundColor="rgba(0,255,0,0.5)"
        el.style.backgroundColor="rgba(0,255,0,0.5)"
        //el.getElementsByTagName("div")[0].style.display="none" //safe video are always displayed
        btn_safe.innerHTML= "Remove from whitelist"
        btn_safe.onclick=function(){remove_from_whitelist(ch_address, password, data)}
        btn_remove.disabled=true
        btn_remove.style.opacity=0.6
        btn_remove.style.cursor="not-allowed"
         //add name of the channel (no need for name in safelist)
         //let channel_name_p= document.createElement("p")
         //channel_name_p.innerHTML=ch_address
         //channel_name_p.style.fontSize="15px"
         //el.appendChild(channel_name_p)

    } else if (type==="remove from white"){
        //el.querySelector("div#dismissible").style.backgroundColor="rgba(0,255,0,0)"
        el.style.backgroundColor=default_bg_color
        //el.getElementsByTagName("div")[0].style.display="block" //safe video are always displayed
        btn_safe.innerHTML= "Add to whitelist"
        btn_safe.onclick=function(){add_to_whitelist(ch_address, password, data)}
        btn_remove.disabled=false
        btn_remove.style.opacity=1
        btn_remove.style.backgroundColor="rgba(255,255,255,1)"
        btn_remove.style.cursor="pointer"

        //el.getElementsByTagName("p")[0].remove() //no channel name in case of whitelist
    } else{

    }

}

function tableCreate(parent,data) {
    try{
        parent.querySelector("table").remove()
    }catch{

    }
    //skip if data===undefined (if auto update of list counter is off, even modifing list results in data===undefined)
    if (data===undefined || Object.values(data).reduce((a,b)=>a+b, 0)===0 ){ //if undefined or sum of values is 0 
        console.log("No data in table")
        return
    }

    let tbl = document.createElement('table');
    tbl.style.width = '100px';
    tbl.style.border = '1px solid black';

    let external_scores=["blacklist_score","whitelist_score", "title_aoa_score","comment_aoa_score","title_sent_score","comment_sent_score"]
    let external_scores_short=["#black", "#white", "tAoA", "cAoA", "tSent", "cSent"]
    let external_scores_explained=["number of users that added the channel to the blacklist [0,]",
                                   "number of users that added the channel to the withelist [0,]",
                                   "mean of age of aquisition for words in titles [0,]",
                                   "mean of age of acquisition for words in comments [0,]",
                                   "mean of sentiment for words in titles [-1, 1]",
                                   "mean of sentiment for words in comments [-1, 1]"]
    // Find a <table> element with id="myTable":
    var table = document.createElement("table")
    table.style.width="100%"
    table.style.textAlign="center"
    table.style.border="1.5px solid black"
    table.style.backgroundColor="rgba(255,255,255,0.9)"
    
    if(parent.id=="radar_div"){ //only in radar popup
        table.style.marginTop="4%"
    }else{
        table.style.marginTop="4%"
    }


    // Create an empty <thead> element and add it to the table:
    if (window.location.href.includes("https://www.youtube.com/results?search_query=")){
        var header = table.createTHead();

        // Create tr for thead:
        var row = header.insertRow(0);   
        row.style.fontSize="12px" 
    
        // Insert empty tds to trow:
        var cells = external_scores.map((d,i)=>row.insertCell(i))
        // place columns names in trow's empty tds
        for (let i=0; i<external_scores.length; i++){
            cells[i].innerHTML=`<b>${external_scores[i]}</b>` 
            cells[i].style.marginLeft="50%"
            cells[i].style.border="1px solid black"
            //info popup for columns
            cells[i].onmouseover = function(event){
                try{
                    parent.querySelector("#column_descr_popup").remove()
                }catch{

                }
                let column_popup=document.createElement("div")
                column_popup.id="column_descr_popup"
                column_popup.innerHTML= `&#x1f6c8 <b>${external_scores[i]}</b>: ${external_scores_explained[i]}`
                //style popup
                column_popup.style.position="absolute"
                column_popup.style.width="60%"
                column_popup.style.backgroundColor="rgba(173, 216, 230, 1)"
                column_popup.style.border="1px solid black"
                column_popup.style.padding="3px"
                column_popup.style.marginTop="2px"
                column_popup.style.marginLeft="20%"
                column_popup.style.fontSize="15px"
                column_popup.style.textAlign="left"
                parent.insertBefore(column_popup, table)
            }

            cells[i].onmouseout= function(event){
                try{
                    parent.querySelector("#column_descr_popup").remove()
                }catch{

                }
            }
        }
    
        //Create body
        var table_body = table.createTBody()
        //Create tr for body
        var body_row = table_body.insertRow()
        body_row.style.fontSize="12px" 
        var body_cells= external_scores.map((d,i)=>body_row.insertCell(i))
        // place scores in body_rows's empty tds

        for(let i=0; i<external_scores.length; i++){
            try{
                body_cells[i].innerHTML=data[external_scores[i]]
            }catch{
                body_cells[i].innerHTML="undefined"
            }
            body_cells[i].style.padding="0%"
            body_cells[i].style.border="1px solid black"
    
        }
    
    }else if(window.location.href==="https://www.youtube.com/"){
        if (parent.className=="customized_icon_cont"){ //only for thumbs in home
            table.style.marginTop="12%"
        }

        var header = table.createTHead();

        // Create tr for thead:
        var row = header.insertRow(0);   
        row.style.fontSize="12px" 
    
        // Insert empty tds to trow:
        var cells = external_scores.map((d,i)=>row.insertCell(i))
        // place columns names in trow's empty tds
        for (let i=0; i<external_scores.length; i++){
            cells[i].innerHTML=`<b>${external_scores_short[i]}</b>` 
            cells[i].style.marginLeft="10%"
            cells[i].style.border="1px solid black"
            //info popup for columns
            cells[i].onmouseover = function(event){
                try{
                    parent.querySelector("#column_descr_popup").remove()
                }catch{

                }
                let column_popup=document.createElement("div")
                column_popup.id="column_descr_popup"
                //style popup
                column_popup.style.position="absolute"
                column_popup.style.width="60%"
                column_popup.style.backgroundColor="rgba(173, 216, 230, 1)"
                column_popup.style.border="1px solid black"
                column_popup.style.padding="3px"
                column_popup.style.marginLeft="20%"
                column_popup.style.textAlign="left"
                if (parent.className=="customized_icon_cont"){ //only for thumbs in home
                    column_popup.style.width="90%"
                    column_popup.style.marginLeft="5%"
                    column_popup.style.fontSize="10px"
                    column_popup.style.marginTop="1px"
                    column_popup.innerHTML= `&#x1f6c8 <b>${external_scores[i]}</b>:<br> ${external_scores_explained[i]}`

                }else{
                    column_popup.style.width="60%"
                    column_popup.style.marginLeft="20%"
                    column_popup.style.fontSize="15px"
                    column_popup.style.marginTop="2px"
                    column_popup.innerHTML= `&#x1f6c8 <b>${external_scores[i]}</b>: ${external_scores_explained[i]}`


                }
                parent.insertBefore(column_popup, table)
            }

            cells[i].onmouseout= function(event){
                try{
                    parent.querySelector("#column_descr_popup").remove()
                }catch{

                }
            }
        }
    
        //Create body
        var table_body = table.createTBody()
        //Create tr for body
        var body_row = table_body.insertRow()
        body_row.style.fontSize="12px" 
        var body_cells= external_scores.map((d,i)=>body_row.insertCell(i))
        // place scores in body_rows's empty tds
        for(let i=0; i<external_scores.length; i++){
            try{
                body_cells[i].innerHTML=data[external_scores[i]]
            }catch{
                body_cells[i].innerHTML="undefined"
            }
            body_cells[i].style.padding="0%"
            body_cells[i].style.border="1px solid black"

    
        }
    }
   
    parent.insertBefore(table, parent.querySelector(".radar_btn"));
    console.log("TABLE ADDED", data)
  }

//setTimeout(()=>{window.scrollTo(0,1000);window.scrollTo(0,0)}, 4000 )

/*
setTimeout(()=>{
    let page_down_event = new KeyboardEvent('keypress', {"key":"ArrowDown"});
    document.querySelector("div#contents").dispatchEvent(page_down_event);
    console.log("pgdown dispathced")
},6000)
*/

/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////
	
function RadarChart(id, data, options) {
	var cfg = {
	 w: 600,				//Width of the circle
	 h: 600,				//Height of the circle
	 margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
	 levels: 3,				//How many levels or inner circles should there be drawn
	 maxValue: 0, 			//What is the value that the biggest circle will represent
	 labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.35, 	//The opacity of the area of the blob
	 dotRadius: 4, 			//The size of the colored circles of each blog
	 opacityCircles: 0.1, 	//The opacity of the circles of each blob
	 strokeWidth: 2, 		//The width of the stroke around each blob
	 roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scale.category10(),	//Color function,
     el_bg_color :"#ADD8E6"
	};
	
	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if
	
	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
		
	var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		Format = d3.format('.2f'),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

    var allVals= (data[0].map(function(i, j){return i.value}))
	
	//Scale for the radius
	var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([0, maxValue]);
		
	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();
	
	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
			.attr("width",  cfg.w + cfg.margin.left-100 + cfg.margin.right-100)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom -200 )
			.attr("class", "radar"+id)
            .style("background-color","rgba(255,255,255,0.9)")
            .style("border-radius","50%")// 50% for circle
            .style("margin-left","12%")
            .style("margin-top","3%")
            .style("border","2px solid black")
	//Append a g element		
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left-100) + "," + (cfg.h/2 + cfg.margin.top-10) + ")");
	
	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)")

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "10px")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Format(maxValue * d/cfg.levels)+"%"; });

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
    let parent= document.querySelector(id)
    let axisLabel_explained=["percentage of vulgar words in comments",
                            "percentage of deviant users in comments",
                            "percentage of deviant users in the channel tab",
                            "percentage of repeated comments",
                            "percentage of vulgar words in titles",
                            "percentage of videos with disabled comment section",
                           ]
    console.log(allAxis.map((d,i)=>d+":"+ axisLabel_explained[i]))

	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d,i){return d+'\n'+ allVals[i].toString()+"%"})
		.call(wrap, cfg.wrapWidth)
        .on("mouseover", function(d,i){
            try{
                parent.querySelector("#column_descr_popup").remove()
            }catch{

            }
            let column_popup=document.createElement("div")
            column_popup.id="column_descr_popup"
            //style popup
            column_popup.style.position="absolute"
            column_popup.style.width="60%"
            column_popup.style.backgroundColor="rgba(173, 216, 230, 1)"
            column_popup.style.border="1px solid black"
            column_popup.style.padding="3px"
            column_popup.style.marginLeft="20%"
            column_popup.style.textAlign="left"

            column_popup.style.width="60%"
            column_popup.style.marginLeft="20%"
            column_popup.style.fontSize="15px"
            column_popup.style.marginTop="2px"
            column_popup.innerHTML= `&#x1f6c8 <b>${allAxis[i]}</b>: ${axisLabel_explained[i]}`
           
            parent.insertBefore(column_popup, parent.querySelector("table"))
        })
        .on("mouseout", function(d,i){
            try{
                parent.querySelector("#column_descr_popup").remove()
            }catch{

            }
        })

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////
	
	//The radial line function
	var radarLine = d3.svg.line.radial()
		.interpolate("linear-closed")
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });
		
	if(cfg.roundStrokes) {
		radarLine.interpolate("cardinal-closed");
	}
				
	//Create a wrapper for the blobs	
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");
			
	//Append the backgrounds	
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) {  return el_bg_color.includes("255, 255, 255") || el_bg_color.includes("226, 223, 210")
                                        ?"rgba(173, 216, 230, 1)" 
                                        :el_bg_color }) //cfg.color(i)
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1); 
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);	
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});
	console.log(" BG COLOR", el_bg_color)
	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return el_bg_color.includes("255, 255, 255") || el_bg_color.includes("226, 223, 210")
                                         ?"rgba(173, 216, 230, 1)" 
                                         :el_bg_color }) //cfg.color(i);
		.style("fill", "none")
		.style("filter" , "url(#glow)");		
	
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", function(d,i,j) { return cfg.color(j); })
		.style("fill-opacity", 0.8);

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", (cfg.dotRadius*1.5) -2)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill",function(d,i){
            return el_bg_color.includes("255, 255, 255") || el_bg_color.includes("226, 223, 210")
            ?"rgba(173, 216, 230, 1)" 
            :el_bg_color
        })
        .style("stroke","black")
        .style("fill-opacity",".5")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;
					
			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Format(d.value)+"%")
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});
		
	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);
	
	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap	
	
}//RadarChart

function include_channel_tab(ch_link){ // if change page, the content.js reloads itself so it's not possible to implement this function in the same tab. 
    //One workaround would be to create a new tab, operating on that one and then sending the list of channels to the seed tab.
    //window.location.href="https://www.youtube.com/" + ch_link +"/channels"
    console.log("CHANNELS", ch_link)

    //get channels
    //setTimeout(function(){
    //    let channels = document.querySelectorAll("#channel")
     //   console.log("CHANNELS2", channels)

    //},5000)
    

}