import { z } from "zod";

export const BlogSchema = z.object({
  blogId: z.number(),
  author: z.string(),
  title: z.string(),
  content: z.string(),
  date: z.string(),
  origin: z.string(),
  admin_id: z.number(),
  thumbnail: z.string().optional()
});

export const BlogCreateBody = z.object({
  author: z.string(),
  title: z.string(),
  content: z.string(),
  date: z.string(),
  origin: z.string(),
  admin_id: z.number()
});

export const BlogRes = z.object({
  code: z.string(),
  message: z.string(),
  data: BlogSchema
});

export const BlogListRes = z.object({
  code: z.string(),
  message: z.string(),
  data: z.array(BlogSchema)
});

export type Blog = z.TypeOf<typeof BlogSchema>;
export type BlogCreateBodyType = z.TypeOf<typeof BlogCreateBody>;
export type BlogResType = z.TypeOf<typeof BlogRes>;
export type BlogListResType = z.TypeOf<typeof BlogListRes>;
