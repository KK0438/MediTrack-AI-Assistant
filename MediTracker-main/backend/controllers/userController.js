import User from "../models/user.js";
export const updateProfilePic = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    console.log("req.file:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: req.file.path },
      { new: true }
    );

    res.status(200).json({
      message: "Profile picture updated",
      profilePic: updatedUser.profilePic,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};