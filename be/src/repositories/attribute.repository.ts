import Attribute from "../models/attribute";
import {updateAttributesSchema} from "../requests/category.request";
import {checkIfTwoArrayEqualsUnordered, checkIsObjectId, getDetailErrorMessage} from "../utils/helpers";
import _ from "lodash";
import {Types} from "mongoose";
import Category from "../models/category";

const {ObjectId} = Types

interface IAttribute {
    _id?: string,
    label: string,
    input_type: string,
    initial_value: string[] | [],
    is_required: boolean
}

class AttributeRepo {
    async getAttribute(attributeId: string): Promise<IAttribute | null> {
        try {
            const result = await Attribute.findById(attributeId)
            if (result) {
                return {
                    ...result,
                    _id: result._id.toString(), 
                } as IAttribute;
            }
            return null;
        } catch (error) {
            return null;
        }
    }
    async getAttributesRequired(categoryId: string): Promise<any> {
        try {
            const attributes = await Attribute.find(
                {
                    category_id: categoryId,
                    is_required: true,
                    is_deleted: false
                },
                {
                    is_deleted: 0,
                    __v: 0
                }
            )
            return attributes;
        } catch (error) {
            console.error('Error fetching required attributes:', error);
            return [];
        }
    }
    
    async getAttributes(categoryId: string): Promise<any> {
        try {
            const attributes = await Attribute.find(
                {
                    category_id: categoryId,
                    is_deleted: false
                }, {
                    is_deleted: 0,
                    __v: 0
                })
            return attributes;
        } catch {
            return null;
        }
    }

    async handleUpdateAttributes(categoryId: string, requestBody: {
        attributes: IAttribute[]
    }, res: any): Promise<any> {
        try {
            /* Validation */
            if (!checkIsObjectId(categoryId)) {
                return res.status(400).send({message: 'ID danh mục không hợp lệ'})
            }
            const category = await Category.findOne({_id: new ObjectId(categoryId), is_deleted: false})
            if (!category) {
                return res.status(400).send({message: 'Vui lòng hiện danh mục trước khi cập nhật'})
            }
            const {error} = updateAttributesSchema.body.validate(
                requestBody, {abortEarly: false}
            )
            if (error) {
                return res.status(400).send({
                    message: 'Lỗi yêu cầu',
                    details: getDetailErrorMessage(error)
                })
            }

            const attributes = await Attribute.find({category_id: new ObjectId(categoryId), is_deleted: false})
            if (attributes?.length === 0) {
                /* Add new attributes if has no attributes in db */
                await Attribute.insertMany([...requestBody.attributes?.map(item => ({
                    ...(_.omit(item, '_id')),
                    category_id: new ObjectId(categoryId)
                }))])
            } else {
                /* Check attribute ID */
                let invalidIds: string[] = []
                requestBody.attributes?.forEach(attr => {
                    if (attr?._id && !ObjectId.isValid(attr._id)) {
                        invalidIds = [...invalidIds, String(attr._id)]
                    }
                })
                if (invalidIds?.length > 0) {
                    return res.status(400).send(`ID ${invalidIds?.join(', ')} không hợp lệ`)
                }

                /* Check valid records and id */
                let oldRequestAttributeIds: string[] = []
                requestBody.attributes?.forEach(item => {
                    if (item.hasOwnProperty('_id')) {
                        // @ts-ignore
                        oldRequestAttributeIds = [...oldRequestAttributeIds, item._id]
                    }
                })
                const existIds = attributes?.map(item => String(item._id))
                let isValid = checkIfTwoArrayEqualsUnordered(oldRequestAttributeIds, existIds)
                if (!isValid) {
                    return res.status(400).send({message: 'Tồn tại thuộc tính không thuộc danh mục này hoặc không đủ thuộc tính'})
                }

                /* Check duplicate attribute label */
                let countLabels: any = {}
                let duplicateLabels: any = []
                requestBody.attributes?.forEach(item => {
                    if (!countLabels?.[item.label]) {
                        countLabels[item.label] = 1
                    } else {
                        countLabels[item.label] += 1
                    }
                })
                Object.keys(countLabels)?.forEach(key => {
                    if (countLabels[key] > 1) {
                        duplicateLabels = [...duplicateLabels, key]
                    }
                })

                if (duplicateLabels?.length > 0) {
                    return res.status(400).send({
                        message: 'Lỗi yêu cầu',
                        details: {
                            label: `Thuộc tính ${duplicateLabels?.join(', ')} bị lặp lại`
                        }
                    })
                }

                /* Update */
                const updatePromises = requestBody.attributes?.map(async (item) => {
                    const updatedAttribute = (item?._id && ObjectId.isValid(item?._id) &&
                        attributes?.some(attr => String(attr._id) === String(item?._id))) ?
                        {
                            ...item,
                            category_id: new ObjectId(categoryId)
                        } : {
                            ...(_.omit(item, '_id')),
                            category_id: new ObjectId(categoryId)
                        }
                        
                    if (item?._id) {
                        const existAttribute = attributes?.find(attr => String(attr._id) === String(item?._id))?.toObject()
                        // @ts-ignore
                        const {createdAt, updatedAt, category_id, __v, ...existAttrWithoutRedundant} = existAttribute

                        if (_.isEqual({
                            ...existAttrWithoutRedundant,
                            _id: String(existAttrWithoutRedundant._id)
                        }, item)) {
                            return new Promise((resolve) => {
                                return resolve(() => {
                                })
                            })
                        }

                        return Attribute.findOneAndUpdate({_id: item?._id}, updatedAttribute)
                    }
                    return Attribute.create(updatedAttribute)
                })
                await Promise.all([...updatePromises])
            }

            return res.status(200).send({message: 'Cập nhật thuộc tính thành công'})
        } catch (err) {
            return res.status(500).send({
                message: 'Lỗi máy chủ',
                detail: err
            })
        }
    }
}

export default new AttributeRepo();
