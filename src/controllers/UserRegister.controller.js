import User from "../models/user.model.js"
import Creator from "../models/creator.model.js"
import { v2 as cloudinary } from 'cloudinary'
import jwt from 'jsonwebtoken'

export const handleCreatorRegister = async (req, res) => {

    const { type, userName, location, phone, insta, linkedin, twitter, facebook, youtube, instacount, twittercount, linkedincount, youtubecount, facebookcount } = req.body;
  try{
    if (!type || !userName || !location || !req.file) {
      return res.status(400).json({
        successs: false, error: `Incomplete Fields. 
  Profile Image, Location,Type and User Name are required`})
  
    }
  
    const file = req.file.path;
    let image_url;
    await cloudinary.uploader.upload(file, { use_filename: true }).then((res) => { image_url = res.url });
    const token = req.cookies["accessToken"];
    const data = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ email: data.email });
    const existing = await Creator.findOne({ email: data.email });
  
    if (existing != null) {
      return res.json({ success: false, error: "User Already Registered !" });
    }
    let MainPlatform=[];
    let MaxCount=Math.max(instacount,linkedincount,twittercount,facebookcount,youtubecount);
    let totalfollowers=Number(instacount)+Number(linkedincount)+Number(twittercount)+Number(facebookcount)+Number(youtubecount);
    if(instacount==MaxCount)MainPlatform.push("instagram");
    if(linkedincount==MaxCount)MainPlatform.push("linkedin");
    if(twittercount==MaxCount)MainPlatform.push("twitter");
    if(facebookcount==MaxCount)MainPlatform.push("facebook");
    if(youtubecount==MaxCount)MainPlatform.push("youtube");
    console.log(MainPlatform);
    console.log(totalfollowers);
  
    const creator = await Creator.create({
      name: user.name,
      userName: userName,
      email: user.email,
      type: type,
      Mobile_No: phone,
      socialMedia: {
        insta: {
          url: insta,
          count:(instacount>=1)?instacount:0
        },
        twitter: {
          url: twitter,
          count: (twittercount>=1)?twittercount:0,
        },
        linkedin: {
          url: linkedin,
          count: (linkedincount>=1)?linkedincount:0,
        },
        facebook: {
          url: facebook,
          count: (facebookcount>=1)?facebookcount:0,
        },
        youtube: {
          url: youtube,
          count:( youtubecount>=1)?youtubecount:0,
        }
      },
      location: location,
      image: image_url,
      mainPlatform:MainPlatform,
      count:(totalfollowers>=1)?totalfollowers:0,
  
    })
  
    return res.json({ success: true });
  }
  catch(error){
    console.log(error);
    return res.json({success:false,error});
  }
}



export const handleCreatorEdit = async (req, res) => {
    const { type, location, userName, phone, insta, linkedin, twitter, facebook, youtube, instacount, twittercount, linkedincount, youtubecount, facebookcount } = req.body;
  
  
    let img;
    let image = null;
    if (req.file) {
      img = await cloudinary.uploader.upload(req.file.path);
      image = img.url;
    }
  
  
    try {
      const token = req.cookies["accessToken"];
      const data = jwt.verify(token, process.env.SECRET_KEY);
  
      const exist = await Creator.findOne({ email: data.email });
  
  
      const new_creator = await Creator.findOneAndUpdate({ email: data.email }, {
        type: (type != '') ? type : exist.type,
        userName: (userName != '') ? userName : exist.userName,
        location: (location != '') ? location : exist.location,
        Mobile_No: (phone != '') ? phone : exist.Mobile_No,
        image: (image != null) ? image : exist.image,
        socialMedia: {
          insta: {
            url: (insta != '') ? insta : exist.socialMedia.insta.url,
            count: (instacount>=1) ? instacount : exist.socialMedia.insta.count,
          },
          twitter: {
            url: (twitter != '') ? twitter : exist.socialMedia.twitter.url,
            count: (twittercount>=1) ? twittercount : exist.socialMedia.twitter.count,
          },
          linkedin: {
            url: (linkedin != '') ? linkedin : exist.socialMedia.linkedin.url,
            count: (linkedincount>=1) ? linkedincount : exist.socialMedia.linkedin.count,
          },
          facebook: {
            url: (facebook != '') ? facebook : exist.socialMedia.facebook.url,
            count: (facebookcount>=1) ? facebookcount : exist.socialMedia.facebook.count,
          },
          youtube: {
            url: (youtube != '') ? youtube : exist.socialMedia.youtube.url,
            count: (youtubecount) ? youtubecount : exist.socialMedia.youtube.count,
          }
        }
  
      }, { new: true });
      console.log(new_creator);
      return res.status(200).json({ success: true, message: 'Creator Data updated Successfully' });
    }
    catch (error) {
        console.log(error);
      return res.json({ success: false, message: error });
    }
  
  }
  