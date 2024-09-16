import express from 'express';
import { createUser, userLogin,getalldata,logout, handleContact} from '../controllers/userController.js';
import {filters,handlesearch} from '../controllers/searchFilter.controller.js'
import { handleCreatorRegister,handleCreatorEdit } from '../controllers/UserRegister.controller.js';
import multer from 'multer';
import path from 'path'

const router = express.Router();

const storage=multer.diskStorage({
    filename:(req,file,cb)=>{
            cb(null,`${Date.now()}_${file.originalname}`);
    },
    destination:(req,file,cb)=>{
        cb(null,path.join('src','uploads'));
    }
})
const upload=multer({storage});
router.route('/login').post(userLogin);
router.route('/signup').post(createUser);
router.route('/register').post(upload.single('profileImage'),handleCreatorRegister);
router.route('/').get(getalldata);
router.route('/logout').post(logout);
router.route('/search').post(handlesearch);
router.route('/filter').post(filters);
router.route('/edit').post(upload.single('profileImage'),handleCreatorEdit);
router.route('/contact').post(upload.single('attachment'),handleContact);
export default router;