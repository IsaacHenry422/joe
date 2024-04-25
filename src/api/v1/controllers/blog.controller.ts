import { Request, Response } from "express";
import { ResourceNotFound, BadRequest } from "../../../errors/httpErrors";
import { promises as fsPromises } from "fs";
import path from "path";
import { uploadPicture } from "../../../services/file.service";
import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";
import Blog from "../../../db/models/blog.model";
import { blogFields } from "../../../utils/fieldHelpers";
import * as validators from "../validators/blog.validator";

const awsBaseUrl = process.env.AWS_BASEURL;

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};
class BlogController {
  async createBlog(req: Request, res: Response) {
    // Create the invoice
    const { error, data } = validators.createBlogValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const { blogType, blogTitle, blogBody } = data;

    // Create the blog
    const blog = new Blog({
      blogType,
      blogTitle,
      blogBody,
    });

    const newBlog = await blog.save();

    res.created({ blog: newBlog, message: "blog created successfully." });
  }

  async addBlogImage(req: Request, res: Response) {
    const blogImage = req.file;

    const { blogId } = req.params;

    if (!blogImage) {
      throw new BadRequest("No blog image provided.", "MISSING_REQUIRED_FIELD");
    }

    const uploadedFile = blogImage as Express.Multer.File;

    const blogImageExtension = path.extname(uploadedFile.originalname);
    const blogImageKey = await uploadPicture(
      uploadedFile.path,
      "blog-image",
      blogImageExtension
    );
    await fsPromises.unlink(uploadedFile.path);

    const key = `${awsBaseUrl}/${blogImageKey}`;

    console.log(key);

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { blogImage: key, updatedAt: new Date() },
      { new: true }
    ).select(blogFields.join(" "));

    if (!blog) {
      throw new ResourceNotFound(
        `Blog ${blogId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok({
      updated: blog,
      message: "blog image uploaded successfully.",
    });
  }

  async updateBlog(req: Request, res: Response) {
    const { blogId } = req.params;

    const { error, data } = validators.updateBlogValidator(req.body);
    if (error) throw new BadRequest(error.message, error.code);

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, data, {
      new: true,
    });
    if (!updatedBlog) {
      throw new ResourceNotFound(
        `Blog with ID ${blogId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }
    res.ok({
      updatedBlog,
      message: "blog details updated successfully.",
    });
  }

  async getBlogs(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    const query = await Blog.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .select(blogFields.join(" "));

    const totalBlogs = await Blog.countDocuments(query);

    res.ok({ total: query, totalBlogs }, { page, limit, startDate, endDate });
  }

  async getBlogById(req: Request, res: Response) {
    const { blogId } = req.params;
    if (!blogId) {
      throw new ResourceNotFound("blogId is missing.", "RESOURCE_NOT_FOUND");
    }

    const blog = await Blog.findById(blogId).select(blogFields.join(" "));
    if (!blog) {
      throw new ResourceNotFound(
        `Blog with ID ${blogId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(blog);
  }

  async deleteBlogById(req: Request, res: Response) {
    const { blogId } = req.params;
    if (!blogId) {
      throw new BadRequest("blogId is missing.", "MISSING_REQUIRED_FIELD");
    }

    const deletedBlog = await Blog.findByIdAndDelete(blogId);
    if (!deletedBlog) {
      throw new ResourceNotFound(
        `Blog with ID ${blogId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.noContent();
  }
}

export default new BlogController();
