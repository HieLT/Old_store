import { ClientSession } from 'mongoose';
import Post, { IPost } from '../models/post';
import { any } from 'joi';

class PostRepo {
    async getPosts(
        userId: string,
        searchKey: string,
        status: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ total_page: number; posts: IPost[] }> {
        try {
            let searchQuery: any = {
                poster_id: userId
            };

            if (searchKey) searchQuery = { ...searchQuery, name: { $regex: searchKey, $options: 'i' } };
            if (status) searchQuery = { ...searchQuery, status };

            const [totalPosts, posts] = await Promise.all(
                [
                    Post.countDocuments({ poster_id: userId }),
                    Post.find(searchQuery)
                        .populate('product_id').populate('product_id.category_id')
                        .skip((page - 1) * limit)
                        .limit(limit)
                        .exec()
                ])

            const total_page = Math.ceil(totalPosts / limit) + 1;
            return {
                total_page,
                posts
            };
        } catch (err) {
            throw err;
        }
    }
    async getPost(userId: string): Promise<any> {
        try {
            const result = await Post.find({ poster_id: userId, is_deleted: false });
            return result;
        } catch (err) {
            throw err;
        }
    }
    async createPost(isValidate: boolean, post: Partial<IPost>, session: ClientSession): Promise<any> {
        try {
            const newPost = new Post(post);

            const result = await newPost.save({ session, validateBeforeSave: isValidate });

            return result ? result : false;
        } catch (err) {
            throw err;
        }
    }

    async updatePost(postId: string, post: Partial<IPost>): Promise<boolean> {
        try {
            const result = await Post.findByIdAndUpdate(postId, post);
            return result ? true : false;
        } catch (err) {
            throw err;
        }
    }

    async deletePost(postId: string, post: Partial<IPost>): Promise<boolean> {
        try {
            const result = await Post.findByIdAndUpdate(postId, { is_deleted: true });
            return result ? true : false;
        } catch (err) {
            return false;
        }
    }
    async restorePost(postId: string, post: Partial<IPost>): Promise<boolean> {
        try {
            const result = await Post.findByIdAndUpdate(postId, { is_deleted: false });
            return result ? true : false;
        } catch (err) {
            return false;
        }
    }
}

export default new PostRepo()