import Creator from "../models/creator.model.js"




export const handlesearch = async (req, res) => {
    const { search } = req.body;
    if (!search||search===" ") {
      return res.status(200).json({ success: true, data: [] });
  
    }
    
    const allCreators = await Creator.find({});

  
    const reqcreators = [];
    for (let i = 0; i < allCreators.length; i++) {
      if (allCreators[i].userName.toLowerCase().includes(search.toLowerCase())) {
        reqcreators.push(allCreators[i]);
      }
    }
    const finalcreators=reqcreators.sort((a, b) => {
      const { insta, twitter, facebook, linkedin, youtube } = a.socialMedia;
      let totala = (insta.count + twitter.count + facebook.count + linkedin.count + youtube.count);
      let totalb = (b.socialMedia.insta.count + b.socialMedia.twitter.count + b.socialMedia.linkedin.count + b.socialMedia.facebook.count + b.socialMedia.facebook.count);
  
      return -1 * (totala - totalb);
  
    })
    return res.status(200).json({ success: true, data: finalcreators });
  
  }

  export const filters = async (req, res) => {
    console.log('hiiiii');
    try {
      const { type, location, platform, count, sort } = req.body;
      let lb,ub;
      if(count){
      const arr = count.split('-');
      lb=Number(arr[0]);
       ub=Number(arr[1]);
      if (ub == 0) {
        ub = 100000000000;
      }
    }
    else{
      lb=0;
      ub=1000000000000000;
    }
  
  
      console.log(lb,ub,type,location, platform);
      const filter = {};
  
      // Add filters only if they are not empty and use $regex only when needed
      if (type && type !== "") {
        filter.type = { $regex: type, $options: 'i' }; // Case-insensitive regex
      }
    
      if (location && location !== "") {
        filter.location = { $regex: location, $options: 'i' }; // Case-insensitive regex
      }
    
      if (platform && platform !== "") {
        // Since mainPlatform is an array, we don't need $regex, we use $in
        filter.mainPlatform = { $in:[platform] }; 
      }
      filter.count={$gte:lb,$lte:ub};
    
        console.log(filter);
  
  
      const result= await Creator.find(filter).sort({count:sort==='asc'?1:-1});
  console.log(result);
      console.log('users',result.length);
  
      if(!result || result.length===0) return res.status(404).json({message:"No Creator found",result});
      return res.status(200).json({result});
    } catch (error) {
      console.log("Error",error);
      return res.status(500).json({message:"Internal server error"});
    }
  }