import { Request, Response } from "express";
import { ResourceNotFound } from "../../../errors/httpErrors";
import {
  getLimit,
  getPage,
  getStartDate,
  getEndDate,
} from "../../../utils/dataFilters";
import Blog from "../../../db/models/blog.model";

type QueryParams = {
  startDate?: Date;
  endDate?: Date;
  limit?: string;
  page?: string;
};
class BlogController {
  async createBlog(req: Request, res: Response) {
    const { body } = req;

    const newBlogData = {
      billboardType: body.billboardType,
      billboardImage: body.billboardImage,
      billboardTitle: body.billboardTitle,
      billboardBody: body.billboardBody,
    };

    // Create the blog
    const newBlog = await Blog.create(newBlogData);

    res.created(newBlog);
  }

  async updateBlog(req: Request, res: Response) {
    const { blogId } = req.params;
    const { body } = req;
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, body, {
      new: true,
    });
    if (!updatedBlog) {
      throw new ResourceNotFound(
        `Blog with ID ${blogId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }
    res.ok(updatedBlog);
  }

  async getBlogs(req: Request, res: Response) {
    const queryParams: QueryParams = req.query;
    const startDate = getStartDate(queryParams.startDate);
    const endDate = getEndDate(queryParams.endDate);
    const limit = getLimit(queryParams.limit);
    const page = getPage(queryParams.page);

    const query = Blog.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(limit * (page - 1));

    const totalInvoices = await Blog.countDocuments(query);

    // const invoices = await query.select(invoiceField.join(" "));

    res.ok({ totalInvoices }, { page, limit, startDate, endDate });
  }

  async getBlogById(req: Request, res: Response) {
    const { blogId } = req.params;
    if (!blogId) {
      throw new ResourceNotFound("blogId is missing.", "RESOURCE_NOT_FOUND");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new ResourceNotFound(
        `Blog with ID ${blogId} not found.`,
        "RESOURCE_NOT_FOUND"
      );
    }

    res.ok(blog);
  }
}

export default new BlogController();
