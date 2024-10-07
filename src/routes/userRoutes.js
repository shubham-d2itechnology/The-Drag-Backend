import express from 'express';
import { createUser, userLogin,getalldata,logout, handleContact} from '../controllers/userController.js';
import {filters,handlesearch} from '../controllers/searchFilter.controller.js'
import { handleCreatorRegister,handleCreatorEdit } from '../controllers/UserRegister.controller.js';
import { senderdata } from '../controllers/senderdata.controller.js';
import multer from 'multer';
import path from 'path'
import { createDeal, deleteDeal ,getDeals} from '../controllers/deals.controller.js';
import { auth } from '../controllers/auth.controller.js';

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
router.route('/register').post(auth,upload.single('profileImage'),handleCreatorRegister);
router.route('/').get(getalldata);
router.route('/logout').post(logout);
router.route('/search').post(handlesearch);
router.route('/filter').post(filters);
router.route('/edit').post(auth,upload.single('profileImage'),handleCreatorEdit);
router.route('/contact').post(auth,upload.single('attachment'),handleContact);
router.route('/deals').post(auth,createDeal).delete(auth,deleteDeal).get(getDeals);

export default router;