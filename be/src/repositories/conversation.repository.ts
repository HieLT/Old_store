import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import {Types} from "mongoose";
import Conversation from "../models/conversation";

const {ObjectId} = Types

class ConversationRepo {
    async createOrUpdate(userId: string, participantId: string, latestPostId: string | null): Promise<any> {
        try {
            console.log(userId, participantId)
            const re=await Conversation.find(
                {
                    participants: {$size: 2, $all: [userId, participantId]},
                    is_deleted: false
                }
            )
            console.log('re',re)
        }
        catch (err) {
            throw err;
        }
    }
}
export default new ConversationRepo();