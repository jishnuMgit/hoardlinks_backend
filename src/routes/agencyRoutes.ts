import express from 'express'
import { createAgency,  getAllAgencies } from '##/controllers/agencyControllers.js'
import { getStateById } from '##/controllers/stateController.js'

const router = express.Router()


router.route('/create').post(createAgency)
router.route('/getAll').get(getAllAgencies) // To be implemented
router.route('/get/:id').get(getStateById) // To be implemented
export default router
