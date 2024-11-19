import Post, {IPost} from '../models/post';
import {POST_STATUS} from "../utils/enum";
import _ from "lodash";
import {DEFAULT_GET_QUERY} from "../utils/constants";
import {Types} from "mongoose";

const {ObjectId} = Types

interface IFilterQuery {
    search?: string,
    page?: number | string,
    column?: string,
    sort_order: any
}

class PostRepo {
    async getAllMyPosts(posterId: string, status: string, {
        search,
        page,
        column,
        sort_order
    }: IFilterQuery): Promise<any> {
        try {
            let searchQuery = search ? {title: {$regex: search, $options: 'i'}} : {}
            const currentPage: number = (_.isNaN(page) || Number(page) <= 0 || !page) ? DEFAULT_GET_QUERY.PAGE : Number(page)
            const pageSize: number = DEFAULT_GET_QUERY.PAGE_SIZE
            const sortColumn = column || DEFAULT_GET_QUERY.COLUMN
            const sortOrder = sort_order ? Number(sort_order) : -1
            const [total, posts] = await Promise.all([
                Post.countDocuments({poster_id: posterId, is_deleted: false}),
                Post.aggregate([
                    {
                        $match: {
                            ...searchQuery,
                            poster_id: posterId,
                            is_deleted: false,
                            status
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'product_id',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {$unwind: {path: '$product', preserveNullAndEmptyArrays: true}},
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'product.category_id',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    {$unwind: {path: '$category', preserveNullAndEmptyArrays: true}},
                    {$sort: {[sortColumn]: sortOrder as any}},
                    {$skip: pageSize * (currentPage - 1)},
                    {$limit: pageSize},
                    {
                        $project: {
                            'category.is_deleted': 0,
                            'category.__v': 0,
                            'product.is_deleted': 0,
                            'product.__v': 0,
                            is_deleted: 0,
                            __v: 0
                        }
                    }
                ])
            ]);
            return {total, posts}
        } catch (err) {
            throw err;
        }
    }

    async getPost(postId: string): Promise<any> {
        try {
            return Post.findOne({_id: new ObjectId(postId), is_deleted: false, status: {$ne: POST_STATUS.DONE}}).lean();
        } catch (err) {
            throw err;
        }
    }

    async createPost(isValidate: boolean, post: Partial<IPost>): Promise<any> {
        try {
            const newPost = new Post(post);

            const result = await newPost.save({validateBeforeSave: isValidate});

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
            return false;
        }
    }

    async deletePost(postId: string, post: Partial<IPost>): Promise<boolean> {
        try {
            const result = await Post.findByIdAndUpdate(postId, {is_deleted: true});
            return result ? true : false;
        } catch (err) {
            return false;
        }
    }

    async restorePost(postId: string, post: Partial<IPost>): Promise<boolean> {
        try {
            const result = await Post.findByIdAndUpdate(postId, {is_deleted: false});
            return result ? true : false;
        } catch (err) {
            return false;
        }
    }
}

export default new PostRepo()