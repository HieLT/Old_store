import Post_Purchaser_Request, {IPost_Purchaser_Request} from "../models/post_purchaser_request";
class Post_Purchaser_RequestRepo{
    async newPostPurchaserRequest(userId: string, postId: string): Promise<boolean> {
        try{
            const result = await Post_Purchaser_Request.create({
                user_id : userId,
                post_id : postId
            });
            return !!result;
        } catch(err){
            throw err;
        }
    }
    async setStatusPostPurchaserRequest(id: string, status: boolean): Promise<boolean> {
        try{
            const result = await Post_Purchaser_Request.findByIdAndUpdate(id, {status});

            return !!result;
        }catch(err){
            throw err;
        }
    }
    async deletePostPurchaserRequest(id: string): Promise<boolean> {
        try{
            const result = await Post_Purchaser_Request.findByIdAndUpdate(id, {is_deleted: true});
            
            return !!result;
        }catch(err){
            throw ;
        }
    }
}

export default Post_Purchaser_RequestRepo()