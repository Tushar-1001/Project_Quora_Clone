const userModel = require('../models/userModel')
const validator = require('../utils/validator')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10

//User Creation.....
const userCreation = async(req, res) => {
    try {
        
        let requestBody = req.body;
        let {
            fname,
            lname,
            email,           
            phone,
            password,
        } = requestBody

        //validation starts
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "please provide valid request body" })
        }
        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname is required" })
        }
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname is required" })
        }
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        //Checking email wheater it is already used or not
        const isEmailAleadyUsed = await userModel.findOne({ email })
        if (isEmailAleadyUsed) {
            return res.status(400).send({
                status: false,
                message: `${email} is alraedy in use. Please try another email Id.`
            })
        }

        //Validating email using RegEx.
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
            return res.status(400).send({ status: false, message: "Invalid Email id." })

            if (!validator.validString(phone)) {
                return res.status(400).send({ status: false, message: "Phone number cannot be empty." })
            }
        if(phone){

           
            //Checking phone number wheater it is already used or not
           
            const isPhoneAleadyUsed = await userModel.findOne({ phone })
           
            if (isPhoneAleadyUsed) {
                return res.status(400).send({
                    status: false,
                    message: `${phone} is already in use, Please try a new phone number.`
                })
            }
    
            //validating phone number of 10 digits only.
            if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone))) return res.status(400).send({ status: false, message: "Phone number must be a valid Indian number." })
        }


        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
        }
            
        //validation ends

        const encryptedPassword = await bcrypt.hash(password, saltRounds) //encrypting password by using bcrypt.

        //object destructuring for response body.
        userData = {
            fname,
            lname,
            email,           
            phone,
            password: encryptedPassword,            
        }

        const saveUserData = await userModel.create(userData);
        return res
            .status(201)
            .send({
                status: true,
                message: "user created successfully.",
                data: saveUserData
            });
    } catch (err) {
        return res.status(500).send({
            status: false,
            message: "Error is : " + err
        })
    }
}

//!.............

//User Login by validating the email and password.
const userLogin = async function(req, res) {
    try {
        const requestBody = req.body;

        // Extract params
        const { email, password } = requestBody;

        // Validation starts
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide login details' })
        }
        if (!validator.isValid(requestBody.email)) {
            return res.status(400).send({ status: false, message: 'Email Id is required' })
        }

        if (!validator.isValid(requestBody.password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }
        // Validation ends

        //Checking user's details in DB to verify it's credentials.
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).send({ status: false, message: `Login failed! email id is incorrect.` });
        }

        let hashedPassword = user.password
        const encryptedPassword = await bcrypt.compare(password, hashedPassword) //Comparing normal password to the hashed password.

        if (!encryptedPassword) return res.status(401).send({ status: false, message: `Login failed! password is incorrect.` });

        //Creating JWT token through userId. 
        const userId = user._id
        const token = await jwt.sign({
            userId: userId,
            iat: Math.floor(Date.now() / 1000), //time of issuing the token.
            exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7 //setting token expiry time limit.
        }, 'Tushar-Saini')

        return res.status(200).send({
            status: true,
            message: `User Login Successfull `,
            data: {
                userId,
                token
            }
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


//!.............

//Fetching user's profile by Id.
const getProfile = async(req, res) => {
    try {
        const userId = req.params.userId
        const userIdFromToken = req.userId

        //validation starts
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }
        //validation ends

        const findUserProfile = await userModel.findOne({ _id: userId })
        if (!findUserProfile) {
            return res.status(400).send({
                status: false,
                message: `User doesn't exists by ${userId}`
            })
        }

        //Authentication & authorization
        if (findUserProfile._id.toString() != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        }

        return res.status(200).send({ status: true, message: "Profile found successfully.", data: findUserProfile })
    } catch (err) {
        return res.status(500).send({
            status: false,
            message: "Error is: " + err.message
        })
    }
}



//!.............

//Update profile details by validating user details.
const updateProfile = async(req, res) => {
    try {
        
        let requestBody = req.body
        let userId = req.params.userId
        let userIdFromToken = req.userId

        //Validation starts.
        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
            return
        }

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({
                status: false,
                message: "Invalid request parameters. Please provide user's details to update."
            })
        }

        const findUserProfile = await userModel.findOne({ _id: userId })
        if (!findUserProfile) {
            return res.status(400).send({
                status: false,
                message: `User doesn't exists by ${userId}`
            })
        }

        //Authentication & authorization
        if (findUserProfile._id.toString() != userIdFromToken) {
            res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            return
        }

        // Extract params
        let { fname, lname, email, phone } = requestBody;

        //validations for updatation details.
        if (!validator.validString(fname)) {
            return res.status(400).send({ status: false, message: 'fname is Required' })
        }
        
        
        if (!validator.validString(lname)) {
            return res.status(400).send({ status: false, message: 'lname is Required' })
        }
      

        //email validation
        if (!validator.validString(email)) {
            return res.status(400).send({ status: false, message: 'email is Required' })
        }
        if (email) {
            if (!validator.isValid(email)) {
                return res.status(400).send({ status: false, message: "Invalid request parameter, please provide email" })
            }
            if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
                return res.status(400).send({ status: false, message: `Email should be a valid email address` });
            }
            let isEmailAlredyPresent = await userModel.findOne({ email: email })
            if (isEmailAlredyPresent) {
                return res.status(400).send({ status: false, message: `Unable to update email. ${email} is already registered.` });
            }
        }

        //phone validation
     
      
        if (phone) {
            if (!validator.validString(phone)) {
                return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Phone number." })
            }
           
            if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
                return res.status(400).send({ status: false, message: `Please enter a valid Indian phone number.` });
            }
            let isPhoneAlredyPresent = await userModel.findOne({ phone: phone })
            if (isPhoneAlredyPresent) {
                return res.status(400).send({ status: false, message: `Unable to update phone. ${phone} is already registered.` });
            }
        }
        
        
        
        //Validation ends
        
        //object destructuring for response body.
        let changeProfileDetails = await userModel.findOneAndUpdate({ _id: userId }, {
            $set: {
                fname: fname,
                lname: lname,
                email: email,
                phone: phone,     
            }
        }, { new: true })
        return res.status(200).send({ status: true, data: changeProfileDetails })
    } catch (err) {
        return res.status(500).send({
            status: false,
            message: "Error is: " + err.message
        })
    }
}

module.exports = {
    userCreation,
    userLogin,
    getProfile,
    updateProfile
}