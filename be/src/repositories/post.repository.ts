import Post , { IPost} from '../models/post';

class PostRepo {
    async createPost(post: Partial <IPost>): Promise<boolean> {
        try{
            const result = await Post.create(post);
            return result ? true : false;
        } catch(err){
            return false;
        }
    }

    async updatePost(postId: string, post: Partial <IPost>): Promise<boolean> {
        try{
            const result = await Post.findByIdAndUpdate(postId, post);
            return result ? true : false;
        } catch(err){
            return false;
        }
    }

    async deletePost(postId: string, post: Partial <IPost>): Promise<boolean> {
        try{
            const result = await Post.findByIdAndUpdate(postId, {is_deleted:true});
            return result ? true : false;
        } catch(err){
            return false;
        }
    }
    async restorePost(postId: string, post: Partial <IPost>): Promise<boolean> {
        try{
            const result = await Post.findByIdAndUpdate(postId, {is_deleted:false});
            return result ? true : false;
        } catch(err){
            return false;
        }
    }
}

export default new PostRepo()