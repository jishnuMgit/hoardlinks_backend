import express from 'express'
import { createDistrict, getAllDistricts, getDistrictsById } from '##/controllers/districtControllers.js'

const router = express.Router()


router.route('/create').post(createDistrict)
router.route('/getAll').get(getAllDistricts)
router.route('/get/:id').get(getDistrictsById)


export default router
