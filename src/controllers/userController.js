import User from "../models/user.model.js";
import Creator from '../models/creator.model.js'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config();

export const createUser = async (req, res) => {
  
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(403).json({ error: "Incomplete fields", success: false });
    const existingUser = await User.find({ email });

    if (existingUser.length > 0) {
      return res.status(403).json({ success: false, error: "User with same UserName already exists" });
    }

    const newUser = await User.create({

      name: name,
      email: email,
      password: password
    })
    const data = {
      name,
      email
    }
    console.log(newUser);
    if (!newUser) return res.status(500).json({ error: "Error occured while creating user", success: false });
    const token = jwt.sign(data, process.env.SECRET_KEY);
 
    return res.status(201).cookie("accessToken", token).json({
      newUser,
      success: true,
      iscreator:false,
    }
    );
  
}

export const userLogin = async (req, res) => {
  try {

    const { email, password } = req.body;
    if (!email || !password) return res.status(403).json({ success: false, error: "Complete all the fields" });

    const user = await User.findOne({ email, password });
    if (!user) return res.status(404).json({ success: false, error: "User not found! Go to Signup " });
    const data = {
      name:user.name,
      email: email,
    }
    const token = jwt.sign(data, process.env.SECRET_KEY);
   const creator=await Creator.findOne({email:email});
   let iscreator;
   
   if(creator==null){
    iscreator=false;
   }
   else iscreator=true;

   const options={
    httpOnly:true,
    secure:true,
  
    maxAge:7*24*60*60*1000,
    sameSite:'None'

   }
   console.log(iscreator);
    return res
    .status(200)
    .cookie("accessToken", token,options)
    .json({ 
      success: true,
      user,
      iscreator 
    });

  } catch (error) {

    return res.status(500).json("Internal server error");
  }
}
export const handleCreatorRegister = async (req, res) => {
     
  const { type,userName, location, phone, insta, linkedin, twitter, facebook, youtube, instacount, twittercount, linkedincount, youtubecount, facebookcount } = req.body;
 
  if (!type ||!userName|| !location || !req.file) {
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
  const existing=await Creator.findOne({email:data.email});

  if(existing!=null){
    return res.json({success:false,error:"User Already Registered !"});
  }
  const creator = await Creator.create({
    name:user.name,
    userName:userName,
    email: user.email,
    type: type,
    Mobile_No: phone,
    socialMedia: {
      insta: {
        url: insta,
        count: instacount,
      },
      twitter: {
        url: twitter,
        count: twittercount,
      },
      linkedin: {
        url: linkedin,
        count: linkedincount,
      },
      facebook: {
        url: facebook,
        count: facebookcount,
      },
      youtube: {
        url: youtube,
        count: youtubecount,
      }
    },
    location: location,
    image: image_url

  })

  return res.json({ success: true});
}
export const getalldata = async (req, res) => {
  const data = await Creator.find({});
  return res.status(200).json({ data: data });
}
export const logout = (req, res) => {
  if (req.cookies&&req.cookies["accessToken"]) {
      console.log(req.cookies["accessToken"]);
    return res.clearCookie("accessToken",{httpOnly:true,secure:true,sameSite:'None'}).json({ message: "You are logged out" });

  }
  return res.json({ message: "you are already logged out" });
}
export const handlesearch = async (req, res) => {
  const { search } = req.body;
  if (!search) {
    return res.status(200).json({ success: true, data: [] });

  }
  const allCreators = await Creator.find({});

  const reqcreators = [];
  for (let i = 0; i < allCreators.length; i++) {
    if (allCreators[i].userName.toLowerCase().includes(search.toLowerCase())) {
      reqcreators.push(allCreators[i]);
    }
  }
  return res.status(200).json({ success: true, data: reqcreators });

}

export const filter = async (req, res) => {
  const { type, location, platform, count, sort } = req.body;
  console.log(platform);
  const arr = count.split('-');
  const new_arr = arr.map((item) =>
    Number(item)
  )
  if (new_arr[1] == 0) {
    new_arr[1] = 100000000000;
  }
  console.log(new_arr);

  const filter_creator = await Creator.find({ type, location });
  console.log(filter_creator);
  let ans = [];
  for (let i = 0; i < filter_creator.length; i++) {
    const { insta, facebook, linkedin, twitter, youtube } = filter_creator[i].socialMedia;

    let Max = Math.max(linkedin.count, insta.count, twitter.count, facebook.count, youtube.count);
    console.log(Max);
    let total = (linkedin.count + insta.count + twitter.count + facebook.count + youtube.count);
    console.log(total);
   
    if ((Max == Number( linkedin.count )) && total >= new_arr[0] && total <= new_arr[1]) {
      if (platform == "linkedin") {
        ans.push(filter_creator[i]);
      }
    }
     if ((Max == Number(insta.count)) && total >= new_arr[0] && total <= new_arr[1]) {
      console.log("hello");
      if (platform == "insta") {
        console.log("hello");
        ans.push(filter_creator[i]);
      }
    }
     if ((Max == Number(twitter.count)) && total >= new_arr[0] && total <= new_arr[1]) {
      if (platform == "twitter") {
        ans.push(filter_creator[i]);
      }
    }
     if ((Max == Number(facebook.count)) && total >= new_arr[0] && total <= new_arr[1]) {
      if (platform == "facebook") {
        ans.push(filter_creator[i]);
      }
    }
     if ((Max == Number(youtube.count) )&& total >= new_arr[0] && total <= new_arr[1]) {
      if (platform == "youtube") {
        ans.push(filter_creator[i]);
      }
    }


  }
  console.log(ans);
  if (ans.length > 1 && sort == 'asc') {
    ans.sort((a, b) => {
      const { insta, twitter, facebook, linkedin, youtube } = a.socialMedia;
      let totala = (insta.count + twitter.count + facebook.count + linkedin.count + youtube.count);
      let totalb = (b.socialMedia.insta.count + b.socialMedia.twitter.count + b.socialMedia.linkedin.count + b.socialMedia.facebook.count + b.socialMedia.facebook.count);

      return totala - totalb;

    })
  }
  else if (ans.length > 1 && sort == 'des') {
    ans.sort((a, b) => {
      const { insta, twitter, facebook, linkedin, youtube } = a.socialMedia;
      let totala = (insta.count + twitter.count + facebook.count + linkedin.count + youtube.count);
      let totalb = (b.socialMedia.insta.count + b.socialMedia.twitter.count + b.socialMedia.linkedin.count + b.socialMedia.facebook.count + b.socialMedia.facebook.count);

      return -1 * (totala - totalb);

    })

  }

  console.log(ans);

  return res.json({ success: true, data: ans });


}
export const handleCreatorEdit = async (req, res) => {
  const {type,location,userName,phone,insta,linkedin,twitter,facebook,youtube,instacount,twittercount,linkedincount,youtubecount,facebookcount}=req.body;
  
 
  let img;
  let image=null;
  if(req.file){
   img=await cloudinary.uploader.upload(req.file.path);
    image=img.url;
  }


  try{
   const token=req.cookies["accessToken"];
   const data=jwt.verify(token,process.env.SECRET_KEY);
   
   const exist=await Creator.findOne({email:data.email});
  
   
   const new_creator=await Creator.findOneAndUpdate({email:data.email},{
      type:(type!='')?type:exist.type,
      userName:(userName!='')?userName:exist.userName,
      location:(location!='')?location:exist.location,
      Mobile_No:(phone!='')?phone:exist.Mobile_No,
      image:(image!=null)?image:exist.image,
      socialMedia: {
        insta: {
          url:( insta!='')?insta:exist.socialMedia.insta.url,
          count: (instacount!='')?instacount:exist.socialMedia.insta.count,
        },
        twitter: {
          url: (twitter!='')?twitter:exist.socialMedia.twitter.url,
          count:(twittercount!='')?twittercount:exist.socialMedia.twitter.count,
        },
        linkedin: {
          url: (linkedin!='')?linkedin:exist.socialMedia.linkedin.url,
          count:(linkedincount!='')?linkedincount:exist.socialMedia.linkedin.count,
        },
        facebook: {
          url: (facebook!='')?facebook:exist.socialMedia.facebook.url,
          count: (facebookcount!='')?facebookcount:exist.socialMedia.facebook.count,
        },
        youtube: {
          url: (youtube!='')?youtube:exist.socialMedia.youtube.url,
          count: (youtubecount!='')?youtubecount:exist.socialMedia.youtube.count,
        }
      }

   },{new:true});
   console.log(new_creator);
   return res.status(200).json({success:true,message:'Creator Data updated Successfully'});
  }
  catch(error){
    return res.json({success:false,message:error});
  }

}
export const handleContact=async(req,res)=>{
   const token=req.cookies["accessToken"];
   const user=jwt.verify(token,process.env.SECRET_KEY);
   const email=user.email;
   const creatorEmail=req.body.creatormail;
  const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: 'thedrag.website@gmail.com',
      pass: 'mnbsroulfuvwcfrb',
    },
  });

  const mailOptions = {
    from: 'Drag <thedrag.website@gmail.com>',
    to:creatorEmail,
    
    attachments:[{filename:req.file.filename , path:req.file.path}],
    cc:email,
    subject: req.body.subject,
    text: req.body.body,

  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({success:false,error:error.toString()});
    }
    return res.status(200).json({success:true,message:"E-mail Sent Successfully"});
  });




}