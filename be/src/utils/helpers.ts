import Joi from "joi";
import {Types} from "mongoose";
const {ObjectId} = Types

export const getDetailErrorMessage = (error: Joi.ValidationError): any => {
    let details = {}
    error.details?.forEach((err: Joi.ValidationErrorItem) => {
        let key = err.context?.key
        if (key) {
            details = {
                ...details,
                [key]: err.message
            }
        }
    })

    return details
}

export const removeVietnameseTones = (str: string): string => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export const checkIsObjectId = (str: string): boolean => {
    return ObjectId.isValid(str)
}

export const checkIfTwoArrayEqualsUnordered = (arr1: string[], arr2: string[]): boolean => {
    if (arr1?.length !== arr2?.length) {
        return false
    }

    const elementCount: Map<string, number> = new Map()
    arr1.forEach((item: string) => {
        elementCount.set(item, (elementCount.get(item) || 0) + 1)
    })

    arr2.forEach((item: string) => {
        if (!elementCount.has(item)) {
            return false
        }
        // @ts-ignore
        elementCount.set(item, elementCount.get(item) - 1)
        if (elementCount.get(item) === 0) {
            elementCount.delete(item)
        }
    })

    return elementCount.size === 0
}