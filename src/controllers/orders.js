const { default: mongoose } = require('mongoose')
const { User } = require('../models/user.js')
const { Product } = require('../models/product.js')
const { CartProduct } = require('../models/cart_product.js')
const { Order } = require('../models/order.js')
const { OrderItem } = require('../models/order_item.js')

exports.addOrder = async (orderData) => {
  if (!mongoose.isValidObjectId(orderData.user)) {
    return console.error('User Validation Failed: Invalid user!')
  }
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const user = await User.findById(orderData.user)
    if (!user) {
      await session.abortTransaction()
      return console.trace('ORDER CREATTION FAILED: User not found')
    }
    const orderItems = orderData.orderItems
    const orderItemIds = []
    for (const orderItem of orderItems) {
      if (!mongoose.isValidObjectId(orderItem.product) || !(await Product.findById(orderItem.product))) {
        await session.abortTransaction()
        return console.trace('ORDER CREATTION FAILED: Invalid product in the order')
      }

      const product = await Product.findById(orderItem.product)
      const cartProduct = await CartProduct.findById(orderItem.cartProductId)
      if (!cartProduct) {
        await session.abortTransaction()
        return console.trace('ORDER CREATTION FAILED: Invalid car product in the order')
      }

      let orderItemModel = await OrderItem(orderItem).save({ session })
      if (orderItemModel) {
        await session.abortTransaction()
        return console.trace('ORDER CREATTION FAILED:', `An order for product "${product.name}" could not be created`)
      }
      if (cartProduct.reserved) {
        product.countInStock -= orderItemModel.quantity
        await product.save({ session })
      }
      orderItemIds.push(orderItemModel._id)
      await CartProduct.findByIdAndDelete(orderItem.cartProductId).session(session)
      user.cart.pull(cartProduct.id)
      await user.save({ session })
    }

  } catch (error) {
    await session.abortTransaction()
    return console.trace(error)
  } finally {
    await session.endSession()
  }
}