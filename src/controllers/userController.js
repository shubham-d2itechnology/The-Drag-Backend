import User from "../models/user.model.js";
import Creator from '../models/creator.model.js'


import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config();

export const createUser = async (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) return res.status(403).json({ error: "Incomplete fields", success: false });
  const existingUser = await User.find({ email });

  if (existingUser.length > 0) {
    return res.status(403).json({ success: false, error: "User with same E-mail already exists" });
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
  const options = {
    httpOnly: true,
    secure: true,
path:'/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'Lax'

  }

  return res.status(201).cookie("accessToken", token,options).json({
    newUser,
    success: true,
    iscreator:"false",
    email
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
      name: user.name,
      email: email,
    }
    const token = jwt.sign(data, process.env.SECRET_KEY);
    const creator = await Creator.findOne({ email: email });
    let iscreator;

    if (creator == null) {
      iscreator = 'false';
    }
    else{
      iscreator=creator.approved;
    }
    

    const options = {
      httpOnly: true,
      secure: true,
path:'/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'Lax'

    }
    console.log(iscreator);
    return res
      .status(200)
      .cookie("accessToken", token, options)
      .json({
        success: true,
        user,
        iscreator,
        email
      });

  } catch (error) {

    return res.status(500).json("Internal server error");
  }
}



export const getalldata = async (req, res) => {
  const data = await Creator.aggregate([

    {
      $addFields: {
        totalCount: {
          $add: [
            { $ifNull: ['$socialMedia.insta.count', 0] },
          { $ifNull: ['$socialMedia.twitter.count', 0] },
          { $ifNull: ['$socialMedia.linkedin.count', 0] },
          { $ifNull: ['$socialMedia.youtube.count', 0] },
          { $ifNull: ['$socialMedia.facebook.count', 0] }
          ]
        }
      }
    },
    {
      $sort: { totalCount: -1 }
    }

  ]);
  // console.log('data', data);
  return res.status(200).json({ data: data });
}
export const logout = (req, res) => {
  if (req.cookies && req.cookies["accessToken"]) {
    console.log(req.cookies["accessToken"]);
    return res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: 'None' }).json({ message: "You are logged out" });

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
  const finalcreators=reqcreators.sort((a, b) => {
    const { insta, twitter, facebook, linkedin, youtube } = a.socialMedia;
    let totala = (insta.count + twitter.count + facebook.count + linkedin.count + youtube.count);
    let totalb = (b.socialMedia.insta.count + b.socialMedia.twitter.count + b.socialMedia.linkedin.count + b.socialMedia.facebook.count + b.socialMedia.facebook.count);

    return -1 * (totala - totalb);

  })
  return res.status(200).json({ success: true, data: finalcreators });

}





export const handleContact = async (req, res) => {
  const token = req.cookies["accessToken"];
  const user = jwt.verify(token, process.env.SECRET_KEY);
  const email = user.email;
  const creatorEmail = req.body.creatormail;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'thedrag.website@gmail.com',
      pass: 'mnbsroulfuvwcfrb',
    },
  });

  const mailOptions = {
    from: 'Drag <thedrag.website@gmail.com>',
    to: creatorEmail,

    attachments: (req.file)?[{ filename: req.file.filename, path: req.file.path }]:null,
    cc: email,
    subject: req.body.subject,
    text: req.body.body,

  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: error.toString() });
    }
    return res.status(200).json({ success: true, message: "E-mail Sent Successfully" });
  });




}