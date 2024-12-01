const { Schema, model } = require('mongoose')

const tokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, require: true, ref: 'User' },
  refreshToken: { type: String, require: true },
  accessToken: String,
  createdAt: { type: Date, default: Date.now, expires: 60 * 86400 }
})

exports.Token = model('Token', tokenSchema)
