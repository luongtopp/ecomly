const { Order } = require('../../models/order')
const { OrderItem } = require('../../models/order_item')

exports.getOrders = async (req, res) => {
  try {
    const order = await Order.find()
      .select('-statusHistory')
      .populate('user', 'name email')
      .sort({ dateOrdered: -1 })
      .populate({
        path: 'orderItems',
        populate: {
          path: 'product',
          select: 'name',
          populate: { path: 'category', select: name },
        }
      })
    if (!order) {
      return res.status(404).json({ message: 'Orders not found' })
    }
    return res.status(200).json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}

exports.addOrdersCount = async (req, res) => {
  try {
    const count = await Order.countDocuments()
    if (!count) {
      return res.status(500).json({
        message: 'Could not count orders!'
      })
    }
    return res.json({ count })

  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}

exports.changeOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id
    const newStatus = req.body.status

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(400).json({ message: 'Order not found' })
    }
    if (!order.statusHistory.include(orders.status)) {
      order.statusHistory.push(order.status)
    }
    order.status = newStatus
    order = await order.save()
    return res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    for (const orderItemId of order.orderItems) {
      await OrderItem.findByIdAndDelete(orderItemId)
    }
    return res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ type: error.type, message: error.message })
  }
}