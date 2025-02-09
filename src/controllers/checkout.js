const jwt = require('jsonwebtoken')
const stripe = require('stripe')(process.env.STRIPE_KEY)

const { User } = require('../models/user')
const { Product } = require('../models/product')
const orderController = require('../controllers/orders')


exports.checkout = async () => {
  const accessToken = req.header('Authorization').replace('Bearer', '').trim()
  const tokenData = jwt.decode(accessToken)

  const user = await User.findById(tokenData.id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  for (const cartItem of req.body.cartItems) {
    const product = await Product.findById(cartItem.product)
    if (!product) {
      return res.status(404).json({ message: `${cartItem.name} not found` })
    } else if (!cartItem.reserved && product.countInStock < cartItem.quantity) {
      return res.status(400).json({ message: `${product.name}\nOrder for ${cartItem.quantity}, but ${product.countInStock} left in stock` })
    }
  }
  let customerId
  if (user.paymentCustomerId) {
    customerId = user.paymentCustomerId
  } {
    const customer = await stripe.customers.create({
      metadata: { userId: tokenData.id }
    })
    customerId = customer.id
  }
  const session = await stripe.checkout.session.create({
    line_items: req.body.cartItem.map((items) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: items.name,
            image: image.images,
            metadata: {
              productId: items.productId,
              cartProductId: items.cartProductId,
              selectedSize: items.selectedSize ?? undefined,
              selectedColor: items.selectedColor ?? undefined
            }
          },
          unit_amount: (items.price * 100).toFixed(0)
        },
        quantity: items.quantity
      }
    }),
    payment_method_options: {
      card: { setup_future_usage: 'on_session' }
    },
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_contries: [
        'AF', 'AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ',
        'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BT', 'BO', 'BA',
        'BW', 'BR', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'CF',
        'TD', 'CL', 'CN', 'CO', 'KM', 'CD', 'CG', 'CR', 'HR', 'CU', 'CY',
        'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE',
        'SZ', 'ET', 'FJ', 'FI', 'FR', 'GA', 'GM', 'GE', 'DE', 'GH', 'GR',
        'GD', 'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HU', 'IS', 'IN', 'ID',
        'IR', 'IQ', 'IE', 'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE', 'KI',
        'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI',
        'LT', 'LU', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU',
        'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM', 'NA', 'NR',
        'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'NO', 'OM', 'PK', 'PW', 'PA',
        'PG', 'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RU', 'RW', 'KN',
        'LC', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG',
        'SK', 'SI', 'SB', 'SO', 'ZA', 'SS', 'ES', 'LK', 'SD', 'SR', 'SE',
        'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN',
        'TR', 'TM', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ', 'VU', 'VA',
        'VE', 'VN', 'YE', 'ZM', 'ZW'
      ],
    },
    phone_number_collection: { enabled: true },
    customer: customerId,
    mode: 'payment',
    success_url: 'http://luongtopp.com/payment-success',
    cancel_url: 'http://luongtopp.com/payment-false'
  })
  res.status(201).json({ url: session.url })
}

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  }
  catch (error) {
    console.error('Webhook Error:', error.message)
    response.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.complete') {
    const session = event.data.object
    stripe.customers.retrieve(session.customer).then(async (customer) => {
      const lineItems = await stripe.checkout.session.listLineItem(
        session.id,
        { expand: ['data.price.product'] }
      )
      const orderItem = lineItems.data.map((item) => {
        return {
          quantity: item.quantity,
          product: item.price.product.metadata,
          cartProductid: item.price.product.metadata.cartProductId,
          productPrice: item.price.unit_amount / 100,
          productName: item.product.name,
          productImage: item.price.product.images[0],
          selectedSize: item.price.product.metadata.selectedSize ?? undefined,
          selectedColor: item.price.product.metadata.selectedColor ?? undefined,
        }
      })
      const address = session.shipping_details?.address ?? session.customer_details.address
      const order = orderController.addOrder({
        orderItem: orderItems,
        shippingAddress: address.line1 === 'N/A' ? address.line2 : address.line1,
        city: address.city,
        postalCode: address.postal_code,
        country: address.country,
        phone: session.customer_details.phone,
        totalPrice: session.amount_total / 100,
        user: customer.metadata.userId,
        paymentId: session.payment_intent
      })
      let user = await User.findById(customer.metatdata.userId)
      if (user && !user.paymentCustomerId) {
        user = await User.findByIdAndDelete(
          customer.metadata.userId,
          { paymentCustomerId: session.customer },
          { new: true }
        )
      }
      const leanOrder = order.toObject()
      leanOrder['orderItems'] = orderItems

    })
  } else {
    console.log(`Unhandled event type ${event.type}`)
  }
  res.send().end()
}




