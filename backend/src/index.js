import app from "./app.js"; // Ensure the file extension is included
import connectDatabase from "./db/Database.js"; // Ensure the file extension is included

const PORT = process.env.PORT || 8001;

connectDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});