import { Types } from "mongoose";
import Rating, { IRating } from "../models/ratings";
import userRepository from "./user.repository";

const { ObjectId } = Types;

class RatingRepo {
    async getRatingsByUserId(userId: string): Promise<IRating[]> {
        try {
            const user = userRepository.getUserById(userId);
            if (!user) {
                throw new Error(
                    "Người dùng không tồn tại hoặc tài khoản đã bị khóa"
                );
            }
            const userRatings = await Rating.aggregate([
                {
                    $match: {
                        reviewee_id: new ObjectId(userId),
                        is_deleted: false,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "reviewer_id",
                        foreignField: "_id",
                        as: "reviewer",
                    },
                },
                { $unwind: "$reviewer" },
                { $match: { "reviewer.is_deleted": false } },
                { $sort: { createdAt: -1 } },
                {
                    $project: {
                        "reviewer.password": 0,
                        "reviewer.is_deleted": 0,
                        is_deleted: 0,
                    },
                },
            ]);

            return userRatings;
        } catch (err) {
            throw err;
        }
    }

    async rateUser(
        reviewerId: string,
        revieweeId: string,
        star: number,
        comment: string
    ): Promise<any> {
        try {
            await Rating.create({
                reviewee_id: revieweeId,
                reviewer_id: reviewerId,
                stars: star,
                comment,
            });
        } catch (err) {
            throw err;
        }
    }

    async deleteRating(reviewerId: string, ratingId: string): Promise<any> {
        try {
            let rating = await Rating.findOne({
                _id: new ObjectId(ratingId),
                reviewer_id: new ObjectId(reviewerId),
                is_deleted: false,
            });
            if (!rating) {
                throw new Error("Không có bản đánh giá này");
            }
            rating.is_deleted = true;
            await rating.save();
        } catch (err) {
            throw err;
        }
    }
}

export default new RatingRepo();
