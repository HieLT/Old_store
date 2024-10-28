import Post , { IPost} from '../models/post';

class PostRepo {
    async getPost(userId : string): Promise<any> {
        try{
            const result = await Post.find({ poster_id: userId });
            return result;
        } catch(err){
            throw err;
        }
    }
    async createPost(isDraft : boolean, post: Partial <IPost>): Promise<boolean> {
        try{
            const newPost = new Post(post);

            const result = await newPost.save({validateBeforeSave: !isDraft});

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