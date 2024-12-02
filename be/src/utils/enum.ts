import { CANCELLED } from "dns"

export const CATEGORY_ATTRIBUTE_TYPE = {
    TEXT: 'text',
    DROPDOWN: 'dropdown',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    DATE: 'date',
    TIME: 'time',
    COLOR_PICKER: 'color_picker'
}

export const ADMIN_ROLE = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin'
}

export const VISIBLE_ACTION = {
    HIDE: 'hide',
    SHOW: 'show'
}

export const ACCOUNT_ROLE = {
    USER: 'user',
    ADMIN: 'admin',
}

export const POST_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    HIDDEN: 'hidden',
    DRAFT: 'draft',
    DONE: 'done',
    EXPIRED: 'expired'
}

export const PRODUCT_CONDITION = {
    NEW: 'new',
    USED: "used",
    LIKE_NEW: "like_new"
}

export const MESSAGE_CONTENT_TYPE = {
    TEXT: 'text',
    LINK: 'link',
    FILE: 'file'
}

export const ORDER_STATUS= {
    WAITING_FOR_PAYMENT: 'waiting_for_payment',
    PROCESSING: 'processing',
    DERLIVERING: 'delivering',
    DELIVERED: 'delivered',
    RECEIVED: 'received',
    CANCELLED: 'cancelled'
}

export const PAYMENT_METHOD = {
    COD: 'cod',
    CREDIT : 'credit'
}

export const NOTIFICATION_TYPE =  {
    ORDER : 'order',
    POST : 'post'
}

export const NOTIFICATION_TITLE = {
    APPROVED_POST : 'Bài đăng của bạn đã được chấp thuận',
    REJECTED_POST: 'Bài đăng của bạn đã bị từ chối',
    PAYMENT_COD: 'Bạn có thông báo mới cho đơn mới',
    PAYMENT_CREDIT: 'Bạn có thông báo mới cho yêu cầu thanh toán đơn mới'
}
