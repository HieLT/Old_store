import Attribute, {IRequestAttribute} from "../models/attribute";
import {createCategorySchema, updateCategorySchema} from "../requests/category.request";
import {checkIsObjectId, getDetailErrorMessage, removeVietnameseTones} from "../utils/helpers";
import Category from "../models/category";
import {DEFAULT_GET_QUERY} from "../utils/constants";
import _, {isSafeInteger} from "lodash";
import {Types} from "mongoose";
import {ACCOUNT_ROLE, VISIBLE_ACTION} from "../utils/enum";

const {ObjectId} = Types

interface IQuery {
    q?: string,
    page?: number,
    page_size?: number,
    column?: string,
    sort_order?: number
}

interface IUpdateCategoryData {
    name: string,
    description: string
}

class CategoryRepo {
    async handleGetCategories({q, page, page_size, column, sort_order}: IQuery, role: string, res: any) {
        const isAdmin = role === ACCOUNT_ROLE.ADMIN
        try {
            const currentPage: number = (_.isNaN(page) || Number(page) <= 0 || !page) ? DEFAULT_GET_QUERY.PAGE : Number(page)
            const pageSize: number = (_.isNaN(page_size) || Number(page_size) <= 0 || !page_size) ? DEFAULT_GET_QUERY.PAGE_SIZE : Number(page_size)
            const searchStringRegex = q ? new RegExp(removeVietnameseTones(q), 'i') : ''
            let sortOrder = DEFAULT_GET_QUERY.SORT_ORDER
            const sortColumn = column || DEFAULT_GET_QUERY.COLUMN

            try {
                if (sort_order !== undefined) {
                    const order = Number(sort_order)
                    if (isSafeInteger(order) && order >= -1 && order <= 1) {
                        sortOrder = order === 0 ? DEFAULT_GET_QUERY.SORT_ORDER : order
                    }
                }
            } catch (e) {
                sortOrder = DEFAULT_GET_QUERY.SORT_ORDER
            }

            let condition: any = !isAdmin ? [{$match: {is_deleted: false}}] : []
            const totalQueryCondition = !isAdmin ? {is_deleted: false} : {}
            const total = await Category.countDocuments({...totalQueryCondition})

            if (searchStringRegex) {
                condition = [...condition, {$match: {name: searchStringRegex}}]
            }
            // @ts-ignore
            if (sortOrder) {
                condition = [...condition, {$sort: {[sortColumn]: sortOrder}}]
            }

            condition = [
                ...condition,
                {$skip: (currentPage - 1) * pageSize},
                {$limit: pageSize}
            ]

            condition = isAdmin ? [
                ...condition,
                {
                    $lookup: {
                        from: 'attributes',
                        localField: '_id',
                        foreignField: 'category_id',
                        as: 'attributes'
                    }
                },
                {$project: {__v: 0, 'attributes.__v': 0}}
            ] : [...condition, {$project: {__v: 0}}]

            const categories = await Category.aggregate([...condition])

            return res.status(200).send({
                categories,
                metadata: {
                    page: currentPage,
                    pageSize,
                    total
                }
            })

        } catch (err) {
            return res.status(500).send({
                message: 'Lỗi máy chủ',
                details: err
            })
        }
    }

    async getAllCategoriesForPublic(reqQuery: IQuery, res: any): Promise<any> {
        return this.handleGetCategories(reqQuery, ACCOUNT_ROLE.USER, res)
    }

    async getAllCategoriesForAdmin(reqQuery: IQuery, res: any): Promise<any> {
        return this.handleGetCategories(reqQuery, ACCOUNT_ROLE.ADMIN, res)
    }

    async handleCreateCategory(requestBody: {
        name: string,
        description: string,
        attributes: IRequestAttribute[]
    }, res: any): Promise<any> {
        try {
            /* Validation */
            const {name, description, attributes} = requestBody
            const {error} = createCategorySchema.body.validate(
                requestBody, {abortEarly: false}
            )
            if (error) {
                return res.status(400).send({
                    message: 'Lỗi yêu cầu',
                    details: getDetailErrorMessage(error)
                })
            }

            /* Check if category name exists */
            const isCategoryExist = await Category.findOne({name, is_deleted: false})
            if (isCategoryExist) {
                return res.status(400).send({message: 'Danh mục đã tồn tại'})
            }

            /* Create new */
            const newCategory = await Category.create({name, description: description || null})
            if (attributes?.length > 0) {
                Promise.all(attributes?.map(async (item: IRequestAttribute) => {
                    return Attribute.create({
                        label: item.label,
                        input_type: item.input_type,
                        initial_value: item.initial_value,
                        is_required: item.is_required,
                        category_id: newCategory._id
                    })
                }))
                    .then()
                    .catch(() => {
                        return res.status(500).send({message: 'Lỗi máy chủ'})
                    })
            }

            return res.status(201).send({message: 'Tạo danh mục sản phẩm thành công'})
        } catch (err) {
            return res.status(500).send({message: 'Lỗi máy chủ'})
        }
    }

    async handleUpdateCategory(categoryId: string, updateCategoryData: IUpdateCategoryData, res: any): Promise<any> {
        try {
            /* Validation */
            if (!checkIsObjectId(categoryId)) {
                return res.status(400).send({message: 'ID danh mục không hợp lệ'})
            }
            const categoryObjectId = new ObjectId(categoryId)
            const category = await Category.findOne({_id: categoryObjectId})
            if (!category) {
                return res.status(404).send({message: 'Danh mục không tồn tại'})
            }

            const {error} = updateCategorySchema.body.validate(updateCategoryData, {abortEarly: false})
            if (error) {
                return res.status(400).send({
                    message: 'Lỗi yêu cầu',
                    details: getDetailErrorMessage(error)
                })
            }

            const isExistCategory = await Category.findOne({
                name: updateCategoryData.name,
                _id: {$ne: categoryObjectId},
                is_deleted: false
            })
            if (isExistCategory) {
                return res.status(400).send({
                    message: 'Lỗi yêu cầu',
                    details: {
                        name: 'Tên danh mục đã tồn tại'
                    }
                })
            }

            /* Update */
            category.name = updateCategoryData.name
            category.description = updateCategoryData.description
            await category.save()

            return res.status(200).send({message: 'Cập nhật danh mục thành công'})

        } catch (err) {
            return res.status(500).send({
                message: 'Lỗi máy chủ',
                detail: err
            })
        }
    }

    async handleHideOrShowCategory(categoryId: string, {type}: { type: string }, res: any): Promise<any> {
        try {
            /* Validation */
            const isDeleted = type === VISIBLE_ACTION.HIDE

            if (!checkIsObjectId(categoryId)) {
                return res.status(400).send({message: 'ID danh mục không hợp lệ'})
            }
            if (type !== VISIBLE_ACTION.HIDE && type !== VISIBLE_ACTION.SHOW) {
                return res.status(400).send({message: 'Trường type không hợp lệ'})
            }
            const categoryObjectId = new ObjectId(categoryId)
            let category;
            if (type === VISIBLE_ACTION.HIDE) {
                category = await Category.findOne({_id: categoryObjectId, is_deleted: false})
                if (!category) {
                    return res.status(404).send({message: 'Danh mục không tồn tại hoặc đã bị ẩn trước đó'})
                }
            } else {
                category = await Category.findOne({_id: categoryObjectId, is_deleted: true})
                if (!category) {
                    return res.status(404).send({message: 'Danh mục đang được hiển thị'})
                }
            }

            category.is_deleted = isDeleted
            await Promise.all([
                category.save(),
                Attribute.updateMany(
                    {
                        category_id: categoryObjectId,
                        is_deleted: !isDeleted
                    },
                    {$set: {is_deleted: isDeleted}}
                )
            ])

            return res.status(200).send(`${isDeleted ? 'Ẩn danh mục thành công' : 'Đã hiển thị danh mục'}`)
        } catch (err) {
            return res.status(500).send({
                message: 'Lỗi máy chủ',
                detail: err
            })
        }
    }
}

export default new CategoryRepo();