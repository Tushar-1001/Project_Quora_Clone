const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const questionController = require('../controllers/questionController')
const answerController = require('../controllers/answerController')

const middleware = require('../middlewares/auth')

//User's APIs -> Authentication required.
router.post('/register', userController.userCreation)
router.post('/login', userController.userLogin)
router.get('/user/:userId/profile', middleware.userAuth, userController.getProfile)
router.put('/user/:userId/profile', middleware.userAuth, userController.updateProfile)

//Question APIs -> No Authentication required.
router.post('/question',middleware.userAuth, questionController.postQuestion)
router.get('/questions', questionController.getAllQuestions)
router.get('/questions/:questionId', questionController.getQuestionById)
router.put('/questions/:questionId', middleware.userAuth,questionController.updateQuestion)
router.delete('/questions/:questionId',middleware.userAuth, questionController.deleteQuestions)

//Answer APIs -> No Authentication required.
router.post('/answer', middleware.userAuth, answerController.postAnswers)
router.get('/questions/:questionId/answer',  answerController.getAllAnswers)
router.put('/answer/:answerId',middleware.userAuth,  answerController.updateAnswer)
router.delete('/answers/:answerId',middleware.userAuth,  answerController.deleteAnswers)







module.exports = router;