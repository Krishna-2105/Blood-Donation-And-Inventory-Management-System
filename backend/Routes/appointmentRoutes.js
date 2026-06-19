const express = require('express');
const router = express.Router();

const authMiddleWare = require('../middleware/authMiddleWare');
const roleMiddleware = require('../middleware/roleMiddleWare');

const {
  createAppointmentRoute,
  getDonorAppointmentsRoute,
  cancelAppointmentRoute,
  getBankAppointmentsRoute,
  updateAppointmentStatusRoute,
  getAllAppointmentsRoute
} = require('../controllers/appointmentControllers');

// Donor routes
router.post('/', authMiddleWare, roleMiddleware('DNR'), createAppointmentRoute);
router.get('/me', authMiddleWare, roleMiddleware('DNR'), getDonorAppointmentsRoute);
router.put('/cancel/:appointment_id', authMiddleWare, roleMiddleware('DNR'), cancelAppointmentRoute);

// Bank routes (BNK)
router.get('/bank/:bank_id', authMiddleWare, roleMiddleware('BNK'), getBankAppointmentsRoute);
router.patch('/bank/:appointment_id/status', authMiddleWare, roleMiddleware('BNK'), updateAppointmentStatusRoute);

// Admin routes
router.get('/all', authMiddleWare, roleMiddleware('ADM'), getAllAppointmentsRoute);

module.exports = router;
