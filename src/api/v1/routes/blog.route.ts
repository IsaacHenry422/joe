import express from "express";
import controller from "../controllers/blog.controller";
import upload from "../../middlewares/multerMiddleware";
import { auth } from "../../middlewares/authMiddleware";

const blogRouter = express.Router();

// Get all blogs route
blogRouter.get("/", controller.getBlogs);

// Get a specific blog by ID route
blogRouter.get(
  "/:blogId",
  auth({ accountType: ["user", "admin"] }),
  controller.getBlogById
);

// Create a new blog route
blogRouter.post(
  "/create",
  auth({ accountType: ["admin"] }),
  controller.createBlog
);

blogRouter.patch(
  "/upload/image/:blogId",
  upload.single("blogImage"),
  auth({ accountType: ["admin"] }),
  controller.addBlogImage
);

blogRouter.patch(
  "/details/:blogId",
  auth({ accountType: ["admin"] }),
  controller.updateBlog
);

// Delete a blog by ID route
blogRouter.delete("/:blogId", controller.deleteBlogById);

export default blogRouter;
