import express from 'express'
import authRoutes from './authRoutes.js'

const router = express.Router()

// API /api/v1
router
  .use(
    '/auth',
    /* #swagger.tags = ['Auth routes']
    #swagger.responses[500] */
    authRoutes
  )
  
export default router
