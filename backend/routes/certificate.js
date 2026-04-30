const express = require('express');
const router = express.Router();
const Certificate = require('../models/certificate'); // You'll create this schema
const Event = require('../models/Event');
const User = require('../models/User');

router.post('/generate', async (req, res) => {
    const { studentId, eventId } = req.body;

    try {
        const student = await User.findById(studentId);
        const event = await Event.findById(eventId);

        if (!student || !event) return res.status(404).json({ success: false, message: "Invalid student or event" });

        // Create certificate document
        const newCert = new Certificate({
            studentId,
            eventId,
            studentName: student.name,
            eventTitle: event.title,
            issueDate: new Date()
        });

        await newCert.save();

        res.json({ success: true, message: "Certificate generated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


router.get('/student/:studentId', async (req, res) => {
    try {
        const certificates = await Certificate.find({ studentId: req.params.studentId });
        res.json({ success: true, certificates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


module.exports = router;
