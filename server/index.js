const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post("/download-pdf", async (req, res) => {
  const { url } = req.body;

  
  const publicDir = path.join(__dirname, "public");
  const filePath = path.join(publicDir, "workOrder.pdf");

  try {
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    
    const writer = fs.createWriteStream(filePath);

    
    response.data.pipe(writer);

    
    writer.on("finish", async () => {
      console.log("File downloaded successfully");

      try {
        
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);

        
        res.json({ text: pdfData.text });
      } catch (pdfError) {
        console.error("Error parsing PDF: ", pdfError.message);
        res.status(500).json({ message: "Error parsing PDF file" });
      }
    });

    writer.on("error", (err) => {
      console.error("Error writing file:", err);
      res.status(500).json({ message: "Error saving PDF file" });
    });
  } catch (error) {
    console.error("Error downloading PDF:", error.message);
    res.status(500).json({ message: "Error downloading PDF" });
  }
});


process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
