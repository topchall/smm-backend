const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PanelSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId
  },
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  api_url: {
    type: String,
    required: true
  },
  api_key: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId
      },
      text: {
        type: String
      },
      name: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('panel', PanelSchema);
