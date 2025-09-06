const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Firebase සම්බන්ධ කිරීම
// serviceAccountKey.json file එක දැන් අවශ්‍ය නෑ.
// අපි Railway එකේ Variables වලින් තොරතුරු ගන්නවා.
const serviceAccountConfig = {
  projectId: "
servitrack-project", // <-- ඔබේ Firebase Project ID එක මෙතනට දාන්න
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // .replace() මගින් private key එකේ තියෙන \n අක්ෂර හරි විදිහට සකසනවා
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountConfig),
  databaseURL: process.env.DATABASE_URL // <-- Railway වලට ගැලපෙන විදිහට වෙනස් කළා
});






// Realtime Database එකට reference එක හදාගන්නවා
const db = admin.database();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API: අලුත් feedback ලබාගෙන Realtime Database එකේ save කිරීම
app.post('/api/feedback', async (req, res) => {
    try {
        const newFeedback = req.body;
        const feedbackRef = db.ref('feedback');
        await feedbackRef.push(newFeedback);

        console.log('New feedback saved to Realtime Database.');
        res.status(201).json({ message: 'Feedback received and saved successfully!' });
    } catch (error) {
        console.error("Error saving to Realtime Database:", error);
        res.status(500).json({ message: 'Failed to save feedback.' });
    }
});

// API: Managerට සියලු feedback, Realtime Database එකෙන් ලබා දීම
app.get('/api/feedback', async (req, res) => {
    try {
        const feedbackRef = db.ref('feedback');
        const snapshot = await feedbackRef.once('value');
        const feedbackData = snapshot.val();

        if (feedbackData) {
            const allFeedback = Object.values(feedbackData);
            allFeedback.sort((a, b) => new Date(b.submission_timestamp) - new Date(a.submission_timestamp));
            console.log(`Sending ${allFeedback.length} feedback entries from Realtime Database.`);
            res.json(allFeedback);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error("Error fetching from Realtime Database:", error);
        res.status(500).json({ message: 'Failed to fetch feedback.' });
    }
});

app.listen(PORT, () => {
    console.log(`ServiTrack server is running on port ${PORT}`);
});