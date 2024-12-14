import { BlogCreateBodyType, BlogListResType, BlogResType } from "../schemaValidations/blog.schema"
import http from "../untils/http"

const blogApiRequest = {
  // Get all blogs
  getBlogs: () =>
    http.get<BlogListResType>(`blog/list/all`),

  // Get single blog by ID  
  getBlogById: (blogId: number) =>
    http.get<BlogResType>(`blog/${blogId}`),

  // Get blogs by admin ID
  getBlogsByAdminId: (adminId: number) =>
    http.get<BlogListResType>(`blog/admin/${adminId}`),

  // Create new blog
  createBlog: (body: BlogCreateBodyType) =>
    http.post<BlogResType>(`blog/create`, body),

  // Update blog
  updateBlog: (blogId: number, body: BlogCreateBodyType) =>
    http.put<BlogResType>(`blog/update/${blogId}`, body),

  // Delete blog
  deleteBlog: (blogId: number) =>
    http.delete<BlogResType>(`blog/${blogId}`)
}

export default blogApiRequest