import express from "express";
import controller from "../controllers/blog.controller";
import upload from "../../middlewares/multerMiddleware";

const blogRouter = express.Router();

// Get all blogs route
blogRouter.get("/", controller.getBlogs);

// Get a specific blog by ID route
blogRouter.get("/:blogId", controller.getBlogById);

// Create a new blog route
blogRouter.post("/create", controller.createBlog);

blogRouter.patch(
  "/upload/image",
  upload.single("blogImage"),
  controller.addBlogImage
);

blogRouter.patch("/details/:blogId", controller.updateBlog);

// Delete a blog by ID route
blogRouter.delete("/:blogId", controller.deleteBlogById);

export default blogRouter;
