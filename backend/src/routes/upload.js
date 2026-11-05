const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("../config/cloudinary"); // The config file you made earlier

// 1. Configure Multer to save incoming files temporarily to an 'uploads' folder
const upload = multer({ dest: "uploads/" });

// 2. Create the POST route ('myImage' is the name of the field coming from the frontend)
router.post("/upload-image", upload.single("myImage"), async (req, res) => {
  try {
    // Check if a file was actually sent
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // 3. Upload the temporary file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "my_project_images", // Optional: Creates a folder in your Cloudinary account
      use_filename: true,
    });

    // 4. Delete the temporary file from your backend server so it doesn't waste space
    fs.unlinkSync(req.file.path);

    // 5. Send the Cloudinary URL back to your frontend
    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url, // This is the public URL you will save in your database
      publicId: result.public_id, // Save this if you ever want to delete the image later
    });
  } catch (error) {
    console.error("Upload Error:", error);

    // If an error happens, try to clean up the temp file anyway
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: "Failed to upload image" });
  }
});

module.exports = router;
