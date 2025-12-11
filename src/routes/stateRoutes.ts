import express from 'express'
import { createState, getStateById, getStates } from '##/controllers/stateController.js'

const router = express.Router()


router.route('/create').post(createState)
router.route('/getAll').get(getStates)
router.route('/get/:id').get(getStateById)


export default router
