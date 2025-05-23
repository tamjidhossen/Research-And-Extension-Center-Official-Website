const AdminNoticer = require("../models/admin.noticer.model.js");

const registerAdminNoticer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingAdmin = await AdminNoticer.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Admin with this email already exists",
        });
    }

    const adminNoticer = new AdminNoticer({ name, email, password });
    await adminNoticer.save();

    const token = adminNoticer.generateAuthToken();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      adminNoticer: { id: adminNoticer._id, name, email },
      token,
    });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while registering the admin",
      });
  }
};

const loginAdminNoticer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const adminNoticer = await AdminNoticer.findOne({ email }).select(
      "+password"
    );
    if (!adminNoticer) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await adminNoticer.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = adminNoticer.generateAuthToken();

    res.status(200).json({
      success: true,
      message: "Login successful",
      adminNoticer: {
        id: adminNoticer._id,
        name: adminNoticer.name,
        email: adminNoticer.email,
      },
      token,
    });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while logging in the admin",
      });
  }
};

const getAllAdminNoticer = async (req, res) => {
  try {
    const admins = await AdminNoticer.find({}, "_id name email");
    res.status(200).json({ success: true, admins });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while fetching admins",
      });
  }
};

const deleteAdminNoticer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdmin = await AdminNoticer.findByIdAndDelete(id);

    if (!deletedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while deleting the admin",
      });
  }
};

module.exports = {
  registerAdminNoticer,
  loginAdminNoticer,
  getAllAdminNoticer,
  deleteAdminNoticer,
};
