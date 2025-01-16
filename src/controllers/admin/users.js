const { User } = require('../../models/user')
const { Order } = require('../../models/order')
const { OrderItem } = require('../../models/order_item')
const { CartProduct } = require('../../models/cart_product')
const { Token } = require('../../models/token')

exports.getUserCount = async function (req, res) {
  try {
    const userCount = await User.countDocument();

    if (!userCount) {
      res.status(500).json({ message: 'Could not count users' })
    }
    return res.status(200).json({ userCount })
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}

exports.deleteUser = async function (req, res) {
  try {
    const userId = req.params.id
    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ message: 'User not found!' })
    }

    const orders = await Order.find({ user })
    const orderItemIds = orders.flatMap((order) => order.orderItems)

    await Order.deleteMany({ user: userId })
    await OrderItem.deleteMany({ _id: { $in: orderItemIds } })

    await CartProduct.deleteMany({ _id: { $in: user.cart } })

    await User.findByIdAndUpdate(userId, { $pull: { cart: { $exists: true } } })

    await User.deleteOne({ _id: userId })

    await Token.deleteOne({ userId: userId })

    return res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}


